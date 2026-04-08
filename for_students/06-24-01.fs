/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

/* colors for the checkerboard */
uniform vec3 light;
uniform vec3 dark;

/* number of dots over the UV range */
uniform float dots;

/* amount of blur - -1 means do it "correctly" */
uniform float blur;

/* how big are the circles */
uniform float radius;

void main()
{
    float x = v_uv.x * dots;
    float y = v_uv.y * dots;

    float xc = floor(x);
    float yc = floor(y);

    float dx = x-xc-.5;
    float dy = y-yc-.5;

    float d = sqrt(dx*dx + dy*dy);
    // if the blur is positive, use it for blurring
    // if the blur is negative - compute the amount of bluring using fwidth
    float a = blur > -.5 ? blur: fwidth(d);
    float dc = 1.0-smoothstep(radius-a,radius+a,d);

    gl_FragColor = vec4(mix(light,dark,dc), 1.);
}

