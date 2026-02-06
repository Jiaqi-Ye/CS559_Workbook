/*jshint esversion: 6 */
// @ts-check

/**
 * Matrix Driven Demos
 * 
 * Includes:
 * 1. Direct Matrix Control (Interactive 9 sliders)
 * 2. Parametric Control (Single slider driving the matrix)
 * 
 * Usage:
 *    import { demoMatrixAffine, demoMatrixProjective, createParametricDemo } from './matrixDrivenDemo.js';
 *    import { scale, rotate } from './computeTransforms.js';
 * 
 *    // Parametric example
 *    createParametricDemo("my-div", (t) => rotate(t), { min: -3, max: 3 });
 */

import { drawGrid } from "./transformDemo.js";

// Configuration for each index (row-major 3x3)
// Note: 2 and 5 (Translation) ranges are in "Grid Units" (40px)
const CELL_CONFIGS = [
    { min: -2, max: 2, step: 0.05, def: 1 }, // 0: Scale X / ...
    { min: -2, max: 2, step: 0.05, def: 0 }, // 1: Shear X / ...
    { min: -5, max: 5, step: 0.1, def: 0 },  // 2: Trans X (Grid Units)
    { min: -2, max: 2, step: 0.05, def: 0 }, // 3: Shear Y / ...
    { min: -2, max: 2, step: 0.05, def: 1 }, // 4: Scale Y / ...
    { min: -5, max: 5, step: 0.1, def: 0 },  // 5: Trans Y (Grid Units)
    { min: -0.005, max: 0.005, step: 0.0001, def: 0 }, // 6: Proj X
    { min: -0.005, max: 0.005, step: 0.0001, def: 0 }, // 7: Proj Y
    { min: 0.1, max: 3, step: 0.1, def: 1 }   // 8: w
];

/**
 * Create a matrix driven transformation demo (Manual 9 sliders)
 * @param {string|HTMLElement} elementOrId 
 * @param {string|object} [params="projective"] - type string ("affine"/"projective") or options object
 */
export function createMatrixDemoBox(elementOrId, params = "projective") {
    const options = typeof params === "string" ? { type: params } : params;
    const type = options.type || "projective";
    const layout = options.layout || "responsive";

    const { box, container, canvas, controls } = createCommonLayout(elementOrId, options);
    if (!box) return;

    // Create Title based on type
    const title = document.createElement("h3");
    title.textContent = type === "affine" ? "Matrix Control (Affine)" : "Matrix Control (Projective)";
    // box.insertBefore(title, container); // Optional title placement

    // Create Matrix Grid
    const { inputs, displays } = createMatrixGrid(controls, { type });

    // Reset Button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Identity";
    resetButton.style.marginTop = "10px";
    resetButton.style.padding = "5px 10px";
    resetButton.onclick = () => {
        inputs.forEach((input, i) => {
            if (!input.disabled) {
                input.value = CELL_CONFIGS[i].def.toString();
            }
        });
        update();
    };
    controls.appendChild(resetButton);

    // Update Logic
    function update() {
        const matrix = [];
        for (let i = 0; i < 9; i++) {
            let val = parseFloat(inputs[i].value);
            
            // Update display
            displays[i].textContent = val.toFixed(3).replace(/\.?0+$/, ""); 

            // Handle Matrix Construction for DrawGrid
            if (i === 2 || i === 5) {
                // Translation happens in grid units (40px)
                val *= 40;
            }
            matrix.push(val);
        }
        drawGrid(canvas, matrix, { 
            limitGrid: false,
            clear: true 
        });
    }

    inputs.forEach(input => input.oninput = update);
    update();
}


/**
 * Create a Parametric Demo (Single external slider drives the matrix)
 * @param {string|HTMLElement} elementOrId
 * @param {function(number): number[]} paramFunc - Function taking t and returning array of 9 numbers
 * @param {object} config - Configuration options
 * @param {number} [config.min=0]
 * @param {number} [config.max=1]
 * @param {number} [config.step=0.01]
 * @param {number} [config.def] - Default value
 * @param {string} [config.label="Parameter"]
 * @param {string} [config.layout="responsive"]
 * @param {number|string} [config.width] - Width of the container
 */
export function createParametricDemo(elementOrId, paramFunc, config = {}) {
    // Defaults
    const min = config.min !== undefined ? config.min : 0;
    const max = config.max !== undefined ? config.max : 1;
    const step = config.step || 0.01;
    const def = config.def !== undefined ? config.def : (min + max) / 2;
    const labelText = config.label || "Parameter";
    
    // Pass layout AND width to common layout
    const { box, container, canvas, controls } = createCommonLayout(elementOrId, { 
        layout: config.layout || "responsive",
        width: config.width
    });
    if (!box) return;

    // 1. Create the Driver Slider
    const driverContainer = document.createElement("div");
    driverContainer.style.marginBottom = "15px";
    driverContainer.style.background = "#eee";
    driverContainer.style.padding = "10px";
    driverContainer.style.borderRadius = "5px";
    
    // Add label
    const label = document.createElement("strong");
    label.textContent = labelText + ": ";
    driverContainer.appendChild(label);

    // Add value display
    const valDisplay = document.createElement("span");
    valDisplay.textContent = def.toFixed(2);
    valDisplay.style.fontFamily = "monospace";
    valDisplay.style.marginLeft = "10px";
    driverContainer.appendChild(valDisplay);

    // Add slider
    const slider = document.createElement("input");
    slider.type = "range";
    slider.style.width = "100%";
    slider.style.display = "block";
    slider.style.marginTop = "5px";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = def.toString();
    driverContainer.appendChild(slider);

    controls.appendChild(driverContainer);

    // 2. Create Read-Only Matrix Grid
    const { inputs, displays, cells } = createMatrixGrid(controls, { 
        type: "projective", // usually show full matrix
        readOnly: true,
        matrixMode: config.matrix || "projective"
    });

    // 3. Auto-detect changing cells for highlighting
    // Sample a few points to see what changes
    const sample1 = paramFunc(min);
    const sample2 = paramFunc(max);
    const sample3 = paramFunc((min + max)/2);
    
    const changingIndices = [];
    for(let i=0; i<9; i++) {
        // Simple check: differ by epsilon
        if (Math.abs(sample1[i] - sample2[i]) > 1e-6 || Math.abs(sample1[i] - sample3[i]) > 1e-6) {
            changingIndices.push(i);
        }
    }

    // 4. Handle Interaction State (Highlighting)
    const setHighlight = (active) => {
        changingIndices.forEach(idx => {
            if (active) cells[idx].classList.add("active-highlight");
            else cells[idx].classList.remove("active-highlight");
        });
    };

    slider.addEventListener("mousedown", () => setHighlight(true));
    slider.addEventListener("mouseup", () => setHighlight(false));
    slider.addEventListener("mouseleave", () => setHighlight(false));
    // Touch support
    slider.addEventListener("touchstart", () => setHighlight(true));
    slider.addEventListener("touchend", () => setHighlight(false));

    // 5. Update Logic
    function update() {
        // Read t, update driver display
        const t = parseFloat(slider.value);
        valDisplay.textContent = t.toFixed(2);

        // Get matrix from function (Matrix values in Pixels per definitions in computeTransforms)
        const matrixRaw = paramFunc(t);
        
        // Update Grid UI
        for (let i = 0; i < 9; i++) {
            let val = matrixRaw[i];
            
            // For display in the grid, we want to convert translation back to "Grid Units" 
            // so they match the configuration ranges and user expectations for other demos
            let displayVal = val;
            if (i === 2 || i === 5) {
                displayVal = val / 40.0;
            }

            // Update number text
            displays[i].textContent = displayVal.toFixed(2).replace(/\.?0+$/, "");
            
            // Update slider position (visual only)
            inputs[i].value = displayVal.toString();
        }

        // Draw with raw matrix (pixels)
        drawGrid(canvas, matrixRaw, { 
            limitGrid: false,
            clear: true 
        });
    }

    slider.oninput = update;
    update();
}

/**
 * Shared Layout Creator
 * @param {string|HTMLElement} elementOrId 
 * @param {string|object} configArg - "layout" string or config object {layout, width}
 */
function createCommonLayout(elementOrId, configArg) {
    let container = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!container) {
        console.error(`Element ${elementOrId} not found`);
        // @ts-ignore
        return {};
    }

    // Normalize config
    const config = typeof configArg === "string" ? { layout: configArg } : (configArg || {});
    const layout = config.layout || "responsive";
    const width = config.width;

    const box = document.createElement("div");
    box.className = "trdemo-box matrix-demo-container";
    
    // Apply width if provided
    if (width) {
        box.style.width = typeof width === "number" ? width + "px" : width;
        // ensure it doesn't overflow page if width is large
        box.style.maxWidth = "100%";
        box.style.boxSizing = "border-box";
    }

    container.appendChild(box);

    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.gap = "20px";
    flexContainer.style.alignItems = "flex-start"; // Align top usually looks better with different heights
    flexContainer.style.justifyContent = "center";
    
    if (layout === "horizontal") {
        flexContainer.style.flexWrap = "nowrap";
        flexContainer.style.flexDirection = "row";
    } else if (layout === "vertical") {
        flexContainer.style.flexDirection = "column";
        flexContainer.style.alignItems = "center";
    } else {
        // responsive
        flexContainer.style.flexWrap = "wrap";
    }

    box.appendChild(flexContainer);

    // Canvas Container
    const canvasContainer = document.createElement("div");
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.border = "1px solid #ccc";
    
    // Scaling logic for constrained widths
    if (width && layout === "horizontal") {
        // Shrink both sides to fit
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        // Allow canvas container to shrink
        canvasContainer.style.flex = "1 1 50%"; // Target 50% width
        // But clamp max width to avoid blowing up on huge screens
        canvasContainer.style.maxWidth = "400px";
        canvasContainer.style.minWidth = "150px"; // don't get too small
    }

    canvasContainer.appendChild(canvas);
    flexContainer.appendChild(canvasContainer);

    // Controls Container
    const controls = document.createElement("div");
    controls.className = "matrix-controls";
    
    if (width && layout === "horizontal") {
        controls.style.flex = "1 1 50%"; // Target 50% width
        controls.style.minWidth = "150px"; // need some space for sliders
        // Add a class to help CSS target this specific constrained case
        controls.classList.add("constrained-width");
    }

    flexContainer.appendChild(controls);

    return { box, container: flexContainer, canvas, controls };
}

/**
 * Helper to create the 3x3 Grid UI
 */
function createMatrixGrid(container, { type = "projective", readOnly = false, matrixMode = "projective" } = {}) {
    const grid = document.createElement("div");
    grid.className = "matrix-grid";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = (matrixMode === "linear") ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
    grid.style.gap = "15px";
    grid.style.marginBottom = "10px";
    container.appendChild(grid);

    const inputs = [];
    const displays = [];
    const cells = [];

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        
        cell.className = "matrix-cell";
        cell.style.display = "flex";
        cell.style.flexDirection = "column";
        cell.style.alignItems = "center";
        cell.style.padding = "5px";
        // Ensure explicit border for highlight visibility
        cell.style.border = "2px solid transparent"; 

        // Handle Visibility based on matrixMode
        let isVisible = true;
        if (matrixMode === "linear") {
            // Hide indices 2, 5, 6, 7, 8
            if ([2, 5, 6, 7, 8].includes(i)) isVisible = false;
        } else if (matrixMode === "affine") {
            // Hide indices 6, 7, 8
            if ([6, 7, 8].includes(i)) isVisible = false;
        }

        if (!isVisible) {
            cell.style.display = "none";
            // We still create the elements and process them so the update loop indices match (0-8)
            // but the cell is hidden from the grid flow.
        }
        
        const numberDisplay = document.createElement("div");
        numberDisplay.style.fontFamily = "monospace";
        numberDisplay.style.fontSize = "1.2em";
        numberDisplay.style.fontWeight = "bold";
        numberDisplay.style.marginBottom = "5px";
        displays.push(numberDisplay);
        cell.appendChild(numberDisplay);

        const input = document.createElement("input");
        input.type = "range";
        input.min = CELL_CONFIGS[i].min.toString();
        input.max = CELL_CONFIGS[i].max.toString();
        input.step = CELL_CONFIGS[i].step.toString();
        input.value = CELL_CONFIGS[i].def.toString();
        
        let isDisabled = readOnly;

        // Handle affine restrictions
        if (type === "affine") {
            if (i === 6 || i === 7) {
                input.value = "0";
                isDisabled = true;
                cell.style.opacity = "0.3";
            }
            if (i === 8) {
                input.value = "1";
                isDisabled = true;
                cell.style.opacity = "0.3";
            }
        }

        if (isDisabled) {
            input.disabled = true;
        }

        inputs.push(input);
        cell.appendChild(input);

        grid.appendChild(cell);
        cells.push(cell);
    }

    return { inputs, displays, cells };
}


/**
 * Wrapper for Affine Matrix Demo
 */
export function demoMatrixAffine(elementOrId, options = {}) {
    createMatrixDemoBox(elementOrId, { ...options, type: "affine" });
}

/**
 * Wrapper for Projective Matrix Demo
 */
export function demoMatrixProjective(elementOrId, options = {}) {
    createMatrixDemoBox(elementOrId, { ...options, type: "projective" });
}
