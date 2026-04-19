/* Procedural shading example */
/* the student should make this more interesting */

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;
uniform float checks;

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main()
{
    // Brick layout in UV space
    vec2 uv = v_uv;
    vec2 bricks = vec2(checks, checks * 0.6);
    vec2 cell = uv * bricks;
    float row = floor(cell.y);

    // Stagger every other row
    cell.x += 0.5 * mod(row, 2.0);
    vec2 id = floor(cell);
    vec2 f = fract(cell);

    // Mortar thickness with anti-aliased edges (continuous, no dashed look)
    float mortar = 0.08;
    float edgeDist = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float a = max(fwidth(edgeDist), 0.0001);
    float inside = smoothstep(mortar - a, mortar + a, edgeDist);

    // Slight color variation per brick
    float n = hash2(id);
    vec3 brickBase = vec3(0.62, 0.24, 0.18);
    vec3 brickTint = vec3(0.20, 0.12, 0.08) * (n - 0.5);
    vec3 brickColor = brickBase + brickTint;
    vec3 mortarColor = vec3(0.86, 0.84, 0.80);

    // Small vertical shading to give each brick depth
    float shade = 0.85 + 0.25 * (1.0 - f.y);
    brickColor *= shade;

    vec3 color = mix(mortarColor, brickColor, inside);
    gl_FragColor = vec4(color, 1.0);
}

