/* Lava crack shader (fragment) */
varying vec2 v_uv;
varying vec3 v_worldNormal;
varying vec3 v_worldPos;
varying float v_displace;
varying float v_crack;
varying float v_cell;
varying vec3 v_objDir;

uniform float time;
uniform float energy;
uniform float bands;
uniform float isPlane;

float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * noise2(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec3 n = normalize(v_worldNormal);
    vec3 lightDir = normalize(vec3(0.45, 1.0, 0.35));
    vec3 viewDir = normalize(cameraPosition - v_worldPos);
    vec3 halfVec = normalize(lightDir + viewDir);

    if (isPlane < 0.5) {
        float crack = clamp(v_crack, 0.0, 1.0);

        float heatNoise = fbm(v_objDir.xz * 9.0 + vec2(time * 0.28, -time * 0.17));
        float heat = clamp(crack * (0.75 + 0.65 * heatNoise), 0.0, 1.0);

        vec3 rockDark = vec3(0.09, 0.08, 0.08);
        vec3 rockWarm = vec3(0.26, 0.12, 0.08);
        vec3 lavaOrange = vec3(1.00, 0.38, 0.08);
        vec3 lavaYellow = vec3(1.00, 0.79, 0.20);
        vec3 lavaCore = vec3(1.00, 0.96, 0.72);

        float rockVar = 0.45 + 0.55 * fbm(v_objDir.xy * 7.0 + vec2(v_cell * 5.0, -time * 0.05));
        vec3 rock = mix(rockDark, rockWarm, rockVar * 0.65);

        vec3 lava = mix(lavaOrange, lavaYellow, smoothstep(0.25, 0.80, heat));
        lava = mix(lava, lavaCore, smoothstep(0.70, 1.0, heat));

        float crustMask = 1.0 - crack;
        vec3 base = mix(lava, rock, crustMask);

        float diffuse = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(n, halfVec), 0.0), 80.0);
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.6);

        vec3 emission = lava * heat * (1.1 + 1.3 * energy);
        vec3 lit = base * (0.16 + 0.90 * diffuse);
        vec3 color = lit + emission * 0.78 + vec3(1.0, 0.85, 0.62) * spec * crack * 0.22 + lava * fresnel * crack * 0.3;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        return;
    }

    vec2 flowUV = v_uv * 8.0;
    float flow = fbm(flowUV + vec2(time * 0.20, -time * 0.12));
    float pulse = 0.5 + 0.5 * sin((v_worldPos.y * 9.0 + flow * 8.0 - time * 3.2) * (0.25 * bands));
    float spark = smoothstep(0.78, 0.98, fbm(flowUV * 4.0 + vec2(time * 0.7, 0.0)));

    vec3 coolA = vec3(0.02, 0.09, 0.22);
    vec3 coolB = vec3(0.08, 0.76, 0.78);
    vec3 coolC = vec3(0.74, 0.97, 1.00);

    vec3 base = mix(coolA, coolB, pulse);
    base = mix(base, coolC, smoothstep(0.60, 1.0, pulse));

    vec2 g = abs(fract(v_uv * 10.0) - 0.5);
    float line = 1.0 - smoothstep(0.47, 0.50, min(g.x, g.y));
    float grid = line * 0.25;

    float diffuse = max(dot(n, lightDir), 0.0);
    float spec = pow(max(dot(n, halfVec), 0.0), 140.0);
    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);

    vec3 glow = vec3(0.45, 0.95, 1.00);
    glow *= (0.30 + 0.75 * pulse + 1.20 * spark + abs(v_displace) * 6.0) * energy;

    vec3 color = base * (0.22 + 0.90 * diffuse)
               + vec3(1.0) * spec * 0.45
               + glow * 0.32
               + glow * fresnel * 0.45
               + vec3(grid);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
