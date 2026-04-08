// we need to use the WebGL derivative functions, which are not built in
// see https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
// note that THREE does load the extensions for derivatives
// #extension GL_EXT_shader_texture_lod : enable
// #extension GL_OES_standard_derivatives : enable

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;

uniform vec3 color1;
uniform vec3 color2;

uniform float sw;
uniform float stripes;

uniform float blur;

// note that this is one sided: it only blurs the transition, not the wrap-around at 0/1
void main()
{
    // broken into multiple lines to be easier to read
    float su = fract(v_uv.x * stripes);
    float a = blur >= 0.0 ? blur : fwidth(su);
    float st = smoothstep(sw-a,sw+a,su);
    vec3 color = mix(color1, color2, st);
    gl_FragColor = vec4(color,1);
}
