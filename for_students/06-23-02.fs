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

    // choose a color based on how close we are
    gl_FragColor = vec4(mix(light,dark,dc), 1.);
}
//@@Snippet:end