/* a simple procedural texture */
/* the student should change this to implement a checkerboard */

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

/* colors for the checkerboard */
uniform vec3 light;
uniform vec3 dark;

/* number of checks over the UV range */
uniform float checks;

void main()
{
    // scale UVs to checker space
    float x = v_uv.x * checks;
    float y = v_uv.y * checks;

    // choose one of two colors based on tile parity
    float xodd = mod(floor(x), 2.0);
    float yodd = mod(floor(y), 2.0);
    float dc = step(0.5, abs(xodd - yodd));

    gl_FragColor = vec4(mix(light,dark,dc), 1.);
}

