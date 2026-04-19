/* a simple procedural texture: dots */

//@@Snippet:vars
/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

/* colors for the dots */
uniform vec3 light;
uniform vec3 dark;

/* number of dots over the UV range */
uniform float dots;

/* how big are the circles */
uniform float radius;
//@@Snippet:end

//@@Snippet:main
void main()
{
    // have the pattern be 1x1, but repeat the pattern to make more dots
    float x = v_uv.x * dots;
    float y = v_uv.y * dots;

    // find the center of the current "tile" 
    float xc = floor(x);
    float yc = floor(y);

    // compute the distance to the center
    float dx = x-xc-.5;
    float dy = y-yc-.5;
    float d = sqrt(dx*dx + dy*dy);

    // determine if we're close enough to the center
    float dc = 1.0 - step(radius,d);

    // alternate dot color by tile: some dots blue, some green
    float which = mod(xc + yc, 2.0);
    vec3 blueDot = vec3(0.1, 0.3, 1.0);
    vec3 greenDot = vec3(0.1, 0.9, 0.2);
    vec3 dotColor = mix(blueDot, greenDot, which);
 
    // choose a color based on how close we are
    gl_FragColor = vec4(mix(light,dotColor,dc), 1.);
}
//@@Snippet:end
