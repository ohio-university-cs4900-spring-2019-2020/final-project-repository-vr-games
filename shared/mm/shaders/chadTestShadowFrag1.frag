uniform sampler2D tex;
uniform vec3 lightPos;

void main(void)
{
	mat4 tempMatrix;
	mat4 faceMatrix;
	
	faceMatrix[0] = texture2D(tex, vec2(gl_TexCoord[0].s,.125));
	faceMatrix[1] = texture2D(tex, vec2(gl_TexCoord[0].s,.375));
	faceMatrix[2] = texture2D(tex, vec2(gl_TexCoord[0].s,.625));
	faceMatrix[3] = texture2D(tex, vec2(gl_TexCoord[0].s,.875));

	tempMatrix =  gl_TextureMatrix[0] * faceMatrix;
	float color;
	color = dot(vec4(tempMatrix[0][2], tempMatrix[1][2], tempMatrix[2][2], tempMatrix[3][2]), vec4(lightPos, 1));
	
	vec4 vecColor = vec4(0,0,color,1);

	gl_FragColor = vecColor;
}