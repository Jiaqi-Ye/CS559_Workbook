/*
 * Fragment shader for GLSL dots demo.
 */

varying vec2 v_uv;

uniform vec3 light;
uniform vec3 dark;
uniform float dots;
uniform float radius;

void main() {
    float x = v_uv.x * dots;
    float y = v_uv.y * dots;

    float dx = fract(x) - 0.5;
    float dy = fract(y) - 0.5;

    float d = sqrt(dx * dx + dy * dy);
    float dc = step(d, radius);

    gl_FragColor = vec4(mix(light, dark, dc), 1.0);
}
