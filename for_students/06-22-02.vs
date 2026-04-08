/*
 * Simple vertex shader for diffuse lighting
 */

/* basic uniforms and attributes are 
 * provided by THREE: (see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram)
 */
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// in vec3 position;
// in vec3 normal;

// The varying is the "output" to the fragment shader
// I call it v_normal to remind myself that it is for the vertex
// the fragment shader will get interpolated values

// @@Snippet:vertex_shader
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    // compute the position in view space
    vec4 pos = (modelViewMatrix * vec4(position,1.0));
    
    // the main output of the shader (the vertex position)
    gl_Position = projectionMatrix * pos;
    
    // pass position to fragment shader
    v_position = pos.xyz;
    
    // compute the view-space normal and pass it to fragment shader
    v_normal = normalMatrix * normal;
}
// @@Snippet:end
