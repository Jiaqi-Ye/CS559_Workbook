/* utilities to put student work in local storage
 * the initial version was written by Gemini (in response to me asking for the best way to do it)

the idea:
All form elements on the pages automatically save their values to local storage.

This only works if the URL (host) is consistent.

There are a lot of "magic checking widgets" that can only operate 
when this works - they need to run AFTER the local storage has been restored.

So, while it's messy, all of the widget updating has to be in this
file. Anything that requires getting data after load.
*/ 

/**
 * autosave.js
 * A serverless workbook engine using LocalStorage.
 * FIX: Now filters keys to ignore localhost "pollution".
 * FEATURE: specific diff logging for debugging.
 */

// rather than hardcoding the path, fetch it front the page
const jsonFileURL = document.getElementById("localstore-json-file");
const jsonFilePath = jsonFileURL ? jsonFileURL.href : null;

/* prepare an element to be part of the local storage system
 * this used to just be part of the loop, 
 * but it needs to have an access point for other code to use it.
 * that way dynamically created elements can also use it.
 */
window.initElemment = function(element) {
    if (!element.id) return;

    if (element.classList.contains('nostore')) return;

    const usePage = !element.classList.contains('sitekey');
    const storageKey = getStoragePrefix(usePage) + element.id;

    // A. Restore Data
    const storedData = localStorage.getItem(storageKey);
    if (storedData !== null) restoreValue(element, storedData);

    // B. Save Data Listener
    const handler = () => {
        const val = serializeValue(element);
        localStorage.setItem(storageKey, val);
        // Optional: Mark status as 'modified' immediately?
        // updateStatusUI('warning', 'Unsaved changes...');
    };
    element.addEventListener('input', handler);
    element.addEventListener('change', handler);
}

// ON LOAD: Initialize all inputs
document.addEventListener("DOMContentLoaded", () => {
    // 1. VERIFY CONFIGURATION
    if (typeof WORKBOOK_CONFIG === 'undefined') {
        console.error("Workbook Error: WORKBOOK_CONFIG is missing.");
        return;
    }

    // 2. INITIALIZE INPUTS
    const formElements = document.querySelectorAll('input, textarea, select');

    formElements.forEach(element => window.initElemment(element));

    // 3. AUTOMATICALLY CHECK STATUS ON LOAD
    if (document.getElementById('json-status-widget') || document.getElementById('status-widget')) {
        checkJSONStatus();
    }
    // this checks to see if there are any widgets to be updated
    updateSubmissionSatus();

    // 4. UPDATE LOCAL CHECKS
    if (window.runLocalChecks) window.runLocalChecks();
});

// --- CORE HELPER FUNCTIONS ---

function getStoragePrefix(usePage = true) {
    if (typeof WORKBOOK_CONFIG === 'undefined') return "";
    const { workbookId, pageId } = WORKBOOK_CONFIG;
    return usePage ? `${workbookId}_${pageId}_` : `${workbookId}_`;
}

function getStoredValue(fieldId, usePage = true) {
    const key = getStoragePrefix(usePage) + fieldId;
    const results = localStorage.getItem(key) || "";
    // console.log(`getStoredValue(${fieldId}, ${usePage}): key='${key}' value='${results}'`);
    return results;
}

function setStoredValue(fieldId, value, usePage = true) {
    const key = getStoragePrefix(usePage) + fieldId;
    localStorage.setItem(key, value);
}

function serializeValue(element) {
    if (element.type === 'checkbox') return element.checked;
    if (element.type === 'radio') return element.checked ? element.value : null;
    if (element.tagName === 'SELECT' && element.multiple) {
        return JSON.stringify(Array.from(element.selectedOptions).map(opt => opt.value));
    }
    return element.value;
}

function restoreValue(element, value) {
    if (element.type === 'checkbox') element.checked = (value === 'true');
    else if (element.type === 'radio') { if (value === element.value) element.checked = true; }
    else if (element.tagName === 'SELECT' && element.multiple) {
        try {
            const values = JSON.parse(value);
            Array.from(element.options).forEach(opt => { opt.selected = values.includes(opt.value); });
        } catch (e) {}
    } else element.value = value;
}

/**
 * Filter: Extract only the keys relevant to this specific workbook
 * This fixes the bug where "live server" keys caused validation failures.
 */
function getWorkbookData() {
    const wbId = WORKBOOK_CONFIG.workbookId; // e.g. "wb2025"
    const relevantData = {};
    
    // Loop through ALL storage, but only keep our keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(wbId)) {
            relevantData[key] = localStorage.getItem(key);
        }
    }
    return relevantData;
}

// --- PUBLIC API ---
window.savejson = async function() {
    const wbId = WORKBOOK_CONFIG.workbookId;
    const filename = WORKBOOK_CONFIG.savefilename;
    
    // FIX: Only download filtered data
    const dataStr = JSON.stringify(getWorkbookData(), null, 2) + "\n";

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'JSON Workbook Data', accept: { 'application/json': ['.json'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            checkJSONStatus(); 
            alert("Workbook data saved to file. Remember to move to file to the appropriate location in the workbook folder.");
            return;
        } catch (err) { /* Cancelled */ }
    } else {
        console.warn("showSaveFilePicker not supported, falling back to download.");

        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(checkJSONStatus, 1000);
        alert("Workbook data saved to file. Remember to move to file to the appropriate location in the workbook folder.");
    }
};

window.checkJSONStatus = async function(debug=false) {
    let statusBox = document.getElementById('json-status-widget');
    if (!statusBox)
        statusBox = document.getElementById('status-widget');
    const statusText = document.getElementById('json-status-text');
    if (!statusBox) return;

    statusText.textContent = "Checking...";
    statusBox.className = "status-box";

    const wbId = WORKBOOK_CONFIG.workbookId;
    // if we got the path from the page, use it
    const filename = jsonFilePath ? jsonFilePath : WORKBOOK_CONFIG.savefilepath;

    try {
        const response = await fetch(filename, { cache: "no-store" });

        if (!response.ok) {
            updateStatusUI("error", "Cannot find the saved JSON file.");
            console.warn(`File not found: ${filename}`);
            return;
        }

        const fileData = await response.json();
        const browserData = getWorkbookData(); // FIX: Compare against filtered data

        // Perform the comparison
        const differences = findDifferences(fileData, browserData);

        if (Object.keys(differences).length === 0) {
            updateStatusUI("success", "The JSON is up to date.");
            console.log("✅ Validation Passed: File matches Browser.");
        } else {
            updateStatusUI("warning", "The json file does not match the local storage.");
            if (debug) {
                // DEBUGGING: Print the exact differences to the console
                console.group("⚠️ Data Mismatch Detected");
                console.log("The following fields do not match the backup file:");
                console.table(differences);
                console.groupEnd();
            }
        }

    } catch (error) {
        console.error("Check failed:", error);
        updateStatusUI("error", "Error checking file.");
    }
};

/**
 * Load: Loads data from the JSON file into local storage.
 * Mimics checkJSONStatus but updates local storage.
 */
window.loadFromJSON = async function() {
    const wbId = WORKBOOK_CONFIG.workbookId;
    const filename = filename = jsonFilePath ? jsonFilePath : WORKBOOK_CONFIG.savefilepath;

    // 1. Safety Check
    if (!confirm("⚠️ Are you sure you want to LOAD answers from the file?\n\nThis will overwrite your current work in the browser with the data from " + filename)) {
        return; // User cancelled
    }

    try {
        const response = await fetch(filename, { cache: "no-store" });

        if (!response.ok) {
            alert("Cannot find the saved JSON file.");
            console.warn(`File not found: ${filename}`);
            return;
        }

        const fileData = await response.json();
        
        // 2. Clear existing keys for this workbook
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(wbId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => localStorage.removeItem(key));

        // 3. Load from file
        let count = 0;
        Object.keys(fileData).forEach(key => {
             if (key.startsWith(wbId)) {
                 localStorage.setItem(key, fileData[key]);
                 count++;
             }
        });

        alert(`Workbook data loaded from file (${count} items). Page will reload.`);
        location.reload();

    } catch (error) {
        console.error("Load failed:", error);
        alert("Error loading file: " + error.message);
    }
};

/**
 * Reset: Clears all data for this specific workbook.
 * prompts for confirmation first.
 */
window.resetWorkbook = function() {
    const wbId = WORKBOOK_CONFIG.workbookId;
    
    // 1. Safety Check
    if (!confirm("⚠️ Are you sure you want to reset ALL answers for this workbook?\n\nThis cannot be undone.")) {
        return; // User cancelled
    }

    // 2. Identify keys to delete
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(wbId)) {
            keysToDelete.push(key);
        }
    }

    // 3. Delete them
    keysToDelete.forEach(key => localStorage.removeItem(key));

    // 4. Reload page to clear inputs visually
    alert("Workbook has been reset.");
    location.reload();
};

/**
 * Debugging Helper: Compare two objects and return ONLY the differences
 */
function findDifferences(fileObj, browserObj) {
    const diff = {};
    const allKeys = new Set([...Object.keys(fileObj), ...Object.keys(browserObj)]);

    allKeys.forEach(key => {
        let valFile = fileObj[key];
        let valBrowser = browserObj[key];

        // if the key is a page time stamp, only look at the date part
        if (key.endsWith("_page")) {
            valFile = valFile ? valFile.split("T")[0] : "missing";
            valBrowser = valBrowser ? valBrowser.split("T")[0] : "missing";
        }

        // because the final submission happens after a save, we ignore differences in that key

        if ((valFile !== valBrowser) && !key.endsWith("sheets-final")) {
            // Record the difference
            diff[key] = {
                "File (Saved)": valFile === undefined ? "(missing)" : valFile,
                "Browser (Current)": valBrowser === undefined ? "(missing)" : valBrowser
            };
        }
    });

    return diff;
}

function updateStatusUI(type, message) {
    let statusBox = document.getElementById('json-status-widget');
    if (!statusBox)
        statusBox = document.getElementById('status-widget');
    const statusText = document.getElementById('json-status-text');
    if(statusText) statusText.textContent = message;
    if(statusBox) statusBox.className = `status-box status-${type}`;
}

window.write_test = function() {
    console.table(getWorkbookData());
};


//** Check that this page has been visited - a good time to check for server stuff */
/**
 * Check if this specific page has been visited before.
 * Returns false on the first visit, true on subsequent visits.
 * Sets the flag immediately if it was missing.
 */
window.hasPageBeenVisited = function() {
    if (typeof WORKBOOK_CONFIG === 'undefined') return false;
    const visit = getStoredValue("page");
    setStoredValue("page", new Date().toISOString());
    return visit;    
};
/**
 * Show a warning message in a specific div if this is the first visit. But not for solutions.
 */
function showFirstVisitMessage() {
    // hasPageBeenVisited returns false if it's the first visit, 
    // and sets the flag so subsequent calls return true.
    if (!window.hasPageBeenVisited() && !WORKBOOK_CONFIG.solution) {
        const columns = document.querySelectorAll('.maincolumn');
        columns.forEach(col => {
            const div = document.createElement('div');
            div.style.backgroundColor = "#ffcccc";
            div.style.borderRadius = "10px";
            div.style.padding = "10px";
            div.style.border = "1px solid #ff9999";
            div.style.color = "#a00";
            div.style.marginBottom = "10px";
            div.textContent = "No previous visit to this page. Either you haven't been here, you've changed server, or you've erased your local storage.";
            
            col.prepend(div);
        });
    }
};
showFirstVisitMessage();

/** Access checkboxes */
/**
 * Check status of a specific key and update a span with a symbol.
 * Used for visual feedback on completion status.
 * 
 * Normally, you don't do this "on demand" - it has to be part of
 * the page load process.
 * 
 * @param {string} suffix - The suffix of the key to check (e.g., "q1").
 * @param {string} spanId - The ID of the span element to update.
 */
window.checkBoxCheck = function(suffix, spanId) {
    if (typeof WORKBOOK_CONFIG === 'undefined') return;

    const span = document.getElementById(spanId);
    if (!span) {
        console.warn(`check: Span element '${spanId}' not found.`);
        return;
    }

    const usePage = !span.classList.contains('sitekey');
    const key = getStoragePrefix(usePage) + suffix;

    const value = localStorage.getItem(key);

    if (value === "true") {
        span.textContent = "✅";
    } else if (value === "false") {
        span.textContent = "❌";
    } else {
        span.textContent = "⚪"; // Not present
    }
};

/**
 * Scan the page for spans with class "localcheck".
 * Use their ID as the FULL KEY to check status in localStorage.
 */
window.runLocalChecks = function() {
    console.log("Running local checks...");
    const spans = document.querySelectorAll('span.localcheck');
    spans.forEach(span => {
        if (span.id) {
            const usePage = !span.classList.contains('sitekey');
            // Remove leading underscore if present
            const suffix = span.id.startsWith('_') ? span.id.substring(1) : span.id;
            const value = localStorage.getItem(suffix);
    //console.log(`Checking key '${suffix}': value='${value}'`);        
            if (value === "true") {
                span.textContent = "✅";
            } else if (value === "false") {
                span.textContent = "❌";
            } else {
                span.textContent = "⚪"; // Not present
            }
        }
    });
};

/** Write to Google Sheet - thanks to Gemini */
/** this requires the WebApp to be set up */
/** the web app must take exactly the right fields */
window.submitSheet = async function(event) {
    event.preventDefault(); // Prevent default form submission

    const submitButton = event.target;

    const submitType = (submitButton && submitButton.classList.contains('submit-submit')) ? 'submit' : 'checkpoint';

    const statusSpan = document.getElementById('sheets-status-span');
    statusSpan.textContent = `Saving... (${submitType})`;
    statusSpan.style.color = "blue";

    // 1. GATHER DATA
    // We explicitly construct the JSON object here
    // The field names must match the WebApp stuff exactly!

    // Convert all workbook data to a string
    const fullData = JSON.stringify(getWorkbookData());

    // Get the specific data
    const netID = getStoredValue("netid",false);   // Assumes <input id="netid">
    const githubID = getStoredValue("github",false); // Assumes <input id="github">
    const ainote = getStoredValue("ainote",false); // Assumes <input id="ainote">

    const workbookID = WORKBOOK_CONFIG.workbookId;

    
    if (!netID) {
        statusSpan.textContent = "❌ Missing NetID. Please fill in your NetID before submitting.";
        statusSpan.style.color = "red";
        setStoredValue("sheets-submitted", "error", false);
        return;
    }
    if (!githubID) {
        statusSpan.textContent = "❌ Missing GitHub ID. Please fill in your GitHub ID before submitting.";
        statusSpan.style.color = "red";
        setStoredValue("sheets-submitted", "error", false);
        return;
    }
    if (!ainote && (submitType === 'submit')) {
        statusSpan.textContent = "❌ Missing AI Disclosure. Please fill in your AI disclosure before submitting.";
        statusSpan.style.color = "red";
        setStoredValue("sheets-submitted", "error", false);
        return;
    }
    const payload = {
    netid: netID, // document.getElementById('studentName').value,
    githubid: githubID, //document.getElementById('studentEmail').value,
    workbookid: workbookID, // document.getElementById('workbookId').value,
    submittype: submitType,
    url: window.location.href,
    json: fullData //JSON.stringify(getWorkbookData())
    };

    try {
    // 2. SEND DATA
    const response = await fetch(WORKBOOK_CONFIG.sheetsURL, {
        method: 'POST',
        
        // CRITICAL: We use 'text/plain' instead of 'application/json'
        // This prevents the browser from firing a CORS "Preflight" check 
        // which Google Apps Script does not handle well.
        headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        },
        
        body: JSON.stringify(payload)
    });

    // 3. HANDLE RESPONSE
    const result = await response.json();
    setStoredValue("sheets-response-time", new Date().toISOString(), false);

    if (result.status === 'success') {
        statusSpan.textContent = "✅ Workbook Data Submitted Successfully! (does not include GitHub push!)";
        statusSpan.style.color = "green";
        setStoredValue("sheets-submitted", "success", false);
        updateSubmitButtonSuccess(submitButton);
        if (submitType === 'submit') {
            setStoredValue("sheets-final", "success", false);
        }
    } else {
        // This catches the errors we defined in the script (e.g. missing fields)
        statusSpan.textContent = "❌ Error: " + result.message;
        statusSpan.style.color = "red";
        setStoredValue("sheets-submitted", "error", false);
        if (submitType === 'submit') {
            setStoredValue("sheets-final", "error", false);
        }
    }

    } catch (error) {
        // This catches network errors (e.g. offline, bad URL)
        console.error('Error:', error);
        statusSpan.textContent = "❌ Network Error. Please check your internet connection.";
        statusSpan.style.color = "red";
        setStoredValue("sheets-submitted", "error", false);
        if (submitType === 'submit') {
            setStoredValue("sheets-final", "error", false);
        }
    }
}

function updateSubmitButtonSuccess(submitButton) {
    if (submitButton) {
        if (submitButton.classList.contains('submit-submit')) {
            submitButton.textContent = "⚠️ Re-Submit (not recommended)";
        } else if (submitButton.classList.contains('submit-check')) {
            submitButton.textContent = "Submit another checkpoint";
        } else
        submitButton.textContent = "Submit to Google Sheet";
    }
}

/** this updates the submission status display -
 * it needs to be done "on page load", but it needs to happen after local storage is ready
 * therefore, this gets called by localStorage's DOMContentLoaded handler
 */
function updateSubmissionSatus() {
    let statusDiv = document.getElementById('sheets-status-div');
    if (!statusDiv)
        statusDiv = document.getElementById('status-widget');
    const statusSpan = document.getElementById('sheets-status-span');
    const submitButton = document.getElementById('submit-sheet-button');
    const submitType = (submitButton && submitButton.classList.contains('submit-submit')) ? 'submit' : 'checkpoint';
    const checkKey = (submitType === 'submit') ? "sheets-final" : "sheets-submitted";

    if (statusDiv) {
        statusSpan.textContent = "not submitted (according to local storage)";
        const submissionStatus = getStoredValue(checkKey, false);
        if (submissionStatus === "success") {
            statusSpan.textContent = "✅ Previously submitted successfully. (at " + getStoredValue("sheets-response-time", false) + ")";
            statusSpan.style.color = "green";
            updateSubmitButtonSuccess(submitButton);
        } else if (submissionStatus === "error") {
            const failTime = getStoredValue("sheets-response-time", false);
            statusSpan.textContent = "❌ Previous submit attempt failed. (at " + (failTime ? failTime : "no time given") + ")";
            statusSpan.style.color = "red";
        }
    }
};
