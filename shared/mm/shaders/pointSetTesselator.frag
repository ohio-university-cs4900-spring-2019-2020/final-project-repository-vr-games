uniform vec3 camPos;
uniform vec3 camNorm;
uniform vec3 modelPos;
uniform mat4 modelMat;
uniform mat4 viewMat;
uniform vec2 dimXY;

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

// in vec4 gl_FragCoord;
// in bool gl_FrontFacing;
// in float gl_ClipDistance[];
// out vec4 gl_FragColor; // deprecated
// out vec4 gl_FragData[gl_MaxDrawBuffers]; // deprecated
// out float gl_FragDepth;
// in vec2 gl_PointCoord;
// in int gl_PrimitiveID;

uniform sampler2D diffuseTexture;

void main()
{
   // vec3 ct, cf; //color of texture, color of fragment, respectively
   // vec4 texel; //rgba of texture at gl_TexCoord[x].st
   // float at, af; //alpha of texture, alpha of fragment, respectively
   
   // //assume intensity if 1.0 since the normal of the point billboard always
   // //faces the camera
   // cf = 1.0 * gl_FrontMaterial.diffuse.rgb + gl_FrontMaterial.ambient.rgb;
   // cf = 1.0 * gl_Color.rgb;
   // af = gl_Color.a;
   // texel = texture2D( diffuseTexture, gl_TexCoord[0].st );
   // ct = texel.rgb;
   // at = texel.a;
   // gl_FragColor = vec4( ct * cf, at * af );

   vec4 texel = texture2D( diffuseTexture, gl_TexCoord[0].st );
   gl_FragColor = gl_Color * texel;
   if( texel.r > 0.5  && ( gl_Color.r > 0.5 || gl_Color.g > 0.5 || gl_Color.b > 0.5 ) )
   {
      gl_FragColor.a = 1.0;
   }
   else
   {
      discard;
   }
}