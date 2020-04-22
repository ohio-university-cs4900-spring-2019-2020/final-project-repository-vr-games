//Geometry language input varying variables:
// varying in vec4 gl_FrontColorIn[gl_VerticesIn];
// varying in vec4 gl_BackColorIn[gl_VerticesIn];
// varying in vec4 gl_FrontSecondaryColorIn[gl_VerticesIn];
// varying in vec4 gl_BackSecondaryColorIn[gl_VerticesIn];
// varying in vec4 gl_TexCoordIn[gl_VerticesIn][]; // at most will be// gl_MaxTextureCoords
// varying in float gl_FogFragCoordIn[gl_VerticesIn];
// varying in vec4 gl_PositionIn[gl_VerticesIn];
// varying in float gl_PointSizeIn[gl_VerticesIn];
// varying in vec4 gl_ClipVertexIn[gl_VerticesIn];

uniform sampler2D diffuseTexture;
varying float isGeneratedInGeoShader;

void main()
{
   // if( isGeneratedInGeoShader < 0.5 )
      // gl_FragColor = vec4(0,1,0,1);
   // else
      // gl_FragColor = vec4(1,0,0,1);
      
   vec4 baseColour = texture2D( diffuseTexture, gl_TexCoord[0].st );    
   gl_FragColor = baseColour;
}