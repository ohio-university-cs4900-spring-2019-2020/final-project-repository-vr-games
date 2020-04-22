#version 430
//Written by Scott Nykl. Default Shader for a Core 3.2+ BoundingBox.

//uniform sampler2D TexUnit0;

in vec4 Color;
//in vec3 VertexES;
//in vec3 NormalES;
//in vec2 TexCoord;

//struct MaterialInfo
//{
//   vec3 Ka; //Ambient
//   vec3 Kd; //Diffuse
//   vec3 Ks; //Specular
//   float SpecularCoeff; // Specular Coefficient
//};
//uniform MaterialInfo Material;

//layout ( binding = 1, std140 ) uniform LightInfo
//{
//   vec4 PosEye[8]; // Light's Eye space position (same as view space)
//   vec4 Irgb[8]; // Light's Intensity for red, green, blue reflectivity components
//   vec4 GlobalAmbient;
//   int NumLights; // Number of lights in the LightInfo array
//} Lights;

layout ( location = 0 ) out vec4 FragColor;

//void doADS( int lightIdx, inout vec3 ambient, inout vec3 diffuse, inout vec3 specular )
//{
//   vec3 n = normalize( NormalES );
//   vec3 l = normalize( Lights.PosEye[lightIdx].xyz - VertexES ); //vector to light source
//   vec3 v = normalize( -VertexES ); //used by spec
//   vec3 r = reflect( -l, n );       //used by spec
//   
//   //Compute Ambient Contribution
//   ambient += Material.Ka * Lights.Irgb[lightIdx].rgb;
//   
//   //Compute Diffuse Contribution
//   float diff = clamp( dot( l, n ), 0.0, 1.0 );
//   diffuse += Material.Kd * diff * Lights.Irgb[lightIdx].rgb;
//   
//   //Compute Specular Contribution
//   float spec = pow( max( dot( r, v ), 0.0 ), Material.SpecularCoeff );
//   specular += Material.Ks  * spec * Lights.Irgb[lightIdx].rgb;
//}

void main()
{
   FragColor = Color;
}