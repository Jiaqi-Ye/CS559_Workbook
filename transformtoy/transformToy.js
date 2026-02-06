/*jshint esversion: 6 */
// @ts-check

// Constants
const CANVAS_SIZE = 600;
const CANVAS_SCALE = 4;
const GRID_SIZE = 50;
const GRID_LINE_WIDTH = 0.5;
const AXIS_LINE_WIDTH = 3;
const ARROW_SIZE = 6;
const SQUARE_SIZE = 20;

const DEFAULT_ANIMATION_DURATION = 1000; // milliseconds

const PLAY_STEP_SIZE = 0.02; // step size while animating

const REVERSE_PLAYBACK_RL = false; // if true, Reverse Playback is from right to left, otherwise it is left to right

const FORWARD_MODE_START_COORD_FRAME_COLOR   = "#000000";
const FORWARD_MODE_CURR_COORD_FRAME_COLOR    = "#7F0000";
const BACKWARDS_MODE_START_COORD_FRAME_COLOR = "#a84aff";
const BACKWARDS_MODE_CURR_COORD_FRAME_COLOR  = "#0080ff";     ;

/**
 * Function to figure out duration based on current position
 * @param {number} curr current position of slider (Math.floor(curr) gives the current transform index)
 * @param {number} len total length of slider (equal to total number of transforms)
 * @returns {number} duration in milliseconds
 * @typedef {(curr: number, len: number) => number} DurationFunction
 */
// /** @type {DurationFunction} */
// const firstDuration = (curr, len) => curr * 1000;
// /** @type {DurationFunction} */
// const lastDuration  = (curr, len) => (len - curr) * 1000;
/** @type {DurationFunction} */
const nextDuration  = (curr, len) => 1000;
/** @type {DurationFunction} */
const prevDuration  = (curr, len) => 1000;

/**
 * Convert angles from degrees to radians
 * @param {Number} angle 
 */
function degToRad(angle) {
    return (angle * Math.PI) / 180;
}

/**
 * CSS named color lookup table
 * @type {{[key: string]: [number, number, number]}}
 */
const CSS_COLORS = {
    aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255],
    aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220],
    bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42],
    burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255],
    darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169], darkgrey: [169, 169, 169], darkgreen: [0, 100, 0],
    darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0],
    darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255],
    gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128],
    grey: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47],
    honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92],
    indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140],
    lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211],
    lightgrey: [211, 211, 211], lightgreen: [144, 238, 144], lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50],
    linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128],
    oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35],
    orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185],
    peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221],
    powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153],
    red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45],
    silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205],
    slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250],
    springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140],
    teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71],
    turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179],
    white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50],
};

/**
 * Get RGBA color values from a color string by parsing it
 * @param {string} style - CSS color string (hex, rgb, rgba, named color, etc.)
 * @param {{r?: number, g?: number, b?: number, a?: number}} [out] Optional object to store the result in
 * @returns {{r: number, g: number, b: number, a: number}} RGBA object with values 0-255 for all components
 */
function getRGBAFromStyle(style, out) {
    out = out ?? {};
 
    // Default values
    out.r = 0;
    out.g = 0;
    out.b = 0;
    out.a = 255;

    const out_ = /** @type {{r: number, g: number, b: number, a: number}} */ (out);
    
    if (typeof style !== 'string') {
        return out_;
    }
    
    style = style.trim().replaceAll(" ", "").toLowerCase();
    
    // Check for named colors first
    if (CSS_COLORS[style]) {
        const [r, g, b] = CSS_COLORS[style];
        out_.r = r;
        out_.g = g;
        out_.b = b;
        out_.a = 255;
        return out_;
    }
    
    // Match rgb(r, g, b)
    let match = style.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
        out_.r = parseInt(match[1]);
        out_.g = parseInt(match[2]);
        out_.b = parseInt(match[3]);
        out_.a = 255;
        return out_;
    }
    
    // Match rgba(r, g, b, a)
    match = style.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
    if (match) {
        out_.r = parseInt(match[1]);
        out_.g = parseInt(match[2]);
        out_.b = parseInt(match[3]);
        out_.a = Math.round(parseFloat(match[4]) * 255);
        return out_;
    }
    
    // Match #RGB or #RRGGBB or #RRGGBBAA
    match = style.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
    if (match) {
        const hex = match[1];
        if (hex.length === 3) {
            // #RGB -> #RRGGBB
            out_.r = parseInt(hex[0] + hex[0], 16);
            out_.g = parseInt(hex[1] + hex[1], 16);
            out_.b = parseInt(hex[2] + hex[2], 16);
            out_.a = 255;
        } else if (hex.length === 6) {
            // #RRGGBB
            out_.r = parseInt(hex.substring(0, 2), 16);
            out_.g = parseInt(hex.substring(2, 4), 16);
            out_.b = parseInt(hex.substring(4, 6), 16);
            out_.a = 255;
        } else if (hex.length === 8) {
            // #RRGGBBAA
            out_.r = parseInt(hex.substring(0, 2), 16);
            out_.g = parseInt(hex.substring(2, 4), 16);
            out_.b = parseInt(hex.substring(4, 6), 16);
            out_.a = parseInt(hex.substring(6, 8), 16);
        }
        return out_;
    }
    
    return out_;
}

/**
 * Convert RGBA color values to a CSS color string
 * @param {{r: number, g: number, b: number, a?: number}} rgba - RGBA object with r, g, b, a (all 0-255)
 * @returns {string} CSS color string (rgb() or rgba() format)
 */
function getStyleFromRGBA(rgba) {
    const r = Math.round(Math.max(0, Math.min(255, rgba.r)));
    const g = Math.round(Math.max(0, Math.min(255, rgba.g)));
    const b = Math.round(Math.max(0, Math.min(255, rgba.b)));
    const a = rgba.a !== undefined ? Math.max(0, Math.min(255, rgba.a)) : 255;
    
    if (a === 255) {
        return `rgb(${r}, ${g}, ${b})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

/**
 * Linear interpolates between two values and returns the result.
 * @param {number} a - start value
 * @param {number} b - end value
 * @param {number} t - interpolation factor (0 to 1)
 * @returns {number} interpolated value
 */
function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

/**
 * Draw a filled square - but don't rely on
 * fillRect (which doesn't transform correctly)
 * @param {CanvasRenderingContext2D} context 
 * @param {Number} r 
 */
function square(context, r = SQUARE_SIZE) {
    context.save();
    context.beginPath();
    context.moveTo(-r, -r);
    context.lineTo(r, -r);
    context.lineTo(r, r);
    context.lineTo(-r, r);
    context.closePath();
    context.fill();
    context.restore();
}

/**
 * Draw a coordinate system
 * @param {CanvasRenderingContext2D} context 
 * @param {String} color 
 * @param {String} [drawBlock=undefined] 
 */
function drawCsys(context, color = "#7F0000", drawBlock = undefined) {
    context.save();

    // Draw the original block if requested
    if (drawBlock) {
        context.fillStyle = drawBlock;
        square(context);
    }
    
    context.strokeStyle = color;
    
    // Draw grid lines
    context.beginPath();
    for (let i = -5; i <= 5; i++) {
        const pos = i * 10;
        // Vertical lines
        context.moveTo(pos, -GRID_SIZE);
        context.lineTo(pos, GRID_SIZE);
        // Horizontal lines
        context.moveTo(-GRID_SIZE, pos);
        context.lineTo(GRID_SIZE, pos);
    }
    context.lineWidth = GRID_LINE_WIDTH;
    context.stroke();

    // Draw axes in bold
    context.lineWidth = AXIS_LINE_WIDTH;
    context.beginPath();
    context.moveTo(0, -GRID_SIZE);
    context.lineTo(0, GRID_SIZE);
    context.moveTo(-GRID_SIZE, 0);
    context.lineTo(GRID_SIZE, 0);
    context.stroke();

    // Draw arrows pointing in positive direction
    context.fillStyle = color;
    context.beginPath();
    // Y-axis arrow
    context.moveTo(3, GRID_SIZE);
    context.lineTo(0, GRID_SIZE + ARROW_SIZE);
    context.lineTo(-3, GRID_SIZE);
    context.closePath();
    // X-axis arrow
    context.moveTo(GRID_SIZE, -3);
    context.lineTo(GRID_SIZE + ARROW_SIZE, 0);
    context.lineTo(GRID_SIZE, 3);
    context.closePath();
    context.fill();

    context.restore();
}

/**
 * Do transforms as specified in transformList. The number of transforms 
 * to do is decided by param
 * @param {CanvasRenderingContext2D} context 
 * @param {PrecomputedTransform[]} precomputedTransforms
 * @param {Number} param 
 * @param {Number} [direction]
 * @returns {string}
 */
function htmlForTransforms(context, precomputedTransforms, param, direction = 1) {
    // is the text in the code section under the canvas
    let html = "";

    // If running backwards, invert the param
    const effectiveParam = (REVERSE_PLAYBACK_RL && (direction < 0)) ? (precomputedTransforms.length - param) : param;
    //const effectiveParam = Math.abs(param);

    // iterate through all transforms in the list
    // but some will get done, some will not (based on how big param is)
    // look at the array test1 in the beginning of this script to have an idea of how "t
    // below would be like
    precomputedTransforms.forEach(function (t, i) {

        // keep track of which commands are ready to be run
        let amt = (i >= effectiveParam) ? 0 : Math.min(1, effectiveParam - i);

        /**
         * @param {Number} amt
         * @param {string | string[]} htmlLine
         * @param {Number} instructionIndex
         */
        function stylize(amt, htmlLine, instructionIndex) {
            let color = "";
            let style = "";
            
            // Only if we are currently in the middle of this instruction do we color it red
            if ((instructionIndex < effectiveParam) && (effectiveParam < instructionIndex + 1)) {
                color = "red";
            }
            
            if (color) {
                style = `style="font-weight: bold; color: ${color};"`;
            } else {
                style = `style="font-weight: bold;"`;
            }

            let hrColor = "transparent";
            if (instructionIndex === effectiveParam) {
                hrColor = "red";
            }

            let hrStyle = `padding: 0px; margin: 0px; border: none; `;

            let html = "";
            for (const line of Array.isArray(htmlLine) ? htmlLine : [htmlLine]) {
                html += `<hr style="${hrStyle}border-top: 3px solid ${hrColor};" />`;
                html += `<span ${style}>${line}</span><br/>`;
                hrColor = "transparent";
            }

            if (instructionIndex === (effectiveParam - 1) && effectiveParam === precomputedTransforms.length) {
                html += `<hr style="${hrStyle}border-top: 3px solid red;" />`;
            } else {
                html += `<hr style="${hrStyle}border-top: 3px solid transparent;" />`;
            }
            
            return html;
        }

        // get the html lines for this transform at this amount
        const htmlLines = t.getHTML((direction < 0) ? (1 - amt) : amt);

        // append each line to the overall html
        html += stylize(amt, htmlLines, i);
    });
    return html;
}

/**
 * @param {{
 *    cxt: CanvasRenderingContext2D,
 *    precomputedTransforms: PrecomputedTransform[],
 *    param: number,
 *    direction: number,
 *    drawPast?: boolean,
 *    drawPresent?: boolean,
 *    drawFuture?: boolean,
 *    drawBlock: (cxt: CanvasRenderingContext2D) => void,
 * }} params
 */
function drawTransforms({
        cxt,
        precomputedTransforms,
        param,
        direction,
        drawBlock,
}) {

    if (precomputedTransforms.length === 0) { return }

    // If running backwards, invert the param
    // Match slider semantics directly; clamp below
    let effectiveParam = Math.max(Math.min(param, precomputedTransforms.length), 0);

    if (direction < 0) {
        // Reverse Direction

        if (REVERSE_PLAYBACK_RL) {
            effectiveParam = precomputedTransforms.length - effectiveParam;
        }

        cxt.save();

        // Draw all objects
        precomputedTransforms.forEach((t, i) => {
            let amt = ((i + 1) < effectiveParam) ? 0 : Math.min(1, (i + 1) - effectiveParam);
            if (amt > 0) {
                cxt.setTransform(t.applyTransform(cxt.getTransform(), amt));
                t.draw(cxt, amt);
            }
        });

        // Draw the coordinate frame
        drawBlock(cxt);

        cxt.restore();

    } else {
        // Forward direction

        let last = precomputedTransforms[0];
        let lastAmt = 0;
        precomputedTransforms.forEach((t, i) => {
            let amt = (i > effectiveParam) ? 0 : Math.min(1, effectiveParam - i);
            if (amt > 0) {
                t.drawInFrame(cxt, amt, (cxt) => {
                    t.draw(cxt, amt);
                });
                last = t;
                lastAmt = amt;
            }
        });

        // Draw the coordinate frame
        last.drawInFrame(cxt, lastAmt, (cxt) => {
            drawBlock(cxt);
        });

    }
}

/**
 * @typedef {{
 *    raw: any[],
 *    command: string,
 *    params: any[],
 *    prevMatrix: DOMMatrix,
 *    matrix: DOMMatrix,
 *    getHTML: (t: number) => string | string[],
 *    draw: DrawFunction,
 *    drawInFrame: DrawInFrameFunction<any>,
 *    applyTransform: (matrix: DOMMatrix, t: number) => DOMMatrix,
 *    applyFillStyle: (color: string, t: number) => string,
 *    applyStrokeStyle: (color: string, t: number) => string,
 *    is_save: () => boolean,
 *    is_restore: () => boolean,
 * }} PrecomputedTransform
 */

/**
 * @template T
 * @typedef {(cxt: CanvasRenderingContext2D, t: number, drawBlock: ((cxt: CanvasRenderingContext2D) => T)) => T} DrawInFrameFunction
 */

/**
 * @typedef {(context: CanvasRenderingContext2D, t: number) => void} DrawFunction
 */

/**
 * @param {any} value
 * @returns {value is number}
 */
function isNumber(value) {
    return typeof value === 'number';
}

/**
 * @param {string} color 
 * @returns {boolean}
 */
function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

/**
 * @template T
 * @template E
 * @param {any[]} transform 
 * @param {{
 *    translate  ?: (cmd: string, tx: number, ty: number) => T,
 *    rotate     ?: (cmd: string, angle: number) => T,
 *    scale      ?: (cmd: string, sx: number, sy: number) => T,
 *    shear      ?: (cmd: string, shx: number, shy: number) => T,
 *    transform  ?: (cmd: string, a: number, b: number, c: number, d: number, e: number, f: number) => T,
 *    save       ?: (cmd: string) => T,
 *    restore    ?: (cmd: string) => T,
 *    fillStyle  ?: (cmd: string, color: string) => T,
 *    strokeStyle?: (cmd: string, color: string) => T,
 *    fillRect   ?: (cmd: string, x: number, y: number, w: number, h: number, color?: string) => T,
 *    strokeRect ?: (cmd: string, x: number, y: number, w: number, h: number, color?: string) => T,
 *    fillTriangle   ?: (cmd: string, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color?: string) => T,
 *    strokeTriangle ?: (cmd: string, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color?: string) => T,
 *    fillArc   ?: (cmd: string, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, color?: string) => T,
 *    strokeArc ?: (cmd: string, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, color?: string) => T,
 *    default    ?: (cmd: string) => T,
 *    error      ?: (msg: string) => E,
 * }} [variants]
 * @returns {T | E | undefined}
 */
function cmdMatch(transform, variants) {
    const cmd = transform[0];
    const fns = variants || {};

    // Error checking
    if (!cmd) {
        return fns.error?.("Empty command in transform.");
    }
    if (typeof cmd !== "string") {
        return fns.error?.(`Invalid command type in transform: ${cmd}`);
    }

    while (true) {
        if (cmd === "fillRect") {
            if (!fns.fillRect) break;
            let [_cmd, x, y, w, h, color] = transform;
            if (!isNumber(x)) return fns.error?.(`Invalid x parameter for fillRect (must be number): ${x}`);
            if (!isNumber(y)) return fns.error?.(`Invalid y parameter for fillRect (must be number): ${y}`);
            if (!isNumber(w)) return fns.error?.(`Invalid w parameter for fillRect (must be number): ${w}`);
            if (!isNumber(h)) return fns.error?.(`Invalid h parameter for fillRect (must be number): ${h}`);
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for fillRect (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for fillRect (not a valid color): ${color}`); }
            }
            return fns.fillRect(cmd, x, y, w, h, color);
        }

        if (cmd === "strokeRect") {
            if (!fns.strokeRect) break;
            let [_cmd, x, y, w, h, color] = transform;
            if (!isNumber(x)) return fns.error?.(`Invalid x parameter for strokeRect (must be number): ${x}`);
            if (!isNumber(y)) return fns.error?.(`Invalid y parameter for strokeRect (must be number): ${y}`);
            if (!isNumber(w)) return fns.error?.(`Invalid w parameter for strokeRect (must be number): ${w}`);
            if (!isNumber(h)) return fns.error?.(`Invalid h parameter for strokeRect (must be number): ${h}`);
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for strokeRect (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for strokeRect (not a valid color): ${color}`); }
            }
            return fns.strokeRect(cmd, x, y, w, h, color);
        }

        if (cmd === "fillTriangle") {
            if (!fns.fillTriangle) break;
            let [_cmd, x1, y1, x2, y2, x3, y3, color] = transform;
            if (!isNumber(x1)) return fns.error?.(`Invalid x1 parameter for fillTriangle (must be number): ${x1}`);
            if (!isNumber(y1)) return fns.error?.(`Invalid y1 parameter for fillTriangle (must be number): ${y1}`);
            if (!isNumber(x2)) return fns.error?.(`Invalid x2 parameter for fillTriangle (must be number): ${x2}`);
            if (!isNumber(y2)) return fns.error?.(`Invalid y2 parameter for fillTriangle (must be number): ${y2}`);
            if (!isNumber(x3)) return fns.error?.(`Invalid x3 parameter for fillTriangle (must be number): ${x3}`);
            if (!isNumber(y3)) return fns.error?.(`Invalid y3 parameter for fillTriangle (must be number): ${y3}`);
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for fillTriangle (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for fillTriangle (not a valid color): ${color}`); }
            }
            return fns.fillTriangle(cmd, x1, y1, x2, y2, x3, y3, color);
        }

        if (cmd === "strokeTriangle") {
            if (!fns.strokeTriangle) break;
            let [_cmd, x1, y1, x2, y2, x3, y3, color] = transform;
            if (!isNumber(x1)) return fns.error?.(`Invalid x1 parameter for strokeTriangle (must be number): ${x1}`);
            if (!isNumber(y1)) return fns.error?.(`Invalid y1 parameter for strokeTriangle (must be number): ${y1}`);
            if (!isNumber(x2)) return fns.error?.(`Invalid x2 parameter for strokeTriangle (must be number): ${x2}`);
            if (!isNumber(y2)) return fns.error?.(`Invalid y2 parameter for strokeTriangle (must be number): ${y2}`);
            if (!isNumber(x3)) return fns.error?.(`Invalid x3 parameter for strokeTriangle (must be number): ${x3}`);
            if (!isNumber(y3)) return fns.error?.(`Invalid y3 parameter for strokeTriangle (must be number): ${y3}`);
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for strokeTriangle (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for strokeTriangle (not a valid color): ${color}`); }
            }
            return fns.strokeTriangle(cmd, x1, y1, x2, y2, x3, y3, color);
        }

        if (cmd === "fillArc") {
            if (!fns.fillArc) break;
            let [_cmd, x, y, radius, startAngle, endAngle, counterclockwise, color] = transform;
            if (!isNumber(x)) return fns.error?.(`Invalid x parameter for fillArc (must be number): ${x}`);
            if (!isNumber(y)) return fns.error?.(`Invalid y parameter for fillArc (must be number): ${y}`);
            if (!isNumber(radius)) return fns.error?.(`Invalid radius parameter for fillArc (must be number): ${radius}`);
            if (!isNumber(startAngle)) return fns.error?.(`Invalid startAngle parameter for fillArc (must be number): ${startAngle}`);
            if (!isNumber(endAngle)) return fns.error?.(`Invalid endAngle parameter for fillArc (must be number): ${endAngle}`);
            if (counterclockwise !== undefined && typeof counterclockwise !== "boolean") {
                return fns.error?.(`Invalid counterclockwise parameter for fillArc (must be boolean): ${counterclockwise}`);
            }
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for fillArc (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for fillArc (not a valid color): ${color}`); }
            }
            return fns.fillArc(cmd, x, y, radius, startAngle, endAngle, counterclockwise, color);
        }

        if (cmd === "strokeArc") {
            if (!fns.strokeArc) break;
            let [_cmd, x, y, radius, startAngle, endAngle, counterclockwise, color] = transform;
            if (!isNumber(x)) return fns.error?.(`Invalid x parameter for strokeArc (must be number): ${x}`);
            if (!isNumber(y)) return fns.error?.(`Invalid y parameter for strokeArc (must be number): ${y}`);
            if (!isNumber(radius)) return fns.error?.(`Invalid radius parameter for strokeArc (must be number): ${radius}`);
            if (!isNumber(startAngle)) return fns.error?.(`Invalid startAngle parameter for strokeArc (must be number): ${startAngle}`);
            if (!isNumber(endAngle)) return fns.error?.(`Invalid endAngle parameter for strokeArc (must be number): ${endAngle}`);
            if (counterclockwise !== undefined && typeof counterclockwise !== "boolean") {
                return fns.error?.(`Invalid counterclockwise parameter for strokeArc (must be boolean): ${counterclockwise}`);
            }
            if (color !== undefined) {
                if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for strokeArc (must be string): ${color}`); };
                if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for strokeArc (not a valid color): ${color}`); }
            }
            return fns.strokeArc(cmd, x, y, radius, startAngle, endAngle, counterclockwise, color);
        }

        if (cmd === "fillStyle") {
            if (!fns.fillStyle) break;
            let [_cmd, color] = transform;
            if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for fillStyle (must be string): ${color}`); };
            if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for fillStyle (not a valid color): ${color}`); }
            return fns.fillStyle(cmd, color);
        }
        
        if (cmd === "strokeStyle") {
            if (!fns.strokeStyle) break;
            let [_cmd, color] = transform;
            if (typeof color !== "string") { return fns.error?.(`Invalid color parameter for strokeStyle (must be string): ${color}`); };
            if (!isValidColor(color)) { return fns.error?.(`Invalid color parameter for strokeStyle (not a valid color): ${color}`); }
            return fns.strokeStyle(cmd, color);
        }

        if (cmd === "save") {
            if (!fns.save) break;
            let [_cmd] = transform;
            return fns.save(cmd);
        }

        if (cmd === "restore") {
            if (!fns.restore) break;
            let [_cmd] = transform;
            return fns.restore(cmd);
        }

        if (cmd === "translate") {
            if (!fns.translate) break;
            let [_cmd, tx, ty] = transform;
            if (!isNumber(tx)) return fns.error?.(`Invalid tx parameter for translate (must be number): ${tx}`);
            if (!isNumber(ty)) return fns.error?.(`Invalid ty parameter for translate (must be number): ${ty}`);
            return fns.translate(cmd, tx, ty);
        }

        if (cmd === "rotate") {
            if (!fns.rotate) break;
            let [_cmd, angle] = transform;
            if (!isNumber(angle)) return fns.error?.(`Invalid angle parameter for rotate (must be number): ${angle}`);
            return fns.rotate(cmd, angle);
        }

        if (cmd === "scale") {
            if (!fns.scale) break;
            let [_cmd, sx, sy] = transform;
            if (!isNumber(sx)) return fns.error?.(`Invalid sx parameter for scale (must be number): ${sx}`);
            if (!isNumber(sy)) return fns.error?.(`Invalid sy parameter for scale (must be number): ${sy}`);
            return fns.scale(cmd, sx, sy);
        }

        if (cmd === "shear") {
            if (!fns.shear) break;
            let [_cmd, shx, shy] = transform;
            if (!isNumber(shx)) return fns.error?.(`Invalid shx parameter for shear (must be number): ${shx}`);
            if (!isNumber(shy)) return fns.error?.(`Invalid shy parameter for shear (must be number): ${shy}`);
            return fns.shear(cmd, shx, shy);
        }

        if (cmd === "transform") {
            if (!fns.transform) break;
            let [_cmd, a, b, c, d, e, f] = transform;
            if (!isNumber(a)) return fns.error?.(`Invalid a parameter for transform (must be number): ${a}`);
            if (!isNumber(b)) return fns.error?.(`Invalid b parameter for transform (must be number): ${b}`);
            if (!isNumber(c)) return fns.error?.(`Invalid c parameter for transform (must be number): ${c}`);
            if (!isNumber(d)) return fns.error?.(`Invalid d parameter for transform (must be number): ${d}`);
            if (!isNumber(e)) return fns.error?.(`Invalid e parameter for transform (must be number): ${e}`);
            if (!isNumber(f)) return fns.error?.(`Invalid f parameter for transform (must be number): ${f}`);
            return fns.transform(cmd, a, b, c, d, e, f);
        }

        break;
    }

    return fns.default?.(cmd);
}

/**
 * @param {any[][]} transformList
 * @returns {PrecomputedTransform[]}
 */
function precomputeTransforms(transformList) {

    // Handle Errors
    for (const t of transformList) {
        cmdMatch(t, {
            error: (msg) => {
                console.error(msg);
            },
        });
    }

    const DEFAULT_FILL   = "black";
    const DEFAULT_STROKE = "black";

    /** @type {string[]} */
    const fillStyle   = [];
    /** @type {string[]} */
    const strokeStyle = [];
    {
        /** @type {(string | undefined)[]} */
        const fillStack   = [];
        /** @type {(string | undefined)[]} */
        const strokeStack = [];
        /** @type {(string | undefined)} */
        let currStroke = undefined;
        /** @type {(string | undefined)} */
        let currFill = undefined;
        for (let ti = 0; ti < transformList.length; ti++) {
            const t = transformList[ti];
            const i = ti;

            // Update persistent style
            cmdMatch(t, {
                fillStyle: (cmd, color) => {
                    currFill = color;
                },
                strokeStyle: (cmd, color) => {
                    currStroke = color;
                },
                save: (cmd) => {
                    strokeStack.push(currStroke);
                    fillStack  .push(currFill  );
                },
                restore: (cmd) => {
                    {
                        const restored = fillStack.pop();
                        if (restored === undefined && fillStack.length === 0 && currFill !== undefined) {
                            console.warn(`Warning: restore() at index ${i} called with empty stack (fillStyle tracking - mismatched save/restore).`);
                        }
                        currFill = restored;
                    }
                    {
                        const restored = strokeStack.pop();
                        if (restored === undefined && strokeStack.length === 0 && currStroke !== undefined) {
                            console.warn(`Warning: restore() at index ${i} called with empty stack (strokeStyle tracking - mismatched save/restore).`);
                        }
                        currStroke = restored;
                    }
                }
            });

            fillStyle  .push(currFill   || DEFAULT_FILL  );
            strokeStyle.push(currStroke || DEFAULT_STROKE);

            // Update non-persistent style
            cmdMatch(t, {
                fillRect: (cmd, x, y, w, h, color) => {
                    if (color !== undefined) {
                        fillStyle[i] = color;
                    }
                },
                strokeRect: (cmd, x, y, w, h, color) => {
                    if (color !== undefined) {
                        strokeStyle[i] = color;
                    }
                },
                fillTriangle: (cmd, x1, y1, x2, y2, x3, y3, color) => {
                    if (color !== undefined) {
                        fillStyle[i] = color;
                    }
                },
                strokeTriangle: (cmd, x1, y1, x2, y2, x3, y3, color) => {
                    if (color !== undefined) {
                        strokeStyle[i] = color;
                    }
                },
                fillArc: (cmd, x, y, radius, startAngle, endAngle, counterclockwise, color) => {
                    if (color !== undefined) {
                        fillStyle[i] = color;
                    }
                },
                strokeArc: (cmd, x, y, radius, startAngle, endAngle, counterclockwise, color) => {
                    if (color !== undefined) {
                        strokeStyle[i] = color;
                    }
                },
            });
        }
    }

    const fillStyleRGBA   = fillStyle  .map((v)=>getRGBAFromStyle(v));
    const strokeStyleRGBA = strokeStyle.map((v)=>getRGBAFromStyle(v));

    /** @type {DOMMatrix[]} */
    const matrixes = [];
    /** @type {DOMMatrix[]} */
    const prevMatrixes = [];
    {
        /** @type {DOMMatrix[]} */
        const stack = [];
        let currMatrix = new DOMMatrix();
        for (let ti = 0; ti < transformList.length; ti++) {
            const i = ti;
            const t = transformList[i];
            prevMatrixes.push(DOMMatrix.fromMatrix(currMatrix));
            cmdMatch(t, {
                translate: (cmd, tx, ty) => {
                    currMatrix = currMatrix.translate(tx, ty);
                },
                rotate: (cmd, angle) => {
                    currMatrix = currMatrix.rotate(angle);
                },
                scale: (cmd, sx, sy) => {
                    currMatrix = currMatrix.scale(sx, sy);
                },
                shear: (cmd, shx, shy) => {
                    let n = new DOMMatrix();
                    n.c = shx;
                    n.b = shy;
                    currMatrix = currMatrix.multiply(n);
                },
                transform: (cmd, a, b, c, d, e, f) => {
                    let n = new DOMMatrix();
                    n.a = a; n.c = c; n.e = e;
                    n.b = b; n.d = d; n.f = f;
                    currMatrix = currMatrix.multiply(n);
                },
                save: (cmd) => {
                    stack.push(DOMMatrix.fromMatrix(currMatrix)); // save a copy
                },
                restore: (cmd) => {
                    let restore = stack.pop();
                    if (!restore) {
                        console.warn(`Warning: restore() at index ${i} called with empty stack (matrix tracking - mismatched save/restore). Commands: ${transformList}].`);
                    } else {
                        currMatrix = restore;
                    }
                },
            });
            matrixes.push(DOMMatrix.fromMatrix(currMatrix)); 
        }
    }

    /**
     * @param {number} i
     * @returns {boolean}
     */
    function shouldPrintFillStyle(i) {
        if (i === 0) { return fillStyle[i] !== DEFAULT_FILL; }
        return (fillStyle[i - 1] !== fillStyle[i]);
    }

    /**
     * @param {number} i
     * @returns {boolean}
     */
    function shouldPrintStrokeStyle(i) {
        if (i === 0) { return strokeStyle[i] !== DEFAULT_STROKE; }
        return (strokeStyle[i - 1] !== strokeStyle[i]);
    }

    const lerpTemp = { r: 0, g: 0, b: 0, a: 0 };
    /**
     * Lerp the alpha of a color from 0 to its original value
     * @param {string} a 
     * @param {number} t 
     * @returns {string}
     */
    function lerp_rgbA(a, t) {
        const o = getRGBAFromStyle(a, lerpTemp);
        const currAlpha = o.a;
        o.a = lerp(0, o.a, t);
        const out = getStyleFromRGBA(o);
        o.a = currAlpha;
        return out;
    }

    /**
     * @type {{
     *   draw?: DrawFunction,
     *   getHTML?: (t: number) => string | string[],
     *   applyTransform?: (matrix: DOMMatrix, t: number) => DOMMatrix,
     *   applyFillStyle?: (color: string, t: number) => string,
     *   applyStrokeStyle?: (color: string, t: number) => string,
     * }[]}
     */
    const tempObjs = [];

    const ctxPrefix = "";
    for (let ti = 0; ti < transformList.length; ti++) {
        const i = ti;

        /** @type {tempObjs[number]} */
        const obj = {};
        tempObjs.push(obj);

        cmdMatch(transformList[i], {
            translate: (cmd, tx, ty) => {
                obj.getHTML = (t) => {
                    const x = tx * t;
                    const y = ty * t;
                    return `${ctxPrefix}translate(${x.toFixed(1)},${y.toFixed(1)});`;
                };
                obj.applyTransform = (matrix, t) => {
                    const x = tx * t;
                    const y = ty * t;
                    return matrix.translate(x, y);
                };
            },
            rotate: (cmd, angle) => {
                obj.getHTML = (t) => {
                    const a = angle * t;
                    return `${ctxPrefix}rotate(${a.toFixed(1)});`;
                };
                obj.applyTransform = (matrix, t) => {
                    const a = angle * t;
                    return matrix.rotate(a);
                };
            },
            scale: (cmd, sx, sy) => {
                obj.getHTML = (t) => {
                    const x = sx * t + (1 - t);
                    const y = sy * t + (1 - t);
                    return `${ctxPrefix}scale(${x.toFixed(1)},${y.toFixed(1)});`;
                };
                obj.applyTransform = (matrix, t) => {
                    const x = sx * t + (1 - t);
                    const y = sy * t + (1 - t);
                    return matrix.scale(x, y);
                };
            },
            transform: (cmd, a, b, c, d, e, f) => {
                obj.getHTML = (t) => {
                    // Interpolate each component from identity to target
                    const ia  = lerp(1, a, t);
                    const ib  = lerp(0, b, t);
                    const ic  = lerp(0, c, t);
                    const id  = lerp(1, d, t);
                    const ie  = lerp(0, e, t);
                    const if_ = lerp(0, f, t);
                    return `${ctxPrefix}transform(<br>
                        <span style="margin-left: 20px">${ia.toFixed(2)},${ib.toFixed(2)},${ic.toFixed(2)},</span><br>
                        <span style="margin-left: 20px">${id.toFixed(2)},${ie.toFixed(2)},${if_.toFixed(2)}</span><br>
                    );`;
                };
                obj.applyTransform = (matrix, t) => {
                    const ia  = lerp(1, a, t);
                    const ib  = lerp(0, b, t);
                    const ic  = lerp(0, c, t);
                    const id  = lerp(1, d, t);
                    const ie  = lerp(0, e, t);
                    const if_ = lerp(0, f, t);
                    let m = new DOMMatrix();
                    m.a = ia; m.c = ic; m.e = ie;
                    m.b = ib; m.d = id; m.f = if_;
                    return matrix.multiply(m);
                };
            },
            save: (cmd) => {
                obj.getHTML = (t) => {
                    return `${ctxPrefix}save();`;
                };
            },
            restore: (cmd) => {
                obj.getHTML = (t) => {
                    return `${ctxPrefix}restore();`;
                };
            },
            fillStyle: (cmd, color) => {
                obj.getHTML = (t) => {
                    return `${ctxPrefix}fillStyle = "${fillStyle[i]}";`;
                };
                obj.applyFillStyle = (c, t) => {
                    return fillStyle[i];
                }
            },
            strokeStyle: (cmd, color) => {
                obj.getHTML = (t) => {
                    return `${ctxPrefix}strokeStyle = "${strokeStyle[i]}";`;
                };
                obj.applyStrokeStyle = (c, t) => {
                    return strokeStyle[i];
                };
            },
            fillRect: (cmd, x, y, w, h, color) => {
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintFillStyle(i))
                        out.push(`${ctxPrefix}fillStyle = "${fillStyle[i]}";`);
                    out.push(`${ctxPrefix}fillRect(${x},${y},${w},${h});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.moveTo(x    , y    );
                    cxt.lineTo(x    , y + h);
                    cxt.lineTo(x + w, y + h);
                    cxt.lineTo(x + w, y    );
                    cxt.closePath();
                    cxt.fill();
                    cxt.restore();
                };
            },
            strokeRect: (cmd, x, y, w, h, color) => {
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintStrokeStyle(i))
                        out.push(`${ctxPrefix}strokeStyle = "${strokeStyle[i]}";`);
                    out.push(`${ctxPrefix}strokeRect(${x},${y},${w},${h});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.moveTo(x    , y    );
                    cxt.lineTo(x    , y + h);
                    cxt.lineTo(x + w, y + h);
                    cxt.lineTo(x + w, y    );
                    cxt.closePath();
                    cxt.stroke();
                    cxt.restore();
                };
            },
            fillTriangle: (cmd, x1, y1, x2, y2, x3, y3, color) => {
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintFillStyle(i))
                        out.push(`${ctxPrefix}fillStyle = "${fillStyle[i]}";`);
                    out.push(`${ctxPrefix}fillTriangle(${x1},${y1},${x2},${y2},${x3},${y3});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    console.log('draw fillTriangle', x1, y1, x2, y2, x3, y3, t);
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.moveTo(x1, y1);
                    cxt.lineTo(x2, y2);
                    cxt.lineTo(x3, y3);
                    cxt.closePath();
                    cxt.fill();
                    cxt.restore();
                };
            },
            strokeTriangle: (cmd, x1, y1, x2, y2, x3, y3, color) => {
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintStrokeStyle(i))
                        out.push(`${ctxPrefix}strokeStyle = "${strokeStyle[i]}";`);
                    out.push(`${ctxPrefix}strokeTriangle(${x1},${y1},${x2},${y2},${x3},${y3});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    console.log('draw strokeTriangle', x1, y1, x2, y2, x3, y3, t);
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.moveTo(x1, y1);
                    cxt.lineTo(x2, y2);
                    cxt.lineTo(x3, y3);
                    cxt.closePath();
                    cxt.stroke();
                    cxt.restore();
                };
            },
            fillArc: (cmd, x, y, radius, startAngle, endAngle, counterclockwise, color) => {
                const ccw = counterclockwise !== undefined ? counterclockwise : false;
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintFillStyle(i))
                        out.push(`${ctxPrefix}fillStyle = "${fillStyle[i]}";`);
                    out.push(`${ctxPrefix}fillArc(${x},${y},${radius},${startAngle},${endAngle}${ccw ? ',true' : ''});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.arc(x, y, radius, degToRad(startAngle), degToRad(endAngle), ccw);
                    cxt.closePath();
                    cxt.fill();
                    cxt.restore();
                };
            },
            strokeArc: (cmd, x, y, radius, startAngle, endAngle, counterclockwise, color) => {
                const ccw = counterclockwise !== undefined ? counterclockwise : false;
                obj.getHTML = (t) => {
                    let out = [];
                    if (shouldPrintStrokeStyle(i))
                        out.push(`${ctxPrefix}strokeStyle = "${strokeStyle[i]}";`);
                    out.push(`${ctxPrefix}strokeArc(${x},${y},${radius},${startAngle},${endAngle}${ccw ? ',true' : ''});`)
                    return out;
                };
                obj.draw = (cxt, t) => {
                    cxt.save();
                    cxt.strokeStyle = lerp_rgbA(strokeStyle[i], t);
                    cxt.fillStyle   = lerp_rgbA(fillStyle  [i], t);
                    cxt.beginPath();
                    cxt.arc(x, y, radius, degToRad(startAngle), degToRad(endAngle), ccw);
                    cxt.stroke();
                    cxt.restore();
                };
            },

            error: (msg) => {
            },
            default: (cmd) => {
            }
        })
    }

    /** @type {PrecomputedTransform[]} */
    const precomputed = [];
    for (let i = 0; i < transformList.length; i++) {

        /**
         * Fallback interpolation function if none is provided.
         * @param {DOMMatrix} prev 
         * @param {number} t 
         * @returns {DOMMatrix}
         */
        function fallbackInterpolation(prev, t) {
            // Fallback: Linear interpolation of matrix components
            const next = matrixes[i];
            const result = new DOMMatrix();
            result.a = lerp(prev.a, next.a, t);
            result.b = lerp(prev.b, next.b, t);
            result.c = lerp(prev.c, next.c, t);
            result.d = lerp(prev.d, next.d, t);
            result.e = lerp(prev.e, next.e, t);
            result.f = lerp(prev.f, next.f, t);
            return result;
        }

        // Use applyTransform if available, otherwise fall back to matrix interpolation
        const interpolate = tempObjs[i].applyTransform || fallbackInterpolation;

        /**
         * @template T
         * @param {CanvasRenderingContext2D} cxt
         * @param {number} t
         * @param {((cxt: CanvasRenderingContext2D) => T)} drawBlock
         * @return {T}
         */
        function drawInFrameFn(cxt, t, drawBlock) {
            cxt.save();

            // Apply the transform using the proper interpolation method
            const prev = prevMatrixes[i];
            
            // Get the interpolated matrix
            const interpolated = interpolate(prev, t);
            
            // Apply the interpolated matrix
            cxt.setTransform(cxt.getTransform().multiply(interpolated));
            cxt.fillStyle   = precomputed[i].applyFillStyle  (/** @type {string} */ (cxt.fillStyle  ), t);
            cxt.strokeStyle = precomputed[i].applyStrokeStyle(/** @type {string} */ (cxt.strokeStyle), t);
            let out = drawBlock(cxt);
            cxt.restore();
            return out;
        }

        precomputed.push({
            raw: transformList[i],
            command: transformList[i][0],
            params: transformList[i].slice(1),
            prevMatrix: prevMatrixes[i] || new DOMMatrix(),
            matrix: matrixes[i] || new DOMMatrix(),

            getHTML: tempObjs[i].getHTML || (() => ""),
            draw   : tempObjs[i].draw    || (() => {}),
            drawInFrame: drawInFrameFn,
            applyTransform  : tempObjs[i].applyTransform   || ((matrix, _t) => matrix),
            applyFillStyle  : tempObjs[i].applyFillStyle   || ((color, t) => lerp_rgbA(color, t)),
            applyStrokeStyle: tempObjs[i].applyStrokeStyle || ((color, t) => lerp_rgbA(color, t)),
            is_save   : (transformList[i][0] === "save"   ) ? (() => true) : (() => false),
            is_restore: (transformList[i][0] === "restore") ? (() => true) : (() => false),
        });
    }

    return precomputed;
}

/**
 * Make the draw function that the canvas will need
 * @param {HTMLCanvasElement} canvas 
 * @param {any[][]} transformList 
 * @param {HTMLElement} div 
 * @param {HTMLInputElement} [dirTog]
 * @param {HTMLInputElement} [orTog]
 * @param {HTMLInputElement} [finalTog]
 * @returns {function(HTMLCanvasElement, number): void}
 */
function makeDraw(canvas, transformList, div, dirTog = undefined, orTog = undefined, finalTog = undefined, isFinal = false) {

    /** @type {PrecomputedTransform[]} */
    const precomputedTransforms = precomputeTransforms(transformList);

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} param
     * @returns {void}
     */
    return function draw(canvas, param) {
        const context = canvas.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(CANVAS_SCALE, CANVAS_SCALE);

        // Always use forward direction - slider always maps 0 to start, max to end
        // Reverse playback checkbox only affects playback direction, not slider mapping
        const directionFalse = (dirTog && dirTog.checked            ) ? -1 : 1;
        const direction      = (dirTog && dirTog.checked && !isFinal) ? -1 : 1;

        // Draw original coordinate system if enabled
        if (!orTog || orTog.checked) {
            if (directionFalse < 0) {
                drawCsys(context, BACKWARDS_MODE_START_COORD_FRAME_COLOR);
            } else {
                drawCsys(context, FORWARD_MODE_START_COORD_FRAME_COLOR);
            }
        }

        const html = htmlForTransforms(
            context,
            precomputedTransforms,
            param,
            //!isFinal && (direction < 0) ? (precomputedTransforms.length - param) : param,
            direction,
        );

        drawTransforms({
            cxt: context,
            precomputedTransforms: precomputedTransforms,
            direction: direction,

            param: param,
            drawBlock: (cxt) => {
                // Draw final coordinate system if enabled
                if (!finalTog || finalTog.checked) {
                    if (directionFalse < 0) {
                        drawCsys(cxt, BACKWARDS_MODE_CURR_COORD_FRAME_COLOR);
                    } else {
                        drawCsys(cxt, FORWARD_MODE_CURR_COORD_FRAME_COLOR);
                    }
                }
            }   
        }); 
        
        context.restore();
        div.innerHTML = html;
    };
}

/**
 * Make a select with given parameters
 * @param {string[]} values
 * @param {HTMLDivElement} where
 * @param {string} [initial]
 */
export function makeSelect(values, where, initial) {
    const select = document.createElement("select");
    values.forEach(ch => {
        const opt = document.createElement("option");
        opt.value = ch;
        opt.text = ch;
        select.add(opt);
    });
    if (initial) {
        select.value = initial;
    }
    where.appendChild(select);
    return select;
}

/**
 * 
 * @param {string} htmlString
 * @returns {Element}
 */
function parseHTML(htmlString) {
    const tpl = document.createElement('template');
    tpl.innerHTML = htmlString.trim();          // parse here
    const node = tpl.content.firstElementChild; // DOM element
    if (!node) {
        throw new Error("No valid HTML element found");
    }
    return node;
}

/**
 * Create a transformation example
 * @param {string} title 
 * @param {Array<Array<any>>} [transforms] 
 * @returns {HTMLDivElement}
 */
export function createExample(title, transforms = undefined) {

    const UNHIDE = "block";
    const UNHIDE_INLINE = "inline-block";
    const HIDE   = "none";

    // Get canvas size from URL parameter, default to CANVAS_SIZE constant
    const urlParams = new URLSearchParams(window.location.search);

    // Get Canvas Size
    const canvasSize = parseInt(urlParams.get('canvasSize') || String(CANVAS_SIZE));

    // Show final result checkbox
    const showFinalParam = urlParams.get('showFinal');
    const initialShowFinal = showFinalParam === null || showFinalParam === 'true' || showFinalParam === '1';

    // Reverse playback checkbox
    const reverseParam = urlParams.get('reverse');
    const initialReverse = reverseParam === 'true' || reverseParam === '1';

    const showExtraValue = urlParams.get('showExtra');
    const showExtra = showExtraValue === 'true' || showExtraValue === '1';

    // Sanitize title for use in IDs (replace spaces and special chars with hyphens)
    const titleId = title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    const backwardsModeCheckbox = `
        <input type="checkbox" id="${titleId}-left-reverse-toggle" title="Time Travel from last object's view" ${initialReverse ? 'checked' : ''}></input>
        <label id="${titleId}-left-reverse-label" for="${titleId}-left-reverse-toggle">Backwards Mode</label>
    `.trim();

    const out = /** @type {HTMLDivElement} */ (parseHTML(`
    <div id="${titleId}-example" style="width: 97%;">
        <div id="${titleId}-inner-grid" style="
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: auto;
            gap: 0px 10px;
            margin: 10px;
        ">

            <div    id="${titleId}-left-title"  class="left  title" style="width: 100%; text-align: center; font-weight: bold; font-size: 1.2em;">${title}</div>
            <div    id="${titleId}-right-title" class="right title" style="width: 100%; text-align: center; font-weight: bold; font-size: 1.2em;">Final Result</div>

            <canvas id="${titleId}-left-canvas"  class="left  canvas" style="width: 100%; max-width: ${canvasSize*1.5}px;"></canvas>
            <canvas id="${titleId}-right-canvas" class="right canvas" style="width: 100%; max-width: ${canvasSize*1.5}px;"></canvas>

            <div    id="${titleId}-play-slider" class="left slider full_row" style="width: 100%; padding-bottom:10px;">
                <div id="${titleId}-slider-div" style="width: 100%; padding-bottom: 10px; padding-top:10px; display: flex; align-items: center; gap: 5px;"></div>
                <div>
                    <button id="${titleId}-first-button">First</button>
                    <button id="${titleId}-prev-button">Prev</button>
                    <button id="${titleId}-next-button">Next</button>
                    <button id="${titleId}-last-button">Last</button>
                    ${!showExtra ? backwardsModeCheckbox : ''}
                </div>
            </div>

            <div    id="${titleId}-left-checkboxes"  class="left  checkboxes" style="padding: 0px; margin: 0px;">
                ${showExtra ? backwardsModeCheckbox + '<br/>' : ''}
                <input type="checkbox" id="${titleId}-left-final-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" ${initialShowFinal ? 'checked' : ''}></input>
                <label id="${titleId}-left-final-label" for="${titleId}-left-final-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};">Final Result</label>
                <br  style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" />
                <input type="checkbox" id="${titleId}-left-code-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" checked></input>
                <label id="${titleId}-left-code-label" for="${titleId}-left-code-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};">Code</label>
            </div>
            <div    id="${titleId}-right-checkboxes" class="right checkboxes" style="padding: 0px; margin: 0px;">
                <input type="checkbox" id="${titleId}-right-orig-frame-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" checked></input>
                <label id="${titleId}-right-orig-frame-label" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" for="${titleId}-right-orig-frame-toggle">Original Coordinate System</label>
                <br  style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" />
                <input type="checkbox" id="${titleId}-right-final-frame-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};"></input>
                <label id="${titleId}-right-final-frame-label" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" for="${titleId}-right-final-frame-toggle">Final Coordinate System</label>
                <br  style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" />
                <input type="checkbox" id="${titleId}-right-code-toggle" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" checked></input>
                <label id="${titleId}-right-code-label" style="display: ${showExtra ? UNHIDE_INLINE : HIDE};" for="${titleId}-right-code-toggle">Code</label>
            </div>

            <div    id="${titleId}-left-code"        class="left  code"></div>
            <div    id="${titleId}-right-code"       class="right code"></div>

        </div>
    </div>
    `));

    document.getElementsByTagName("body")[0].appendChild(out)

    const grid = /** @type {HTMLDivElement} */ (out.children[0]);
    const gridChildren = [...grid.children];
    const leftWrappers = gridChildren.filter(c => c.classList.contains("left"));
    const rightWrappers = gridChildren.filter(c => c.classList.contains("right"));

    for (const child of gridChildren) {
        // put into a div so that the contained value can be hidden without changing the layout
        {
            const wrapper = document.createElement("div");
            wrapper.style.width = "100%";
            
            // Copy relevant classes to wrapper so logic works correctly
            if (child.classList.contains("left")) {
                wrapper.classList.add("left");
            }
            if (child.classList.contains("right")) {
                wrapper.classList.add("right");
            }
            if (child.classList.contains("full_row")) {
                wrapper.classList.add("full_row");
            }
            
            // Center canvas, title, and slider elements
            if (child.classList.contains("canvas") || child.classList.contains("title") || child.classList.contains("slider")) {
                wrapper.style.display = "flex";
                wrapper.style.justifyContent = "center";
                wrapper.style.alignItems = "center";
            }
            
            child.parentNode?.replaceChild(wrapper, child);
            wrapper.appendChild(child);

            if (wrapper.classList.contains("full_row")) {
                wrapper.style.gridColumn = "span 2";
            }

            if (wrapper.classList.contains("left")) {
                leftWrappers.push(wrapper);
            } else if (wrapper.classList.contains("right")) {
                rightWrappers.push(wrapper);
            }
        }

        if (child.classList.contains("canvas")) {
            const chld = /** @type {HTMLCanvasElement} */ (child);
            chld.width = canvasSize;
            chld.height = canvasSize;
            chld.style.width = "100%";
        } else if (child.classList.contains("code")) {
            const chld = /** @type {HTMLElement} */ (child);
            chld.style.cssText = "font-family: 'Courier New', Courier, monospace; font-size: 120%; padding-top: 5px; padding-bottom: 5px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-all; max-width: 100%;"
        } else if (child.classList.contains("checkboxes")) {
        } else if (child.classList.contains("slider")) {
        }
    }

    const leftCanvas = /** @type {HTMLCanvasElement} */ (out.querySelector(`#${titleId}-left-canvas`));
    const rightCanvas = /** @type {HTMLCanvasElement} */ (out.querySelector(`#${titleId}-right-canvas`));
    const leftCodeDiv = /** @type {HTMLElement} */ (out.querySelector(`#${titleId}-left-code`));
    const rightCodeDiv = /** @type {HTMLElement} */ (out.querySelector(`#${titleId}-right-code`));
    const dirTog = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-left-reverse-toggle`));
    const resultTog = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-left-final-toggle`));
    const rightInstructionsTog = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-right-code-toggle`));
    const orTogRight = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-right-orig-frame-toggle`));
    const finalTog = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-right-final-frame-toggle`));
    const slider = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-slider`));
    const firstButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-first-button`));
    const lastButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-last-button`));
    const prevButton = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-prev-button`));
    const nextButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-next-button`));
    const leftInstructionsTog = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-left-code-toggle`));
    const reverseLabel = /** @type {HTMLLabelElement} */ (out.querySelector(`#${titleId}-left-reverse-label`));

    const leftHeader = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-left-title`));
    const rightHeader = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-right-title`));
    const innerGrid = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-inner-grid`));

    const sliderDiv = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-slider-div`));

    // Debug logging
    if (!leftCanvas) console.error(`Could not find #${titleId}-left-canvas`);
    if (!leftHeader) console.error(`Could not find #${titleId}-left-title`);
    if (!rightHeader) console.error(`Could not find #${titleId}-right-title`);
    if (!rightCanvas) console.error(`Could not find #${titleId}-right-canvas`);
    if (!leftCodeDiv) console.error(`Could not find #${titleId}-left-code`);
    if (!rightCodeDiv) console.error(`Could not find #${titleId}-right-code`);
    if (!dirTog) console.error(`Could not find #${titleId}-left-reverse-toggle`);
    if (!resultTog) console.error(`Could not find #${titleId}-left-final-toggle`);
    if (!orTogRight) console.error(`Could not find #${titleId}-right-orig-frame-toggle`);
    if (!finalTog) console.error(`Could not find #${titleId}-right-final-frame-toggle`);
    if (!firstButton) console.error(`Could not find #${titleId}-first-button`);
    if (!lastButton) console.error(`Could not find #${titleId}-last-button`);
    if (!prevButton) console.error(`Could not find #${titleId}-play-button`);
    if (!nextButton) console.error(`Could not find #${titleId}-pause-button`);
    if (!leftInstructionsTog) console.error(`Could not find #${titleId}-left-code-toggle`);
    if (!rightInstructionsTog) console.error(`Could not find #${titleId}-right-code-toggle`);
    if (!leftCodeDiv) console.error(`Could not find #${titleId}-left-code`);
    if (!rightCodeDiv) console.error(`Could not find #${titleId}-right-code`);

    const canvasName = `${titleId}-left-canvas`;

    if (!initialShowFinal) {
        hideRight();
    } else {
        showRight();
    }

    function showRight() {
        for (const wrapper of rightWrappers) {
            const wrap = /** @type {HTMLDivElement} */ (wrapper);
            wrap.style.display = UNHIDE;
        }
        for (const wrapper of leftWrappers) {
            if (wrapper.classList.contains("full_row")) continue;
            const wrap = /** @type {HTMLDivElement} */ (wrapper);
            wrap.style.gridColumn = "span 1";
        }
        resizeIframe();
    }

    function hideRight() {
        for (const wrapper of rightWrappers) {
            const wrap = /** @type {HTMLDivElement} */ (wrapper);
            wrap.style.display = HIDE;
        }
        for (const wrapper of leftWrappers) {
            const wrap = /** @type {HTMLDivElement} */ (wrapper);
            wrap.style.gridColumn = "span 2";
        }
        resizeIframe();
    }

    function resizeIframe() {
        // Post message to parent to resize iframe
        // Use setTimeout to allow DOM to reflow after visibility changes
        const height = document.body.scrollHeight;
        window.parent.postMessage({ type: 'resize', height: height }, '*');
    }    

    /**
     * Run the program with a given transform list
     * @param {Array<Array<any>>} transformsToDo
     */
    function run(transformsToDo) {
        // set up the left part
        let md = makeDraw(leftCanvas, transformsToDo, leftCodeDiv, dirTog);
        let rc = new RunCanvas(canvasName, md, false, sliderDiv, dirTog);
        rc.noloop = true;
        rc.setupSlider(0, transformsToDo.length, PLAY_STEP_SIZE);
        
        // Set initial reverse state and slider position from URL parameter
        if (initialReverse && !dirTog.disabled) {
            dirTog.checked = true;
            if (REVERSE_PLAYBACK_RL) {
                rc.setValue(transformsToDo.length);
            } else {
                rc.setValue(0);
            }
        } else {
            rc.setValue(0);
        }

        dirTog.onchange = () => {
            if (dirTog.checked) {
                if (REVERSE_PLAYBACK_RL) {
                    // rc.animateSliderToValue(transformsToDo.length, lastDuration(Number(rc.range.value), transformsToDo.length));
                    rc.setValue(rc.range.max);
                } else {
                    // rc.animateSliderToValue(0, firstDuration(Number(rc.range.value), transformsToDo.length));
                    rc.setValue(rc.range.max);
                }
            } else {
                // Smoothly animate to beginning when reverse playback is disabled
                // rc.animateSliderToValue(0, firstDuration(Number(rc.range.value), transformsToDo.length));
                rc.setValue(rc.range.min);
            }
            mdFinal(rightCanvas, Number(rc.range.max));
        };

        // Set up step button handlers with animation
        firstButton.onclick = () => {
            //rc.animateSliderToValue(0, firstDuration(Number(rc.range.value), transformsToDo.length));
            rc.setValue(rc.range.min);
        };

        prevButton.onclick = () => {
            const currentValue = Number(rc.range.value);
            const isOnInteger = Math.abs(currentValue - Math.round(currentValue)) < 0.001;
            const newValue = isOnInteger 
                ? Math.max(0, currentValue - 1)
                : Math.max(0, Math.floor(currentValue));
            rc.animateSliderToValue(newValue, prevDuration(Number(rc.range.value), transformsToDo.length));
        };

        nextButton.onclick = () => {
            const currentValue = Number(rc.range.value);
            const isOnInteger = Math.abs(currentValue - Math.round(currentValue)) < 0.001;
            const newValue = isOnInteger
                ? Math.min(transformsToDo.length, currentValue + 1)
                : Math.min(transformsToDo.length, Math.ceil(currentValue));
            rc.animateSliderToValue(newValue, nextDuration(Number(rc.range.value), transformsToDo.length));
        };

        lastButton.onclick = () => {
            //rc.animateSliderToValue(transformsToDo.length, lastDuration(Number(rc.range.value), transformsToDo.length));
            rc.setValue(rc.range.max);
        };

        // set up the right part if the checkbox is checked
        resultTog.onchange = function () {
            if (resultTog.checked) {
                showRight();
            } else {
                hideRight();
            }
            
            // Update URL with showFinal parameter
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('showFinal', resultTog.checked.toString());
            const newUrl = window.location.pathname + '?' + urlParams.toString();
            window.history.pushState({showFinal: resultTog.checked}, '', newUrl);
        };

        // set up the right part
        let mdFinal = makeDraw(rightCanvas, transformsToDo, rightCodeDiv, dirTog, orTogRight, finalTog, true);
        mdFinal(rightCanvas, transformsToDo.length);

        finalTog.onchange = function () {
            mdFinal(rightCanvas, transformsToDo.length);
        };

        orTogRight.onchange = function () {
            mdFinal(rightCanvas, transformsToDo.length);
        };
        
        // Handle showing/hiding final result instructions
        rightInstructionsTog.onchange = function () {
            if (rightInstructionsTog.checked) {
                rightCodeDiv.style.display = UNHIDE;
            } else {
                rightCodeDiv.style.display = HIDE;
            }
            resizeIframe();
        };
        
        // Handle showing/hiding left panel instructions
        leftInstructionsTog.onchange = function () {
            if (leftInstructionsTog.checked) {
                leftCodeDiv.style.display = UNHIDE;
            } else {
                leftCodeDiv.style.display = HIDE;
            }
            resizeIframe();
        };
    }

    /**
     * Hide reverse if there is save/restore command
     * @param {Array<Array<any>>} transformList
     */
    function hideDirTog(transformList) {
        for (let i = 0; i < transformList.length; i++) {
            let t = transformList[i];
            if (t[0] == "save" || t[0] == "restore") {
                dirTog.disabled = true;
                dirTog.style.color = "lightgray";
                dirTog.title = "Cannot reverse animations that contain save/restore commands";
                reverseLabel.style.color = "lightgray";
                reverseLabel.title = "Cannot reverse animations that contain save/restore commands";
                return;
            }
        }
        dirTog.disabled = false;
        dirTog.style.color = "black";
        dirTog.title = "Play the animation in reverse";
        reverseLabel.style.color = "black";
        reverseLabel.title = "";
    }

/**
     * Reset the running canvas
     */
    function reset() {
        leftCanvas.getContext("2d")?.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
        rightCanvas.getContext("2d")?.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
        const slider = document.getElementById(canvasName + "-slider");
        const text = document.getElementById(canvasName + "-text");
        const run = document.getElementById(canvasName + "-run");
        const br = document.getElementById(canvasName + "-br");
        const play = document.getElementById(canvasName + "-play");
        if (slider) slider.style.display = HIDE;
        if (text) text.style.display = HIDE;
        if (run) run.style.display = HIDE;
        if (br) br.style.display = HIDE;
        if (play) play.style.display = HIDE;
    }

    if (transforms) {
        hideDirTog(transforms);
        run(transforms);
        return out;
    }

    // Hide inner-grid initially for custom examples
    innerGrid.style.display = HIDE;

    const customArea = /** @type {HTMLDivElement} */ parseHTML(`
        <div id="${titleId}-custom" style="padding-left: 10px; padding-right: 10px; padding-bottom: 10px;">
            <p id="${titleId}-instruction" style="margin-top:0; margin-bottom:10px;">
                You can use this example to construct your own code transformation compositions. <br>
                Enter commands in the text editor below.<br>
                The supported commands are:<br>
                <b>translate(x, y)</b> - Move the coordinate system<br>
                <b>scale(x, y)</b> - Scale the coordinate system<br>
                <b>rotate(angle)</b> - Rotate by angle in degrees<br>
                <b>fillStyle = color</b> - Set fill color (where color can be "red", "#FF0000", etc.)<br>
                <b>strokeStyle = color</b> - Set stroke color (where color can be "blue", "#0000FF", etc.)<br>
                <b>fillRect(x, y, width, height)</b> - Draw a filled rectangle<br>
                <b>strokeRect(x, y, width, height)</b> - Draw a rectangle outline<br>
                <b>fillTriangle(x1, y1, x2, y2, x3, y3)</b> - Draw a filled triangle<br>
                <b>strokeTriangle(x1, y1, x2, y2, x3, y3)</b> - Draw a triangle outline<br>
                <b>transform(a, b, c, d, e, f)</b> - Apply transformation matrix<br>
                <b>save()</b> and <b>restore()</b> - Save/restore transformation state<br>
                Enter one command per line. Example: translate(10, 20)
            </p>
            <textarea id="${titleId}-textarea" style="width: 100%; height: 150px; font-family: 'Courier New', Courier, monospace; font-size: 14px; margin-bottom: 5px; padding: 5px; box-sizing: border-box;" placeholder="translate(10, 20)\nrotate(45)\nscale(1.5, 1.5)"></textarea>
            <div id="${titleId}-error" style="color: red; font-weight: bold; margin-bottom: 5px; min-height: 20px; font-size: 14px;"></div>
            <div id="${titleId}-button-row" style="margin-bottom: 10px;"></div>
            <input type="file" id="${titleId}-file-input" accept=".json" style="display: none;">
            <button id="${titleId}-run">Run</button>
            <button id="${titleId}-reset">Reset</button>
            <button id="${titleId}-save">Save</button>
            <button id="${titleId}-load">Load</button>
            <button id="${titleId}-edit" style="display: none; margin-left: 10px; margin-bottom: 10px;">Edit</button>
        </div>
    `);
    out.appendChild(customArea);

    const textArea = /** @type {HTMLTextAreaElement} */ (out.querySelector(`#${titleId}-textarea`));
    const errorDiv = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-error`));
    const instructionPara = /** @type {HTMLParagraphElement} */ (out.querySelector(`#${titleId}-instruction`));
    const runButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-run`));
    const resetButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-reset`));
    const loadButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-load`));
    const saveButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-save`));
    const editButton = /** @type {HTMLButtonElement} */ (out.querySelector(`#${titleId}-edit`));
    const fileInput = /** @type {HTMLInputElement} */ (out.querySelector(`#${titleId}-file-input`));
    const buttonContainer = /** @type {HTMLDivElement} */ (out.querySelector(`#${titleId}-button-row`));

    /** @type {Array<Array<any>>} */
    let customTransformList = [];
    /** @type {boolean} */
    let running = false;

    /**
     * Parse a command string into a transformation array
     * @param {string} line
     * @returns {{transform: Array<any> | null, error: string | null}}
     */
    function parseCommand(line) {
        line = line.trim();
        if (!line) return { transform: null, error: null };

        let command, paramsStr;
        
        // Try to match assignment syntax first (for fillStyle and strokeStyle)
        let assignMatch = line.match(/^(\w+)\s*=\s*(.+?);?$/);
        if (assignMatch && (assignMatch[1] === "fillStyle" || assignMatch[1] === "strokeStyle")) {
            command = assignMatch[1];
            paramsStr = assignMatch[2].trim();
        } else {
            // Match command pattern: commandName(params)
            let match = line.match(/^(\w+)\((.*)\);?$/);
            if (!match) {
                return { transform: null, error: `Invalid syntax: "${line}". Expected format: command(params) or fillStyle/strokeStyle = "color"` };
            }
            command = match[1];
            paramsStr = match[2].trim();
        }

        // Parse parameters
        let params = [];
        if (paramsStr) {
            // Check if this is a color command (fillStyle or strokeStyle)
            if (command === "fillStyle" || command === "strokeStyle") {
                // Remove quotes if present
                let color = paramsStr.replace(/^["']|["']$/g, '').trim();
                if (!color) {
                    return { transform: null, error: `${command} requires a color parameter` };
                }
                params.push(color);
            } else {
                // Parse numeric parameters
                let paramParts = paramsStr.split(',');
                for (let p of paramParts) {
                    let num = parseFloat(p.trim());
                    if (isNaN(num)) {
                        return { transform: null, error: `Invalid number: "${p.trim()}" in command: ${line}` };
                    }
                    params.push(num);
                }
            }
        }

        // Validate commands
        if (command === "translate") {
            if (params.length !== 2) {
                return { transform: null, error: `translate requires 2 parameters (x, y), got ${params.length}` };
            }
            return { transform: ["translate", params[0], params[1]], error: null };
        } else if (command === "scale") {
            if (params.length !== 2) {
                return { transform: null, error: `scale requires 2 parameters (x, y), got ${params.length}` };
            }
            return { transform: ["scale", params[0], params[1]], error: null };
        } else if (command === "rotate") {
            if (params.length !== 1) {
                return { transform: null, error: `rotate requires 1 parameter (angle), got ${params.length}` };
            }
            return { transform: ["rotate", params[0]], error: null };
        } else if (command === "fillRect") {
            if (params.length !== 4) {
                return { transform: null, error: `fillRect requires 4 parameters (x, y, width, height), got ${params.length}` };
            }
            return { transform: ["fillRect", params[0], params[1], params[2], params[3]], error: null };
        } else if (command === "strokeRect") {
            if (params.length !== 4) {
                return { transform: null, error: `strokeRect requires 4 parameters (x, y, width, height), got ${params.length}` };
            }
            return { transform: ["strokeRect", params[0], params[1], params[2], params[3]], error: null };
        } else if (command === "fillTriangle") {
            if (params.length !== 6) {
                return { transform: null, error: `fillTriangle requires 6 parameters (x1, y1, x2, y2, x3, y3), got ${params.length}` };
            }
            return { transform: ["fillTriangle", params[0], params[1], params[2], params[3], params[4], params[5]], error: null };
        } else if (command === "strokeTriangle") {
            if (params.length !== 6) {
                return { transform: null, error: `strokeTriangle requires 6 parameters (x1, y1, x2, y2, x3, y3), got ${params.length}` };
            }
            return { transform: ["strokeTriangle", params[0], params[1], params[2], params[3], params[4], params[5]], error: null };
        } else if (command === "fillArc") {
            if (params.length < 5 || params.length > 6) {
                return { transform: null, error: `fillArc requires 5 or 6 parameters (x, y, radius, startAngle, endAngle, [counterclockwise]), got ${params.length}` };
            }
            if (params.length === 6) {
                // Parse counterclockwise: 0 = false, 1 = true
                if (params[5] !== 0 && params[5] !== 1) {
                    return { transform: null, error: `fillArc counterclockwise parameter must be 0 (false) or 1 (true), got ${params[5]}` };
                }
                const ccw = params[5] === 1;
                return { transform: ["fillArc", params[0], params[1], params[2], params[3], params[4], ccw], error: null };
            }
            return { transform: ["fillArc", params[0], params[1], params[2], params[3], params[4]], error: null };
        } else if (command === "strokeArc") {
            if (params.length < 5 || params.length > 6) {
                return { transform: null, error: `strokeArc requires 5 or 6 parameters (x, y, radius, startAngle, endAngle, [counterclockwise]), got ${params.length}` };
            }
            if (params.length === 6) {
                // Parse counterclockwise: 0 = false, 1 = true
                if (params[5] !== 0 && params[5] !== 1) {
                    return { transform: null, error: `strokeArc counterclockwise parameter must be 0 (false) or 1 (true), got ${params[5]}` };
                }
                const ccw = params[5] === 1;
                return { transform: ["strokeArc", params[0], params[1], params[2], params[3], params[4], ccw], error: null };
            }
            return { transform: ["strokeArc", params[0], params[1], params[2], params[3], params[4]], error: null };
        } else if (command === "transform") {
            if (params.length !== 6) {
                return { transform: null, error: `transform requires 6 parameters (a, b, c, d, e, f), got ${params.length}` };
            }
            return { transform: ["transform", params[0], params[1], params[2], params[3], params[4], params[5]], error: null };
        } else if (command === "save") {
            if (params.length !== 0) {
                return { transform: null, error: `save requires no parameters, got ${params.length}` };
            }
            return { transform: ["save"], error: null };
        } else if (command === "restore") {
            if (params.length !== 0) {
                return { transform: null, error: `restore requires no parameters, got ${params.length}` };
            }
            return { transform: ["restore"], error: null };
        } else if (command === "fillStyle") {
            if (params.length !== 1) {
                return { transform: null, error: `fillStyle requires 1 parameter (color), got ${params.length}` };
            }
            return { transform: ["fillStyle", params[0]], error: null };
        } else if (command === "strokeStyle") {
            if (params.length !== 1) {
                return { transform: null, error: `strokeStyle requires 1 parameter (color), got ${params.length}` };
            }
            return { transform: ["strokeStyle", params[0]], error: null };
        } else {
            return { transform: null, error: `Unknown command: "${command}". Supported: translate, scale, rotate, fillStyle, strokeStyle, fillRect, transform, save, restore` };
        }
    }

    /**
     * Parse all commands from textarea
     * @returns {{transforms: Array<Array<any>>, error: string | null}}
     */
    function parseAllCommands() {
        let lines = textArea.value.split('\n');
        let transforms = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            let result = parseCommand(line);
            if (result.error) {
                return { transforms: [], error: `Line ${i + 1}: ${result.error}` };
            }
            if (result.transform) {
                transforms.push(result.transform);
            }
        }
        
        return { transforms: transforms, error: null };
    }

    // Real-time validation as user types
    textArea.oninput = function () {
        if (running) return; // Don't validate while running
        
        let result = parseAllCommands();
        if (result.error) {
            errorDiv.textContent = result.error;
            errorDiv.style.color = "red";
        } else if (result.transforms.length === 0) {
            errorDiv.textContent = "";
        } else {
            errorDiv.textContent = `✓ ${result.transforms.length} valid command${result.transforms.length > 1 ? 's' : ''}`;
            errorDiv.style.color = "green";
        }
    };

    runButton.onclick = function () {
        // Parse commands from textarea
        let result = parseAllCommands();
        
        if (result.error) {
            errorDiv.textContent = result.error;
            errorDiv.style.color = "red";
            return;
        }
        
        if (result.transforms.length === 0) {
            errorDiv.textContent = "No commands to run. Please enter at least one command.";
            errorDiv.style.color = "red";
            return;
        }

        // Clear any previous error
        errorDiv.textContent = "";
        
        // in case the user keeps clicking run
        if (running) {
            leftCodeDiv.innerHTML = "";
            rightCodeDiv.innerHTML = "";
            sliderDiv.innerHTML = "";
            reset();
        }
        
        customTransformList = result.transforms;
        hideDirTog(customTransformList);
        
        // Uncheck reverse playback when running
        dirTog.checked = false;
        
        // Run the transformations
        run(customTransformList);
        innerGrid.style.display = "grid"; // show the grid with proper display type
        buttonContainer.style.display = UNHIDE; // show the buttons
        leftCanvas.style.display = UNHIDE; // show canvases
        rightCanvas.style.display = resultTog.checked ? UNHIDE : HIDE;
        rightHeader.style.display = resultTog.checked ? UNHIDE : HIDE;

        // Hide the input elements and Run/Reset buttons while running
        textArea.style.display = HIDE;
        errorDiv.style.display = HIDE;
        instructionPara.style.display = HIDE;
        runButton.style.display = HIDE;
        resetButton.style.display = HIDE;
        loadButton.style.display = HIDE;
        saveButton.style.display = HIDE;
        editButton.style.display = UNHIDE_INLINE;
        running = true;
        resizeIframe();
    };

    editButton.onclick = function () {
        // Show the input elements and Run/Reset buttons
        instructionPara.style.display = UNHIDE;
        textArea.style.display = UNHIDE;
        errorDiv.style.display = UNHIDE;
        runButton.style.display = UNHIDE_INLINE;
        resetButton.style.display = UNHIDE_INLINE;
        loadButton.style.display = UNHIDE_INLINE;
        saveButton.style.display = UNHIDE_INLINE;
        editButton.style.display = HIDE;
        
        // Hide the running elements
        innerGrid.style.display = HIDE;
        buttonContainer.style.display = HIDE;
        leftCanvas.style.display = HIDE; // hide canvases
        rightCanvas.style.display = HIDE;
        rightHeader.style.display = HIDE; // hide header
        leftCodeDiv.innerHTML = "";
        rightCodeDiv.innerHTML = "";
        sliderDiv.innerHTML = ""; // Clear slider controls
        
        // Clear canvases
        reset();
        running = false;
        resizeIframe();
    };

    resetButton.onclick = function () {
        // show the input elements
        instructionPara.style.display = UNHIDE;
        textArea.style.display = UNHIDE;
        errorDiv.style.display = UNHIDE;
        runButton.style.display = UNHIDE_INLINE;
        resetButton.style.display = UNHIDE_INLINE;
        loadButton.style.display = UNHIDE_INLINE;
        editButton.style.display = HIDE;
        // clear the code divisions
        leftCodeDiv.innerHTML = "";
        rightCodeDiv.innerHTML = "";
        const play = document.getElementById(canvasName + "-play");
        if (play) play.style.display = HIDE;
        innerGrid.style.display = HIDE;
        buttonContainer.style.display = HIDE;
        // reset reverse toggle
        dirTog.checked = false;
        // reset textarea
        textArea.disabled = false;
        textArea.value = "";
        errorDiv.textContent = "";
        // reset these if it is running
        if (running) {
            reset();
            running = false;
        }
        // clear the transformation list
        customTransformList = [];
    };

    loadButton.onclick = function () {
        fileInput.click();
    };

    fileInput.onchange = function () {
        const file = fileInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const jsonData = JSON.parse(String(e.target?.result));
                
                // Validate JSON structure
                if (!jsonData.transformations || !Array.isArray(jsonData.transformations)) {
                    errorDiv.textContent = "Invalid JSON format: missing or invalid 'transformations' array";
                    errorDiv.style.color = "red";
                    return;
                }

                // Convert transformations back to command strings
                const commandStrings = [];
                for (const transform of jsonData.transformations) {
                    if (!Array.isArray(transform) || transform.length === 0) {
                        errorDiv.textContent = "Invalid JSON format: transformation is not an array";
                        errorDiv.style.color = "red";
                        return;
                    }

                    const command = transform[0];
                    const params = transform.slice(1);
                    
                    if (command === "translate" || command === "scale") {
                        if (params.length !== 2) {
                            errorDiv.textContent = `Invalid ${command} command: expected 2 parameters`;
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}(${params[0]}, ${params[1]})`);
                    } else if (command === "rotate") {
                        if (params.length !== 1) {
                            errorDiv.textContent = "Invalid rotate command: expected 1 parameter";
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}(${params[0]})`);
                    } else if (command === "fillRect") {
                        if (params.length < 4) {
                            errorDiv.textContent = "Invalid fillRect command: expected at least 4 parameters";
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}(${params[0]}, ${params[1]}, ${params[2]}, ${params[3]})`);
                    } else if (command === "transform") {
                        if (params.length !== 6) {
                            errorDiv.textContent = "Invalid transform command: expected 6 parameters";
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}(${params.join(", ")})`);
                    } else if (command === "save" || command === "restore") {
                        if (params.length !== 0) {
                            errorDiv.textContent = `Invalid ${command} command: expected no parameters`;
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}()`);
                    } else if (command === "fillStyle" || command === "strokeStyle") {
                        if (params.length !== 1) {
                            errorDiv.textContent = `Invalid ${command} command: expected 1 parameter`;
                            errorDiv.style.color = "red";
                            return;
                        }
                        commandStrings.push(`${command}("${params[0]}")`);
                    } else {
                        errorDiv.textContent = `Unknown command: ${command}`;
                        errorDiv.style.color = "red";
                        return;
                    }
                }

                // Populate textarea with commands
                textArea.value = commandStrings.join('\n');
                
                // Trigger validation
                textArea.oninput?.(new Event('input'));
                
                // Show success message
                errorDiv.textContent = `✓ Loaded ${jsonData.transformations.length} command${jsonData.transformations.length > 1 ? 's' : ''} from ${file.name}`;
                errorDiv.style.color = "green";
                
            } catch (error) {
                let message = "Unknown error";
                if (error instanceof Error) message = error.message;
                errorDiv.textContent = `Error parsing JSON: ${message}`;
                errorDiv.style.color = "red";
            }
        };
        
        reader.onerror = function () {
            errorDiv.textContent = "Error reading file";
            errorDiv.style.color = "red";
        };
        
        reader.readAsText(file);
        
        // Reset file input so the same file can be loaded again
        fileInput.value = "";
    };

    saveButton.onclick = function () {
        // Parse commands from textarea
        let result = parseAllCommands();
        
        if (result.error) {
            errorDiv.textContent = result.error;
            errorDiv.style.color = "red";
            return;
        }
        
        if (result.transforms.length === 0) {
            errorDiv.textContent = "No commands to save. Please enter at least one command.";
            errorDiv.style.color = "red";
            return;
        }

        // Create JSON object
        const jsonData = {
            title: title,
            transformations: result.transforms
        };

        // Convert to JSON string with formatting
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titleId}-transforms.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        errorDiv.textContent = `✓ Saved ${result.transforms.length} command${result.transforms.length > 1 ? 's' : ''} to ${titleId}-transforms.json`;
        errorDiv.style.color = "green";
    };

    return out;
}

/**
 * the main thing is implemented as a class in case you want access to everything
 */
export class RunCanvas {
    /**
     * 
     * @param {string} canvasName 
     * @param {(canvas: HTMLCanvasElement, value: number) => void} drawFunc 
     * @param {boolean} noLoop 
     * @param {HTMLDivElement} [div]
     * @param {HTMLInputElement} [dirTog]
     */
    constructor(canvasName,drawFunc,noLoop=false, div=undefined, dirTog=undefined) {
        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasName));
        this.canvasName = canvasName;
        this.drawFunc = drawFunc;
        this.noloop = noLoop;
        this.dirTog = dirTog;
        
        // Animation state
        /** @type {number | null} */
        this.animationFrameId = null;
        this.currentTarget = 0;
        /** @type {string | null} */
        this.lastClickType = null;

        if (!div) {
            div = /** @type {HTMLDivElement} */ (this.canvas.parentElement);
        }

        div.style.display = "grid";
        div.style.gridTemplateColumns = "3ch 5ch auto";
        div.style.paddingRight = "0px";

        // create the elements
        this.br = document.createElement("br");
        this.br.id = canvasName + "-br";

        this.range = document.createElement("input");
        this.range.id = canvasName + "-slider";
        this.range.setAttribute("type","range");
        // give default values for range
        this.setupSlider(0,1,0.01);

        this.text = document.createElement("input");
        this.text.id = canvasName+"-text";
        this.text.setAttribute("type","text");
        this.text.style.width = "4ch";
        this.text.setAttribute("readonly","1");

        this.runbutton = document.createElement("input");
        this.runbutton.id=canvasName + "-run";
        this.runbutton.setAttribute("type","checkbox");
        this.runbutton.width=20;
        this.runbutton.style.display = 'none';

        this.playicon = document.createElement("label");
        this.playicon.id = canvasName + "-play";
        this.playicon.setAttribute("for", canvasName + "-run");
        this.playicon.style.marginRight='5';
        this.playicon.style.cssText = "margin-right: 5px;" ;

        this.playimage = document.createElement("img");
        this.playimage.id = "play";
        this.playimage.setAttribute("src", "./images/play-button.png");
        this.playimage.style.cssText = "width: 20px; height: 20px; ";
        this.playicon.appendChild(this.playimage);
     
        //div.appendChild(this.br);
        div.appendChild(this.range);
        div.appendChild(this.text);
        div.appendChild(this.runbutton);
        div.appendChild(this.playicon);
        div.appendChild(this.text);
        div.appendChild(this.range);

        this.runbutton.onchange = () => { 

            if (this.runbutton.checked) {

                // Check if reverse playback is enabled
                let isReverse = this.dirTog?.checked || false;

                // Only move slider backward if both reverse is checked AND REVERSE_PLAYBACK_RL is true
                let shouldMoveBackward = isReverse && REVERSE_PLAYBACK_RL;

                let animateTo;
                if (shouldMoveBackward) {
                    // Move to min
                    animateTo = Number(this.range.min);
                    if (Number(this.range.value) <= Number(this.range.min)) {
                        // If already at min, set to max to start reverse playback
                        this.setValue(Number(this.range.max));
                    }
                } else {
                    // move to max
                    animateTo = Number(this.range.max);
                    if (Number(this.range.value) >= Number(this.range.max)) {
                        // If already at max, set to min to start forward playback
                        this.setValue(Number(this.range.min));
                    }
                }

                this.animateSliderToValue(
                    animateTo,
                    DEFAULT_ANIMATION_DURATION,
                    'const',
                );
                
            } else {
                this.cancelSliderAnimation();
            }
        };
        this.range.oninput = () => {
            this.cancelSliderAnimation();
            let val = Number(this.range.value);
            this.setValue(val);
        };
    
     }

    /**
     * Setup aspects of the slider - as a function in case you need to change them
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     */
    setupSlider(min,max,step) {
        this.range.setAttribute("min",String(min));
        this.range.setAttribute("max",String(max));
        this.range.setAttribute("step",String(step));
    }

    /**
     * @param {String | Number} value 
     */
    setValue(value) {
        this.cancelSliderAnimation();
        let valString = String(value);
        this.range.value = valString;
        this.text.value = valString;
        if (this.drawFunc) {
            this.drawFunc(this.canvas, Number(value));
        }
    }

    /**
     * Cancel any ongoing slider animations.
     */
    cancelSliderAnimation() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this._setPlay();
    }

    /**
     * Animate slider to target value with easing
     * @param {number} targetValue
     * @param {number} timeDuration
     * @param {'lerp' | 'cubic' | 'const' | 'none'} easingType 'lerp' for linear interpolation, 'cubic' for cubic easing, 'const' for constant speed (timeDuration becomes the duration to traverse per unit), 'none' for instant jump
     */
    animateSliderToValue(targetValue, timeDuration = DEFAULT_ANIMATION_DURATION, easingType = 'lerp') {
        this.cancelSliderAnimation();

        // If no easing, just set the value immediately
        if (!isFinite(timeDuration) || timeDuration <= 0 || easingType === 'none') {
            this.setValue(targetValue);
            this.lastClickType = null;
            return;
        }

        // For constant speed, calculate duration based on distance
        // Speed is 1 unit per second (1000ms per unit)
        if (easingType === 'const') {
            const distance = Math.abs(targetValue - Number(this.range.value));
            timeDuration = distance * timeDuration;
            easingType = 'lerp'; // Use linear interpolation for constant speed
        }

        this.currentTarget = targetValue;
        const startValue = Number(this.range.value);
        /** @type {number | null} */
        let startTime = null;

        /**
         * @param {number} currentTime
         */
        const animate = (currentTime) => {
            // Check if animation was cancelled (e.g., by user dragging slider)
            if (this.animationFrameId === null) {
                this._setPlay();
                return
            }
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / timeDuration, 1);
            
            // Choose easing function based on easingType
            let easeProgress;
            if (easingType === 'lerp') {
                // Linear interpolation
                easeProgress = progress;
            } else {
                // Ease in-out cubic
                easeProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            }

            const currentValue = startValue + (this.currentTarget - startValue) * easeProgress;
            this.range.value = String(currentValue);
            this.text .value = String(currentValue);

            if (this.drawFunc) {
                this.drawFunc(this.canvas, currentValue);
            }

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                this.animationFrameId = null;
                this.lastClickType = null;
                this._setPlay();
            }
        };

        this._pauseImage();
        this.animationFrameId = requestAnimationFrame(animate);
    }

    _setPlay() {
        this.playimage.setAttribute("src", "./images/play-button.png");
        this.runbutton.checked = false;
    }

    _pauseImage() {
        this.playimage.setAttribute("src", "./images/pause-button.png");
        this.runbutton.checked = true;
    }
}