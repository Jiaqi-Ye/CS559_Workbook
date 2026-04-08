// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D tex;

void main()
{
    gl_FragColor = texture2D(tex, v_uv);
}

