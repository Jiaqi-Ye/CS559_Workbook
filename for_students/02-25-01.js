// @ts-check
export {};

/**
 * 02-25-01.js - Articulated Swaying Plant
 * 角色设计说明：
 * 这是一个具有 5 级关节的摇曳植物（名字叫 "Glow-Leaf"）。
 * 结构层级：Base -> Segment 1 -> Segment 2 -> Segment 3 -> Head -> Petals
 */

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));
const context = canvas.getContext("2d");

/**
 * 绘制植物茎秆段
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} len 
 */
function drawStem(ctx, len) {
    ctx.fillStyle = "#4CAF50";
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-4, -len, 8, len + 5, 4);
    ctx.fill();
    ctx.stroke();
}

/**
 * @param {DOMHighResTimeStamp} timestamp 
 */
function loop(timestamp) {
    if (!context || !canvas) return;
    let t = timestamp * 0.001;

    // 清除画布并画个简单的背景
    context.fillStyle = "#1a1a2e"; // 深色背景让发光植物更亮
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    // 将起点放在画布底部中央
    context.translate(canvas.width / 2, canvas.height * 0.9);

    // --- 根部 ---
    context.fillStyle = "#3e2723";
    context.beginPath();
    context.arc(0, 0, 20, Math.PI, 0);
    context.fill();

    // --- 递归/层级茎秆 (Hierarchical Chain) ---
    // 每一段都相对于前一段旋转
    let segments = 4;
    for (let i = 0; i < segments; i++) {
        // 计算每一层的摆动：偏置随层级增加，形成波浪感
        let sway = Math.sin(t * 2 + i * 0.5) * 0.15;
        context.rotate(sway);
        drawStem(context, 40);
        context.translate(0, -40); // 移动到下一段的起点
    }

    // --- 花头 (The Head) ---
    context.save();
    context.rotate(Math.sin(t * 4) * 0.2); // 花头自己额外晃动
    
    // 花瓣 - 再次使用循环和层级
    for (let i = 0; i < 6; i++) {
        context.save();
        context.rotate((i * Math.PI * 2) / 6 + t); // 花瓣旋转
        context.fillStyle = `hsla(${180 + Math.sin(t)*50}, 70%, 60%, 0.8)`;
        context.beginPath();
        // 使用 Arc 画花瓣
        context.ellipse(20, 0, 15, 8, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

    // 花蕊中心
    context.fillStyle = "#ffeb3b";
    context.shadowBlur = 15;
    context.shadowColor = "yellow";
    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.restore(); // 回到根部

    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);