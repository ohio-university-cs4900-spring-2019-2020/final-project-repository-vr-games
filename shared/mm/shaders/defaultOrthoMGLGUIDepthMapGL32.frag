#version 430
//Written by Scott Nykl. Default Shader for a Core 3.2+ MGLGUIDepthMap that needs to invoke each fragment within a stencil buffer's area.

layout ( binding = 0 ) uniform sampler2D TexUnit0;

uniform float CamNear;
uniform float CamFar;

//in vec4 Color;
//in vec3 VertexES;
//in vec3 NormalES;
in vec2 TexCoord;

struct MaterialInfo
{
   vec4 Ka; //Ambient
   vec4 Kd; //Diffuse
   vec4 Ks; //Specular
   float SpecularCoeff; // Specular Coefficient
};
uniform MaterialInfo Material;

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
   //converts a depth map texture to an RGBA
   vec4 depth = texture( TexUnit0, TexCoord );
   float z_buffer_value = depth.r;
   float z_b = z_buffer_value;
   float z_ndc = z_buffer_value;

   float f = 200.0;
   float n = 1.0;

   float A = -(f+n)/(f-n); //OpenGL Projection Matrix
   float B = -2*f*n/(f-n); //OpenGL Porjection Matrix
   //float z_ndc = -(A*z_e + B) / z_e; //n_ndc is [-1,1]

   //float z_e = 2*n*f / (f+n - (f-n)*(2*z_b - 1));
   z_ndc = z_ndc * 2.0 - 1.0;
   float z_e = 2*f*n / ( f+n + z_ndc*(n-f));
   float z = z_e / f; //divide by f so all values fall between [0,1] making a valid grayscale shade to place in fragment's color

   FragColor =  vec4(z,z,z,1);
}