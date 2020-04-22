#version 430
//Written by Scott Nykl. Order Independent Transparency based on the default shader for a Core 3.2+.
//Performs per fragment ambient/diffuse/specular shading with material
//properties, textures, and lights.

//layout( early_fragment_tests ) in;

//MAX_FRAGMENTS is the maximum number of fragments that can be stored / blended together at any given pixel
#define MAX_FRAGMENTS 15

layout ( binding = 0 ) uniform sampler2D TexUnit0;
layout ( binding = 6 ) uniform sampler2D DepthMap;
layout ( binding = 7 ) uniform sampler2DShadow ShadowMap;

in vec4 Color;
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


//layout ( binding = 1, std140 ) uniform LightInfo
//{
//   vec4 PosEye[8]; // Light's Eye space position (same as view space)
//   vec4 Irgba[8]; // Light's Intensity for red, green, blue reflectivity components
//   vec4 GlobalAmbient;
//   int NumLights; // Number of lights in the LightInfo array   
//} Lights;


struct NodeType
{
   vec4 color;
   float depth;
   uint next;
};
layout( binding = 2 ) uniform atomic_uint nextNodeCounter;
layout( binding = 3, r32ui ) uniform uimage2D headPointers;
layout( binding = 4, std140 ) buffer linkedLists
{
   NodeType nodes[];
};
uniform int MaxNodes;

layout ( location = 0 ) out vec4 FragColor;

vec3 rgb2hsv( vec3 c )
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb( vec3 c )
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void pass2()
{
   NodeType frags[MAX_FRAGMENTS];
   int count = 0;
   
   // Get the index of the head of the list
   uint n = imageLoad( headPointers, ivec2( gl_FragCoord.xy ) ).r;
   
   // Copy the linked list for this fragment into an array
   //uint countNearerThanDepthBuffer = 0;
   while( n != 0xffffffff && count < MAX_FRAGMENTS )
   {
      frags[count] = nodes[n];
      n = frags[count].next;
      count++;
   }
   
   // Sort the array by depth using insertion sort (largest
   // to smallest).
   for( uint i = 1; i < count; i++ )
   {
      NodeType toInsert = frags[i];
      uint j = i;
      while( j > 0 && toInsert.depth > frags[j-1].depth )
      {
         frags[j] = frags[j-1];
         j--;
      }
      frags[j] = toInsert;
   }
   
   // Traverse the array, and combine the colors using the alpha
   // channel.
   //vec4 color = vec4(1,1,1,1);
   vec4 color = texture( TexUnit0, TexCoord ); //TexUnit0 should be the opaque background FBO texture generated
                                               //before populating this frames linked list buffer
   //color.a = 1.0;
   for( int i = 0; i < count; i++ )
   {
      //if( frags[i].depth < DEPTH )
      color = mix( color, frags[i].color, frags[i].color.a); //original line
      
      //this block is used to 
      //visualize number of depth fragments at each pixel
      //float n = count / 20.0;
      //vec3 hsvStart = vec3(0.01,1.0,1.0);
      //vec3 hsvEnd = vec3(0.8333,1.0,1.0);
      //float lin = mix( hsvStart.x, hsvEnd.x, n );
      //vec3 color3 = hsv2rgb( vec3(lin,1.0,1.0) );
      //color = vec4(color3,1.0);
   }
   FragColor = color;   
}

void showDepthOnly()
{
   float z_b = texture( DepthMap, TexCoord ).r;
   //float DEPTH = texelFetch( DepthMap, ivec2(gl_FragCoord.xy), 0 ).r;
   float zNear = 1.0;
   float zFar = 1000.0;
   
   //linearize depth map
   //float z_b = texture2D(depthBuffTex, vTexCoord).x;
   float z_n = 2.0 * z_b - 1.0;
   float z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
   
   vec3 hsvStart = vec3(0.01,1.0,1.0);
   vec3 hsvEnd = vec3(0.8333,1.0,1.0);
   float lin = mix( hsvStart.x, hsvEnd.x, z_e / 1000.0 );
   vec3 color3 = hsv2rgb( vec3(lin,1.0,1.0) );
   FragColor = vec4(color3,1.0);
}

void main()
{   
   pass2();
   //showDepthOnly();
}