#version 400

in float height; // altitude of this vertex from WGS84 ellipsoid
in vec3 vEye;    //vertex in eye space (aka view space)
//in vec3 normal;

//uniform sampler2D texUnit0;
//uniform vec4 LightPosition;

out vec4 colorOut;

float minAlt = -1; //meters (should be lowest point on earth -408 m
float maxAlt = 10001; //meters (should be highest point on earth ~9000 m

vec3 rgb2hsv( vec3 c )
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb( vec3 c )
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void)
{
   float altRng = maxAlt - minAlt;
   float heightRel = (height+abs(minAlt)) / altRng;
   heightRel = clamp( heightRel, 0.0, 1.0 );
   vec3 rgb = hsv2rgb( vec3( heightRel, 1.0, 1.0 ) );
   colorOut = vec4( rgb, 1 );
}