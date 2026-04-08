fn dotsColor(uvIn: vec2<f32>, dots: f32, radius: f32, light: vec3<f32>, dark: vec3<f32>) -> vec3<f32> {
    let x = uvIn.x * dots;
    let y = uvIn.y * dots;

    let dx = fract(x) - 0.5;
    let dy = fract(y) - 0.5;

    let d = sqrt(dx * dx + dy * dy);
    let dc = step(d, radius);

    return mix(light, dark, dc);
}
