// @ts-check
export {};

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
function picture(canvas) {
    const context = canvas.getContext("2d");
    // @@Snippet:fill
    context?.scale(canvas.width,-canvas.height);
    context?.translate(0,-1);
    // @@Snippet:end

    // now I'll draw something...
    context.fillStyle="red";
    context?.fillRect(.5,.5,.5,.5);
    context.fillStyle="blue";
    context?.beginPath();
    context?.moveTo(0,0);
    context?.lineTo(.5,.5);
    context?.lineTo(.5,0);
    context?.fill();
}

["canvas1", "canvas2", "canvas3"].forEach(function (name) {
    picture( /** @type {HTMLCanvasElement} */ (document.getElementById(name)));
});




// 2026 Workbook
