#version 430
//Written by Scott Nykl. Default Shader for a Core 3.2+.
//Performs per fragment ambient/diffuse/specular shading with material
//properties, textures, and lights.

layout ( binding = 0 ) uniform sampler2D TexUnit0;
layout ( binding = 7 ) uniform sampler2DShadow ShadowMap;

in vec4 fColor;
in vec3 VertexES;
in vec3 NormalES;
in vec2 TexCoord;
in vec4 ShadowCoord;
in flat int ShadowMapShadingState;

struct MaterialInfo
{
   vec4 Ka; //Ambient
   vec4 Kd; //Diffuse
   vec4 Ks; //Specular
   float SpecularCoeff; // Specular Coefficient
};
uniform MaterialInfo Material;


layout ( binding = 1, std140 ) uniform LightInfo
{
   vec4 PosEye[8]; // Light's Eye space position (same as view space)
   vec4 Irgba[8]; // Light's Intensity for red, green, blue reflectivity components
   vec4 GlobalAmbient;
   int NumLights; // Number of lights in the LightInfo array   
} Lights;

layout ( location = 0 ) out vec4 FragColor;


uniform vec3 camPos;
uniform vec3 camNorm;
uniform vec3 modelPos;
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

///////////////////uniform sampler2D diffuseTexture;

void main()
{
   // vec3 ct, cf; //color of texture, color of fragment, respectively
   // vec4 texel; //rgba of texture at TexCoord[x].st
   // float at, af; //alpha of texture, alpha of fragment, respectively
   
   // //assume intensity if 1.0 since the normal of the point billboard always
   // //faces the camera
   // cf = 1.0 * gl_FrontMaterial.diffuse.rgb + gl_FrontMaterial.ambient.rgb;
   // cf = 1.0 * gl_Color.rgb;
   // af = gl_Color.a;
   // texel = texture2D( TexUnit0, TexCoord.st );
   // ct = texel.rgb;
   // at = texel.a;
   // FragColor = vec4( ct * cf, at * af );

   vec4 texel = texture( TexUnit0, TexCoord.st );
   FragColor = fColor * texel;
   FragColor.a = 1.0;
   if( texel.r > 0.5  && ( fColor.r > 0.5 || fColor.g > 0.5 || fColor.b > 0.5 ) )
   {
      FragColor.a = 1.0;
   }
   else
   {
      discard;
   }
}