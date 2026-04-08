/*
 * Simplest possible vertex shader
 */

/* basic uniforms and attributes are 
 * provided by THREE: (see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram)
 */
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// in vec3 position;

// the output is a built-in - it does not need to be declared
// varying vec4 gl_Position;

/* In this example (2-2) there is a uniform from our program (color), but
 * we don't need it in the vertex shader
 */
/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    // the main output of the shader (the vertex position)
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

