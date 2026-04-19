/*
* fragment shader for specular lighting exercise
*/
varying vec3 v_normal;
varying vec3 v_position;
uniform float shininess;

// note that this is in WORLD COORDINATES
const vec3 lightDirWorld = vec3(0,1,0);
const vec3 baseColor = vec3(1,.8,.4);

 /* Provided by THREE: (see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram)
uniform vec3 cameraPosition;
  */

void main()
{
    // get the view direction in view-space coordinates
    // remember in view space, the camera is the origin
    vec3 viewDir = normalize( - v_position);

    // convert the lighting direction in view-space coordinates
    vec3 lightDir = normalize((viewMatrix * vec4(lightDirWorld,0.)).xyz);
    // re-normalize the interpolated normal vector
    vec3 normal = normalize(v_normal);
    // get angle of reflection to compute alignment
    // without using `reflect`, alignment can be computed by taking the halfway vetor H and evaluating dot(N,H)
    vec3 reflDir = reflect(-lightDir,normal);
    float alignment = max(dot(viewDir,reflDir),0.);
    // diffuse + specular (plastic-like: colored diffuse, white highlight)
    float diffuseAmount = max(dot(normal, lightDir), 0.);
    vec3 diffuse = baseColor * diffuseAmount;
    vec3 specular = vec3(1., 1., 1.) * pow(alignment,pow(2.,shininess));
    vec3 color = clamp(diffuse + specular, 0., 1.);
    gl_FragColor = vec4(color, 1);
}
