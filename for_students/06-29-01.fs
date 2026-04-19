/* Procedural shading example */
/* the student should make this more interesting */

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;
varying vec3 v_worldNormal;
varying vec3 v_worldPos;

void main()
{
    // procedural checker texture
    float checks = 8.0;
    float x = floor(v_uv.x * checks);
    float y = floor(v_uv.y * checks);
    float checker = mod(x + y, 2.0);
    vec3 c1 = vec3(0.90, 0.85, 0.75);
    vec3 c2 = vec3(0.25, 0.35, 0.70);
    vec3 baseColor = mix(c1, c2, checker);

    // fixed directional lighting in world coordinates
    vec3 n = normalize(v_worldNormal);
    vec3 lightDir = normalize(vec3(0.4, 1.0, 0.8));
    float diffuse = max(dot(n, lightDir), 0.0);
    float ambient = 0.12;
    float lit = ambient + 1.20 * diffuse;

    // add a small white specular highlight to make lighting clearer
    vec3 viewDir = normalize(cameraPosition - v_worldPos);
    vec3 refl = reflect(-lightDir, n);
    float spec = pow(max(dot(viewDir, refl), 0.0), 24.0);
    vec3 specular = vec3(0.35) * spec;

    vec3 color = clamp(baseColor * lit + specular, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}

