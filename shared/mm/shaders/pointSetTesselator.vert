uniform vec3 camPos;
uniform vec3 camNorm;
uniform vec3 modelPos;
uniform mat4 modelMat;
uniform mat4 viewMat;
uniform vec2 dimXY;

void main()
{
   //gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;
   gl_Position = gl_Vertex;
   gl_TexCoord[0] = gl_TexCoord[0];
   gl_FrontColor = gl_Color;
   //gl_TexCoord[0] = gl_TextureMatrix[0] *  gl_MultiTexCoord0;
   //gl_TexCoord[0] = gl_TextureMatrix[0] *  gl_MultiTexCoord0;
   //gl_Normal = normalize(gl_NormalMatrix * gl_Normal);

}