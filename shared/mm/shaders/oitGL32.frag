#version 430
//Written by Scott Nykl. Order Independent Transparency based on the default shader for a Core 3.2+.
//Performs per fragment ambient/diffuse/specular shading with material
//properties, textures, and lights.

//layout( early_fragment_tests ) in; //don't use this for the initial render, just for the overlay!

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


layout ( binding = 1, std140 ) uniform LightInfo
{
   vec4 PosEye[8]; // Light's Eye space position (same as view space)
   vec4 Irgba[8]; // Light's Intensity for red, green, blue reflectivity components
   vec4 GlobalAmbient;
   int NumLights; // Number of lights in the LightInfo array   
} Lights;


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

//subroutine void RenderPassType();
//subroutine uniform RenderPassType RenderPass;

layout ( location = 0 ) out vec4 FragColor;

void doADS( int lightIdx, inout vec4 ambient, inout vec4 diffuse, inout vec4 specular )
{
   vec3 n = normalize( NormalES );
   vec3 l = normalize( -Lights.PosEye[lightIdx].xyz ); //Assume directional light, if it is spot, it will get updated next
   if( Lights.PosEye[lightIdx].w > 0.5 ) //if this light is a SPOT Light (it has a position), then perform spot light computations
      l = normalize( Lights.PosEye[lightIdx].xyz - VertexES ); //vector to light source
   vec3 v = normalize( -VertexES ); //used by spec
   vec3 r = reflect( -l, n );       //used by spec
   
   //Compute Ambient Contribution
   ambient += Material.Ka * Lights.Irgba[lightIdx].rgba;
   
   //Compute Diffuse Contribution
   float diff = clamp( dot( l, n ), 0.0, 1.0 );
   diffuse += Material.Kd * diff * Lights.Irgba[lightIdx].rgba;
   
   //Compute Specular Contribution
   float spec = pow( max( dot( r, v ), 0.0 ), Material.SpecularCoeff );
   specular += Material.Ks  * spec * Lights.Irgba[lightIdx].rgba;
}

vec4 doADS_Textures_Shadows()
{
   vec4 ambient  = vec4(0,0,0,0);
   vec4 diffuse  = vec4(0,0,0,0);
   vec4 specular = vec4(0,0,0,0);
   vec4 texColor = texture( TexUnit0, TexCoord );
   
   //This code performs shadow mapping using PCF (Percent Closest Filtering)
   float shadow = 0; // Sum of the comparisons with nearby texels   
   shadow += textureProj( ShadowMap, ShadowCoord );
   
   
   for( int i = 0; i < Lights.NumLights; ++i )
      doADS( i, ambient, diffuse, specular );
   
   float alpha = min( texColor.a, ambient.a );
   vec4 adsColor = vec4( ambient + ( (diffuse + specular) * shadow ) ) + vec4( Lights.GlobalAmbient.rgb, 0 );
   adsColor = min( adsColor, vec4( 1.0, 1.0, 1.0, 1.0 ) ); //ensure textures don't get washed out (above 1.0 per channel)
   vec4 final = texColor * adsColor;
   final.a = alpha;
   return final;
}

vec4 doADS_Textures()
{
   vec4 ambient  = vec4(0,0,0,0);
   vec4 diffuse  = vec4(0,0,0,0);
   vec4 specular = vec4(0,0,0,0);
   vec4 texColor = texture( TexUnit0, TexCoord );
   
   for( int i = 0; i < Lights.NumLights; ++i )
      doADS( i, ambient, diffuse, specular );
   
   //Let the transparency be determined by the smallest (most transparent alpha value) passed into the
   //fragment's Ambient Material property alpha OR the fragment's Texture alpha channel
   float alpha = min( texColor.a, ambient.a );
   vec4 adsColor = vec4( ambient + ( diffuse + specular ) ) + vec4( Lights.GlobalAmbient.rgb, 0 );
   adsColor = min( adsColor, vec4( 1.0, 1.0, 1.0, 1.0 ) );
   vec4 final = texColor * adsColor;
   final.a = alpha;
   return final;
}

vec4 doDepthBufferGenerationOnly()
{
   return vec4( 1, 1, 0, 1 ); //just need to ensure the depth buffer is populated, we don't care about the color buffer
}

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

//subroutine(RenderPassType)
void pass1()
{
   float depth = texelFetch( DepthMap, ivec2(gl_FragCoord.x+0.5, gl_FragCoord.y+0.5), 0 ).r;
   //float depth = texture( DepthMap, gl_FragCoord.xy ).r;
   
   //The linearize block below is for debugging. It maps the depth buffer "DepthMap"
   //to HSV space linearly from near to far (red to purple).
   ////linearize depth map
   //float zNear = 1.0; //use the projection matrix's near plane
   //float zFar = 1000.0;  //use projection matrix's far plane
   //float z_n = 2.0 * depth - 1.0;
   //float z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));   
   //vec3 hsvStart = vec3(0.01,1.0,1.0);
   //vec3 hsvEnd = vec3(0.8333,1.0,1.0);
   //float lin = mix( hsvStart.x, hsvEnd.x, z_e / 1000.0 );
   //vec3 color3 = hsv2rgb( vec3(lin,1.0,1.0) );
   //FragColor = vec4(color3,1.0);
   //return;
   
   if( depth > gl_FragCoord.z )
   {   
      // Get the index of the next empty slot in the buffer
      uint nodeIdx = atomicCounterIncrement(nextNodeCounter);

      // Is our buffer full?  If so, we don't add the fragment
      // to the list.
      if( nodeIdx < MaxNodes )
      {
         vec4 color = vec4(0,0,0,1);
         
         // Here we set the color and depth of this new node to the color
         // and depth of the fragment.  The next pointer, points to the
         // previous head of the list.
         
         if( ShadowMapShadingState == 2 )
            color = doADS_Textures_Shadows();
         else if( ShadowMapShadingState == 1 )
            color = doDepthBufferGenerationOnly();
         else
           color = doADS_Textures();
        
         // Our fragment will be the new head of the linked list, so
         // replace the value at gl_FragCoord.xy with our new node's
         // index.  We use imageAtomicExchange to make sure that this
         // is an atomic operation.  The return value is the old head
         // of the list (the previous value), which will become the
         // next element in the list once our node is inserted.
         uint prevHead = imageAtomicExchange( headPointers, ivec2( gl_FragCoord.xy ), nodeIdx );
         nodes[nodeIdx].color = color;
         nodes[nodeIdx].depth = gl_FragCoord.z; //VertexES.z; //
         nodes[nodeIdx].next = prevHead;
         FragColor = nodes[nodeIdx].color;
      }   
   }   
}

void main()
{
   //"pass 1" will NOT set FragColor under normal circumstances, but will generated the linked list buffer
   //"pass 2" will set the FragColor according to the data inside of the linked list buffer.   
   pass1();
   
}
