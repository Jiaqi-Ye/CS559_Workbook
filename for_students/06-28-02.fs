/* a simple procedural texture */
/* the student should change this to implement a checkerboard */

/* passed interpolated variables to from the vertex */
varying vec2 v_uv;

/* colors for the checkerboard */
uniform vec3 light;
uniform vec3 dark;

/* number of checks over the UV range */
uniform float checks;

void main()
{
    // checker pattern over UV space
    float x = v_uv.x * checks;
    float y = v_uv.y * checks;
    float pattern = sin(3.14159265 * x) * sin(3.14159265 * y);

    // anti-aliased transition near checker boundaries
    float a = fwidth(pattern);
    float dc = smoothstep(-a, a, pattern);

    gl_FragColor = vec4(mix(light,dark,dc), 1.);
}

