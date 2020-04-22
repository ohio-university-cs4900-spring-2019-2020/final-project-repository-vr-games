#version 120

// GLSL vertex shader
varying vec3 eyeSpacePos;
varying vec3 worldSpaceNormal;
varying vec3 eyeSpaceNormal;
uniform float heightScale; // = 0.5;
uniform float chopiness;   // = 1.0;
uniform vec2  size;        // = vec2(256.0, 256.0);
uniform mat4 modelMat;
uniform vec3 camPos;
uniform float alpha;
uniform sampler2D mask;
varying vec4 position;

void main()
{	
    float height     = gl_MultiTexCoord1.x;
    vec2  slope      = gl_MultiTexCoord2.xy;

    // calculate surface normal from slope for shading
	vec3 normal      = normalize(cross( vec3(0.0, slope.y*heightScale, 2.0 / size.x), vec3(2.0 / size.y, slope.x*heightScale, 0.0)));
    worldSpaceNormal = vec3(normal.x, normal.z, normal.y);
	//worldSpaceNormal = normal;

    // calculate position and transform to homogeneous clip space
    vec4 pos         = vec4(gl_Vertex.x, gl_Vertex.y,  /*height * heightScale*/ + gl_Vertex.z, 1.0);
	//vec4 pos 		 =
	gl_Position      = gl_ModelViewProjectionMatrix * pos;
    
 	eyeSpaceNormal   = worldSpaceNormal;//(vec3(modelMat * vec4(worldSpaceNormal,0.0))).xyz;
	position = gl_ModelViewProjectionMatrix * pos;
	gl_FrontColor = gl_Color;
}
