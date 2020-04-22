// GLSL fragment shader
varying vec3 eyeSpacePos;
varying vec3 worldSpaceNormal;
varying vec3 eyeSpaceNormal;
uniform vec4 deepColor;    // = vec4(0.0, 0.0, 0.1, 1.0);
uniform vec4 shallowColor; // = vec4(0.1, 0.4, 0.3, 1.0);
uniform vec4 skyColor;     // = vec4(0.5, 0.5, 0.5, 1.0);
uniform vec3 lightDir;     // = vec3(0.0, 1.0, 0.0);
uniform float alpha;
uniform sampler2D mask;
varying vec4 position;

void main()
{
	
	vec3 position2 = vec3(position.x / position.w, position.y / position.w, position.z / position.w );
	float x = 1920 / 2 * position2.x + (0 + 1920 / 2);//viewport width (or context width?)
	float y = 1200 / 2 * position2.y + (0 + 1200 / 2);//viewport height (or context height?)
	vec2 texLoc = vec2(x / 1920, y / 1200);
	vec4 value = texture2D(mask, texLoc.xy);
	if(value.a > .25)
		discard;
	
	vec3 eyeVector              = normalize(vec3(1,1,-2));
	vec3 eyeSpaceNormalVector   = normalize(eyeSpaceNormal);
    vec3 worldSpaceNormalVector = normalize(worldSpaceNormal);

    float facing    = max(0.0, dot(eyeSpaceNormalVector, -eyeVector));
    float fresnel   = pow(1.0 - facing, 5.0); // Fresnel approximation
    float diffuse   = max(0.0, dot(worldSpaceNormalVector, vec3(0,0,1)));
    
    vec4 waterColor = mix(shallowColor, deepColor, facing);
    
    vec4 color = vec4(waterColor*diffuse + skyColor*fresnel);
	gl_FragColor = vec4(color.xyz,alpha);
	
	//gl_FragColor = vec4(value.a, value.a, value.a, 1);
	
}

//if the facing is too high you get all shallow color, if they facing is too low you get all sky/deep color