// we need to use the WebGL derivative functions, which are not built in
// see https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
// note that THREE does load the extensions for derivatives
// #extension GL_EXT_shader_texture_lod : enable
// #extension GL_OES_standard_derivatives : enable

/* pass interpolated variables to from the vertex */
varying vec4 v_uv;

uniform vec3 color1;
uniform vec3 color2;

uniform float sw;
uniform float stripes;

uniform float blur;

// constants - things we might want to tweak
// modulate the thickness of the rings
const float thickFrequency = 2.0;
const float thickAmount = .2;

// modulate the distance from center (radius)
const float radialFreq = 4.0;
const float radialAmount = 1.0;

// I'll use the simple sin noise function - kindof pure randomness
// remember to conver to 0 to 1
float snoise(float u) {
    float p = sin(u*2000.0) *12345.0;
    return fract( p/2.0 + 0.5);
}
// to turn this into noise, a need to sample it at fixed locations
float noise(float ui, float freq) {
    float u = ui*freq;
    float n0 = snoise(floor(u));
    float n1 = snoise(ceil(u));
    float alph = fract(u);

    // do cubic interpolation instead
    alph = alph * alph * (3.0 - 2.0*alph);

    // linearly interpolate between n0 and n1
    return (1.0-alph) * n0 + alph * n1;

}

// anti-alias both sides of the stripe
// we need to deal with both sides of the stripe
// having the stripe edge at the boundary makes things tricky,
// so I'll put the stripe edge in the center
// then we treat each side of the stripe separately
void main()
{
    // since this is "wood coordinates" now, zero should be the center
    float nu = (v_uv.x) * stripes;
    float nv = (v_uv.y) * stripes;

    // now the distance
    float dist = sqrt(nu*nu + nv*nv);

    // we also want the angle, so we can use it to make circular noise
    float angle = atan(nv,nu);

    // add to the distance based on where we are around the circle
    // keep the original distance
    float d = dist + radialAmount * noise(angle,radialFreq);

    // now we need to know ehre in the stripe are we
    float su = fract(d);
 
     // the trick is to use the distance to the stripe (which we put at -.5)
     // we compute it here because it is the thing that determines the amount
     // of anti-aliasing - note that I add in some randomness so we get
     // changes in the thickness
     // we add a touch of the radius so that each ring is somwhat different
    float dst = abs(su-0.5)  + thickAmount * noise(angle + dist*2.0, thickFrequency); 

    // amount of anti-aliasing
    // warning... the amount for fwidth cannot be su - since it is different at the fract
    // boundary!
    float a = blur >= 0.0 ? blur : fwidth(dst);
    // the "half width" of the stripe
    float h = sw/2.0;

    // version 2: based on the distance to the stripe
    // 
    // float st=step(h,abs(su-.5));
    float st = smoothstep(h-a,h+a,abs(dst));

    vec3 color = mix(color1, color2, st);

    // color = vec3(abs(su-.5),abs(su-.5),abs(su-.5));
    gl_FragColor = vec4(color,1);
}
