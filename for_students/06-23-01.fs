/* simple fragment shader -
 * makes an object space grating pattern (solid texture)
 */ 
varying vec3 v_xyz_world;
varying vec3 v_xyz_local;

void main()
{
   gl_FragColor = vec4( abs(sin(v_xyz_local.x * 3.141)),
                        abs(sin(v_xyz_local.z * 3.141)),
                        0,1);
}

