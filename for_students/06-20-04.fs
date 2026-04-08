// simple fragment shader that uses the UV value to make the color

// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;
 varying float v_dim;

void main()
{
    gl_FragColor = vec4(v_uv * v_dim, v_dim,1);
}