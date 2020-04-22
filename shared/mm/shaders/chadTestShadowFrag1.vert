uniform sampler2D tex;
uniform vec3 lightPosition;

void main(void)
{
	gl_TexCoord[0] = gl_MultiTexCoord0;
	gl_Position = gl_Vertex;
}