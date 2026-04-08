/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

uniform vec3 color1;
uniform vec3 color2;

uniform float sw;
uniform float stripes;

void main()
{
    // broken into multiple lines to be easier to read
    float su = fract(v_uv.x * stripes);
    float st = step(sw,su);
    vec3 color = mix(color1, color2, st);
    gl_FragColor = vec4(color,1);
}
