//
varying float isGeneratedInGeoShader;

void main()
{
   //Transform the vertex (ModelViewProj matrix)
   isGeneratedInGeoShader = 0.0;
   gl_Position = gl_Vertex; //gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;
   gl_TexCoord[0] = gl_TextureMatrix[0] *  gl_MultiTexCoord0;
   //gl_Normal = normalize(gl_NormalMatrix * gl_Normal);

}