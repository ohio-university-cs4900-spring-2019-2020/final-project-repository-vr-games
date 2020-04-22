#version 130

uniform sampler2D diffuseTexture;
//uniform sampler2D normalTexture;
//uniform sampler2D specularTexture;

uniform vec3 lightPosWS; //world space light position
uniform vec3 camPosWS;   //world space camera position
uniform vec3 camNormWS;  //world space camera normal
uniform vec3 modelPosWS; //world space model center point

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
uniform float depth;
uniform float discardDepthBelow;
	
in vec4 lightPosVS; //view space light position
//in vec3 lightPosTS; //tangent space light position

in vec4 vPosVS; //view space vertex position
in vec3 vNormVS; //view space vertex normal

//in vec3 xdirTS;
//in vec3 ydirTS;
//in vec3 zdirTS;

in vec4 modelViewProjZ; // 3rd column from ModelViewProjection Matrix


float lerpf( float a, float b, float s ); //helper linear interpolation 's' of the way between 'a' and 'b'

void doReliefMapping();
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds );


//#define USE_SECANT_METHOD

void main()
{
   doReliefMapping();
   return;
}

float lerpf( float a, float b, float s)
{
    return float(a + (b - a) * s);       
}

void doReliefMapping()
{
   vec4 t,c;
   vec3 p,v,l,s;
   vec2 dp,ds,uv;
   float d = 0;//,a;
   
   float tile = 1.0;
   
   vec4 ambient = vec4(.4,.4,.4,1);
   vec4 diffuse = vec4(1,1,1,1);
   
   p = vPosVS.xyz;
   v = normalize( p );
   //a = dot( vNormVS, -v );
   
   //'s' is 'v' converted into Tangent Space for the depth map intersection testing
   //these dot products are equivalent to transforming v through the INVERSE of the TBN matrix
   //s = normalize( vec3( dot( v, xdirTS ), dot( v, ydirTS ), dot( -v, vNormVS ) ) );
   s = vec3(0,0,1);
   //s *= depth / a;
   ds = s.xy;//s.xy * depth / s.z;
   dp = gl_TexCoord[0].st * tile;
   #ifndef USE_SECANT_METHOD
      //d = rayIntersectDepthMap( normalTexture, dp, ds );
   #else
      //d = rayIntersectDepthMapSecant( normalTexture, dp, s );
   #endif
   // get rm and color texture points
   uv = dp + ds * d;
   
   //discard fragments outside of the [0,1] UV range to remove border artifacts
   //if( uv.x < 0 || uv.x > 1 ||uv.y < 0 || uv.y > 1 )
   //    discard;
      
   //if( d < discardDepthBelow )
      //discard;
      
   //t = texture2D( normalTexture, uv );
   c = texture2D( diffuseTexture, uv );
   vec4 specular = vec4(1,1,1,1);//texture2D( specularTexture, uv );
   // expand normal from normal map in local polygon space
   //t.xyz = t.xyz * 2.0 - 1.0;
   //t.xyz = normalize( t.x * xdirTS + t.y * ydirTS + t.z * zdirTS );
   t.xyz = vec3(0,0,1);
      
   //compute light direction
   p += v * (d * 1.0) * s.z;
   l = normalize( p - lightPosVS.xyz );
   #define RM_DEPTHCORRECT
   #ifdef RM_DEPTHCORRECT
      float near = 0.01; float far = 500.0;
      //vec2 planes = vec2( (-far/(far-near)), ((-far*near)/(far-near)) ); //original
      //gl_FragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //original
      //float theFragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //original
        
      vec2 planes = vec2( ((-far+near)/(far-near)), ((-2.0*far*near)/(far-near)) ); //SLN most correct math for depth
      float theFragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //[-1,1]  //SLN most correct math for depth
      theFragDepth = 0.5 + 0.5 * theFragDepth; //need to clamp [-1,1] to [0,1] //SLN most correct math for depth

      //Divide 'theFragDepth' by W here
      //vec4 homoClip = proj * vec4(p.x,p.y,p.z,1.0);
      //theFragDepth /= homoClip.w;

      gl_FragDepth = theFragDepth;
     
   #endif
   
   // compute diffuse and specular terms
   float att = clamp( dot( -l, vNormVS ), 0, 1 );
   float diff = clamp( dot( -l, t.xyz ),0, 1 );
   float spec = clamp( dot( normalize( -l - v ), t.xyz ),0, 1 );
   vec4 finalColor = ambient * c;
   
   //#define RM_SHADOWS
   #ifdef RM_SHADOWS
      // // ray intersect in light direction
      // dp += ds * d;
      // s = normalize( vec3( dot( l, xdirTS ), dot( l, ydirTS ), dot( vNormVS, -l ) ) );
      // ds = s.xy * depth / s.z;
      // dp -= ds * d;
      // #ifndef USE_SECANT_METHOD
         // float dl = rayIntersectDepthMap( normalTexture, dp, ds.xy );
      // #else
         // float dl = rayIntersectDepthMapSecant( normalTexture, dp, s );
      // #endif
      // if( dl < d - 0.05 ) // if pixel in shadow
      // {
         // diff *= dot( ambient.xyz, vec3(1.0) ) * 0.333333;
         // spec = 0;
      // }
   #endif

   // compute final color
   finalColor.xyz += att * ( c.xyz * diffuse.xyz * diff + specular.xyz * pow( spec, 12) );
   //finalColor.x = theFragDepth;
   //finalColor.y = 0;
   //finalColor.z = 0;
   //finalColor.w = 1.0;
   gl_FragColor = finalColor;
}

//linear search followed by binary search
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds )
{
   // const int linear_search_steps = 30;
   // const int binary_search_steps = 5;
   // float depth_step = 1.0 / linear_search_steps;
   // float size = depth_step; // current size of search window
   // float depth = 0.0; // current depth position (more like the current parametric value along ds, 0 is point A, 1 is point B)
   // // best match found (starts with last position 1.0)
   // float best_depth = 1.0; //first point below the surface
   // //search from front to back for first point inside the object
   // //   this for loop performs the linear march along vector A->B which finds the first linearly
   // //   spaced point under the height field this result depth is used
   // //   as the anchor in the binary search
   // for( int i = 0; i < linear_search_steps - 1; i++ )
   // {
      // depth += size;
      // vec4 t = texture2D( reliefmap, dp + ds * depth );
      // t.w = 1 - t.w; //Scott Nykl: If using a " height map ", then we must do a 1 - t to treat value as a " depth map "
      // if( best_depth > 0.996 ) // if no depth found yet
         // if( depth >= t.w )
            // best_depth = depth; // store best depth
   // }
   // depth = best_depth;
   // // search around first point (depth) for closest match
   // for( int i = 0; i < binary_search_steps; i++ )
   // {
      // size *= 0.5;
      // vec4 t = texture2D( reliefmap, dp + ds * depth );
      // t.w = 1 - t.w;
      // if (depth >= t.w)
      // {
         // best_depth = depth;
         // depth -= 2 * size;
      // }
      // depth += size;
   // }
   // return best_depth;
   return 0;
}

