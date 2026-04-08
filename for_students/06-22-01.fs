/*
* simple diffuse lighting shader
* constant direction
* constant base material color
* light color is just white
* two-sided lighting
*/


// @@Snippet:simple_lighting
varying vec3 v_normal;

// note that this is in VIEW COORDINATES
const vec3 lightDir = vec3(0,0,1);
const vec3 baseColor = vec3(1,.8,.4);

void main()
{
    // we need to renormalize the normal since it was interpolated
    vec3 nhat = normalize(v_normal);

    // deal with two sided lighting
    // light comes from above and below (use clamp rather than abs to get one sided)
    float light = abs(dot(nhat, lightDir));

    // brighten the base color
    gl_FragColor = vec4(light * baseColor,1);
}
// @@Snippet:end
