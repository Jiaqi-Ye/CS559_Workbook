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
varying vec3 l_normal;
varying vec3 v_world_position;

void main() {
    vec4 world_pos = (modelMatrix * vec4(position,1.0));
    v_world_position = world_pos.xyz;
    
    // the main output of the shader (the vertex position)
    gl_Position = projectionMatrix * viewMatrix * world_pos;
    
    // compute the normal and pass it to fragment
    // note - this is in world space, but uses a hack that
    // assumes the model matrix is its own adjoint 
    // (which is true, sometimes)
    l_normal = (modelMatrix * vec4(normal,0)).xyz;
}

