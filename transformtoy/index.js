/* jshint -W069, esversion:6 */
// @ts-check
export {};
import { createExample, makeSelect } from "./transformToy.js";

/**
 * Send the current page height to parent frame if in iframe
 */
let lastReportedHeight = 0;
function notifyParentOfHeight() {
    if (window.parent !== window) {
        // We're in an iframe
        const height = Math.max(
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight,
            document.body.scrollHeight,
            document.body.offsetHeight
        );
        // Only notify if height actually changed (with small tolerance for rounding)
        if (Math.abs(height - lastReportedHeight) > 2) {
            lastReportedHeight = height;
            window.parent.postMessage({ type: 'resize', height: height }, '*');
        }
    }
}

/**
 * Set up the demo
 */

let headingDiv = document.createElement("div");
headingDiv.id = "headingDiv";
document.getElementsByTagName("body")[0].appendChild(headingDiv);

let headerTitle = document.createElement("h1");
headerTitle.innerHTML = "2D Transformation Toy"
headingDiv.appendChild(headerTitle);

// Check URL for showHeader parameter
const urlParams = new URLSearchParams(window.location.search);
const showHeaderParam = urlParams.get('showHeader');
if (showHeaderParam === 'false') {
    headingDiv.style.display = "none";
}

// Create a container for selector and button
let controlsDiv = document.createElement("div");
controlsDiv.style.cssText = "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;";
headingDiv.appendChild(controlsDiv);

// Create a button to toggle interface visibility
let toggleInterfaceButton = document.createElement("button");
toggleInterfaceButton.innerHTML = "Hide Interface";
toggleInterfaceButton.style.cssText = "padding: 10px 15px; display: none; white-space: nowrap; flex-shrink: 0;";
toggleInterfaceButton.id = "toggleInterfaceButton";
controlsDiv.appendChild(toggleInterfaceButton);

let br = document.createElement("br");
document.getElementsByTagName("body")[0].appendChild(br);

// get the filename for the examples list from URL parameters
const filename = urlParams.get('file') || "examples.json";

fetch(filename).then(response => response.json())
    .then(data => selectAndGo(data))
    .catch(error => console.log(`Error loading ${filename} - ${error}`));

function selectAndGo(examples) {
    let titles = ["Please select one example"];

    /** @type {HTMLDivElement[]} */
    let exampleDivs = [];
    for (const e of examples) {
        let example = createExample(e.title, e.transformations);
        example.style.display = "none";
        exampleDivs.push(example);
        titles.push(e.title);
    }

    // make a dropdown menu to select examples
    let selectExample = makeSelect(titles, controlsDiv);
    selectExample.id = "exampleSelect";
    selectExample.style.cssText = "flex: 1; min-width: 200px;";
    
    // Move the button after the select in the DOM (so it appears on the right)
    controlsDiv.removeChild(toggleInterfaceButton);
    controlsDiv.appendChild(toggleInterfaceButton);

    // switch between different examples
    /** @type {HTMLDivElement | null} */
    let currentExample;
    selectExample.onchange = function () {

        if (currentExample) {
            currentExample.style.display = "none";
        }
        
        let selectedTitle = selectExample.options[selectExample.selectedIndex].text;
        
        // Sanitize title to match how IDs are created in transformToy.js
        const sanitizedTitle = selectedTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        
        // Reset currentExample
        currentExample = null;
        
        for (const ed of exampleDivs) {
            if (ed.id === sanitizedTitle + "-example") {
                currentExample = ed;
                break
            }
        }
        
        if (currentExample){ 
            
            // Get url parameters
            const urlParams = new URLSearchParams(window.location.search);
            
            // Update URL with demo name
            urlParams.set('demo', selectedTitle);
            const newUrl = window.location.pathname + '?' + urlParams.toString();
            window.history.pushState({demo: selectedTitle}, '', newUrl);

            currentExample.style.display = "block";
            
            // Notify parent frame of size change
            setTimeout(notifyParentOfHeight, 100);
        } else {
            // If no demo selected (back to "Please select"), remove demo param
            toggleInterfaceButton.style.display = "none";
            
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.delete('demo');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.pushState({}, '', newUrl);
        }
    };
    
    // Check URL for demo parameter and auto-select if found
    const urlParams = new URLSearchParams(window.location.search);
    const demoName = urlParams.get('demo');

    if (demoName) {

        // Find matching demo in the titles list
        let matchIndex = -1;
        for (let i = 0; i < titles.length; i++) {
            let title = titles[i].replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            let demo  = demoName .replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            if (title === demo) {
                matchIndex = i;
                break;
            }
        }

        // If found, select it
        if (matchIndex > 0) {
            selectExample.selectedIndex = matchIndex;
            selectExample.onchange();
        } else {
            console.warn(`Demo "${demoName}" not found in examples.`);
        }
    }
    
    // Set up ResizeObserver to monitor content size changes
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            notifyParentOfHeight();
        });
        resizeObserver.observe(document.body);
    }
    
    // Initial notification
    setTimeout(notifyParentOfHeight, 100);
}