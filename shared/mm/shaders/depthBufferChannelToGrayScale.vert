#version 130
uniform sampler2D depthMap;

void main()
{
   gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
   gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;
}
