#version 130

uniform sampler2D diffuseTexture;
uniform sampler2D normalTexture;
uniform sampler2D specularTexture;

uniform vec3 lightPosWS; //world space light position
uniform vec3 camPosWS;   //world space camera position
uniform vec3 camNormWS;  //world space camera normal
uniform vec3 modelPosWS; //world space model center point

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
uniform float depth;
uniform float discardDepthBelow;
uniform float scaleFactorOfModel;
	
in vec4 lightPosVS; //view space light position
in vec3 lightPosTS; //tangent space light position

in vec4 vPosVS; //view space vertex position
in vec3 vNormVS; //view space vertex normal

in vec3 xdirTS;
in vec3 ydirTS;
in vec3 zdirTS;


float lerpf( float a, float b, float s ); //helper linear interpolation 's' of the way between 'a' and 'b'

void doDiffuseShading();
void doDiffuseShadingRMS();
void doReliefMapping();
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds );
float rayIntersectDepthMapSecant( sampler2D reliefmap, vec2 dp, vec3 ds );

//#define USE_SECANT_METHOD

void main()
{
   //doReliefMapping();
   //doDiffuseShading();
   //doAmbientDiffuseSpecTexturedShadingRMS();
   //doReliefMapping();
   doReliefMapping();
   return;
}

float lerpf( float a, float b, float s)
{
    return float(a + (b - a) * s);       
}

void doDiffuseShading()
{
   vec4 ambient = vec4(0.4,0.4,0.4,1);
   vec4 diffuse = vec4(1,1,1,1);
   
   //diffuse computations
   float diff = clamp( dot( normalize(lightPosVS.xyz - vPosVS.xyz), normalize(vNormVS.xyz) ), 0.0, 1.0 );
   
   //diffuse only
   gl_FragColor = vec4( vec3( diffuse * diff  ),  clamp( lightPosTS.y, 0.99,1.0 ) ); //diffuse lighting only
   
   //diffuse and ambient
   gl_FragColor = vec4( vec3( diffuse * diff  ),  clamp( lightPosTS.y, 0.99,1.0 ) ) + ambient;
}

void doAmbientDiffuseSpecTexturedShadingRMS()
{
   vec4 t,c;
   vec3 p,v,l,s;
   vec2 dp,ds,uv;
   float d,a;

   vec4 ambient = vec4(0.4,0.4,0.4,1);
   vec4 diffuse = vec4(1,1,1,1);
   diffuse.a = lightPosTS.x;
   
   p = vPosVS.xyz;
   v = normalize( p );
   a = dot( vNormVS, -v );
   
   c = texture2D( diffuseTexture, gl_TexCoord[0].st );
   vec4 specular = texture2D( specularTexture, gl_TexCoord[0].st );
   
   l = normalize( p - lightPosVS.xyz );
   
   float att = clamp( dot( -l, vNormVS ), 0, 1 );
   float diff = clamp( dot( -l, vNormVS ),0, 1 );
   float spec = clamp( dot( normalize( -l - v ), vNormVS ),0, 1 );
   vec4 finalColor = ambient * c;
   
      
   //diffuse only
   gl_FragColor = vec4( vec3( diffuse * diff  ),  clamp( lightPosTS.y, 0.99,1.0 ) ); //diffuse lighting only
   
   //diffuse and ambient
   gl_FragColor = vec4( vec3( diffuse * diff  ),  clamp( lightPosTS.y, 0.99,1.0 ) ) + ambient;
   
   //diffuse, ambient, and specular
   // compute final color
   finalColor.xyz += att * ( ( c.xyz * diffuse.xyz * diff ) + specular.xyz * pow( spec, specular.w ) );
   finalColor.w = clamp( lightPosTS.y, .99, 1.0 );
   gl_FragColor = finalColor;
}

void doReliefMapping()
{
   vec4 t,c;
   vec3 p,v,l,s;
   vec2 dp,ds,uv;
   float d;//,a;
   
   float tile = 1.0;
   
   vec4 ambient = vec4(.1,.1,.1,1);
   vec4 diffuse = vec4(1,1,1,1);
   
   p = vPosVS.xyz;
   //vec4 eyePos = gl_ModelViewMatrixInverse * vec4(0,0,0,1);
   //eyePos.xyz /= eyePos.w;
   //p = eyePos.xyz;
   
   
   v = normalize( p );
   //a = dot( vNormVS, -v );
   
   //'s' is 'v' converted into Tangent Space for the depth map intersection testing
   //these dot products are equivalent to transforming v through the INVERSE of the TBN matrix
   s = normalize( vec3( dot( v, xdirTS ), dot( v, ydirTS ), dot( -v, vNormVS ) ) );
   //s *= depth / a;
   ds = s.xy * depth / s.z;
   dp = gl_TexCoord[0].st * tile;
   #ifndef USE_SECANT_METHOD
      d = rayIntersectDepthMap( normalTexture, dp, ds );
   #else
      d = rayIntersectDepthMapSecant( normalTexture, dp, s );
   #endif
   // get rm and color texture points
   uv = dp + ds * d;
   
   //discard fragments outside of the [0,1] UV range to remove border artifacts
   // if( uv.x < 0 || uv.x > 1 ||uv.y < 0 || uv.y > 1 )
      // discard;
      
    if( d > discardDepthBelow )
       discard;
      
   t = texture2D( normalTexture, uv );
   c = texture2D( diffuseTexture, uv );
   vec4 specular = vec4(1,1,1,1);//texture2D( specularTexture, uv );
   // expand normal from normal map in local polygon space
   t.xyz = t.xyz * 2.0 - 1.0;
   t.xyz = normalize( t.x * xdirTS + t.y * ydirTS + t.z * zdirTS );
      
   //compute light direction
   //p += v * d * s.z;
   
   float aa = length( ds * d * scaleFactorOfModel ); //length of horizontal UV displacement
   float bb = d * depth * scaleFactorOfModel; //depth into depth map
   float cc = sqrt( aa*aa + bb*bb ); 
   
   p += v * cc; //view space 3D collision point
   
   l = normalize( p - lightPosVS.xyz );
   #define RM_DEPTHCORRECT
   #ifdef RM_DEPTHCORRECT
      float near = 0.01; float far = 500.0;
      
      // vec3 viewSpaceVec = normalize( vPosVS.xyz );
      // vec3 imm = v * d * s.z;
       // imm.x *= 10;
       // imm.y *= 10;
       // imm.z *= 10.0;
      // vec3 viewHitPt = vPosVS.xyz + imm;
      // p = viewHitPt;
      
	   //vec2 planes = vec2( (-far/(far-near)), ((-far*near)/(far-near)) ); //original
      //gl_FragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //original
      //float theFragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //original
      
      //from Oliveira's technical report
      //float theFragDepth = (p.z * (far+near) + (2.0*far*near)) / ( p.z*(far-near) );
      
	  
	  //Tev's perspective depth value computation:
	  //vec4 _p = gl_ProjectionMatrix * vec4(p.x,p.y,p.z,1.0);
	  //float z = _p.z;
	  //float theFragDepth = ((-far / (far - near) * z - far * near / (near - far)) / -z);
	  ///////////
        
      //vec2 planes = vec2( ((-far+near)/(far-near)), ((-2.0*far*near)/(far-near)) ); //SLN most correct math for depth
      //float theFragDepth = ((planes.x * p.z + planes.y ) / -p.z ); //[-1,1]  //SLN most correct math for depth
      //theFragDepth = 0.5 + 0.5 * theFragDepth; //need to clamp [-1,1] to [0,1] //SLN most correct math for depth

      //Divide 'theFragDepth' by W here
      //SLN: added standard GL Pipeline code to convert from view space to window coordinates
      vec4 homoClip = gl_ProjectionMatrix * vec4(p.x,p.y,p.z,1.0);
      float ndcDepth = homoClip.z / homoClip.w;
      float theFragDepth = ( ( gl_DepthRange.diff * ndcDepth ) + gl_DepthRange.near + gl_DepthRange.far ) / 2.0; //from gamedev
	   //float theFragDepth =  ( gl_DepthRange.diff / 2.0 * ndcDepth ) + ( gl_DepthRange.near + gl_DepthRange.far ) / 2.0;
	  //float theFragDepth = 0.5 * ndcDepth + 0.5;
      ////homoClip.xyz /= homoClip.w;
      ////float theFragDepth = homoClip.z;
	  
	  //SLN: we could try to compensate for the depth precision values by further increasing the depth by a
	  //scalar of the maximum depth the relief map could be.
      
      //do i need to do the view port transformation?
	  //float theFragDepth = ((far-near)*ndcDepth + ((far+near)))/2.0;
	  //float theFragDepth = (1.f / near - 1.f / p.z) / (1.f / near - 1.f / far); //from http://www.gamedev.net/topic/438419-depth-texture-in-shader/

      gl_FragDepth = theFragDepth;
     
   #endif
   
   // compute diffuse and specular terms
   float att = clamp( dot( -l, vNormVS ), 0, 1 );
   float diff = clamp( dot( -l, t.xyz ),0, 1 );
   float spec = clamp( dot( normalize( -l - v ), t.xyz ),0, 1 );
   vec4 finalColor = ambient * c;
   
   #define RM_SHADOWS
   #ifdef RM_SHADOWS
      // ray intersect in light direction
      dp += ds * d;
      s = normalize( vec3( dot( l, xdirTS ), dot( l, ydirTS ), dot( vNormVS, -l ) ) );
      ds = s.xy * depth / s.z;
      dp -= ds * d; //same as saying dp += -ds * d
      #ifndef USE_SECANT_METHOD
         float dl = rayIntersectDepthMap( normalTexture, dp, ds.xy );
      #else
         float dl = rayIntersectDepthMapSecant( normalTexture, dp, s );
      #endif
      if( dl < d - 0.05 ) // if pixel in shadow
      {
         diff *= dot( ambient.xyz, vec3(1.0) ) * 0.333333;
         spec = 0;
      }
   #endif

   // compute final color
   finalColor.xyz += att * ( c.xyz * diffuse.xyz * diff + specular.xyz * pow( spec, 128) );
   //finalColor.x = theFragDepth;
   //finalColor.y = 0;
   //finalColor.z = 0;
   //finalColor.w = 1.0;
   gl_FragColor = finalColor;
}

//linear search followed by binary search
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds )
{
   const int linear_search_steps = 20; //default 20... 256 is really nice
   const int binary_search_steps = 8;  //default 8
   float depth_step = 1.0 / linear_search_steps;
   float size = depth_step; // current size of search window
   float depth = 0.0; // current depth position (more like the current parametric value along ds, 0 is point A, 1 is point B)
   // best match found (starts with last position 1.0)
   float best_depth = 1.0; //first point below the surface
   //search from front to back for first point inside the object
   //   this for loop performs the linear march along vector A->B which finds the first linearly
   //   spaced point under the height field this result depth is used
   //   as the anchor in the binary search
   for( int i = 0; i < linear_search_steps - 1; i++ )
   {
      depth += size;
      vec4 t = texture2D( reliefmap, dp + ds * depth );
      t.w = 1 - t.w; //Scott Nykl: If using a " height map ", then we must do a 1 - t to treat value as a " depth map "
      if( best_depth > 0.996 ) // if no depth found yet
         if( depth >= t.w )
            best_depth = depth; // store best depth
   }
   depth = best_depth;
   // search around first point (depth) for closest match
   for( int i = 0; i < binary_search_steps; i++ )
   {
      size *= 0.5;
      vec4 t = texture2D( reliefmap, dp + ds * depth );
      t.w = 1 - t.w;
      if (depth >= t.w)
      {
         best_depth = depth;
         depth -= 2 * size;
      }
      depth += size;
   }
   return best_depth;
}

//linear search followed by secant method
float rayIntersectDepthMapSecant( sampler2D reliefmap, vec2 dp, vec3 ds )
{
   const int linear_search_steps = 30;
   const int secant_steps = 2;
   float depth_step = 1.0 / linear_search_steps;
   float size = depth_step; // current size of search window
   float depth = 0.0; // current depth position (more like the current parametric value along ds, 0 is point A, 1 is point B)

   float best_depth = 1.0; //first point below the surface
   
   float upper_h = 0;
   float lower_h = 1.0;
   float upper_d = 0;
   float lower_d = 1.0;
   float prevAlpha = 0;
   float prevX = 0;
   
   for( int i = 0; i < linear_search_steps - 1; i++ )
   {
      depth += size;
      vec4 t = texture2D( reliefmap, dp + ds.xy * depth );
      t.w = 1 - t.w; //Scott Nykl: If using a " height map ", then we must do a 1 - t to treat value as a " depth map "
      if( best_depth > 0.996 ) // if no depth found yet
      {
         if( depth >= t.w )
         {
            best_depth = depth; // store best depth
            lower_h = t.w;
            lower_d = length( ds.xy * depth );
            
            upper_h = prevAlpha;
            upper_d = prevX;            
         }
      }
      prevAlpha = t.w;
      prevX = length( ds.xy * depth );
   }
   depth = best_depth;
   
  
//////////////////////////
   float int_depth = 0;
   float curHeight = 1.0;
   float view_slope = ds.z / length( ds.xy * depth );
   for(int i = 0; (i < 10) && (abs(curHeight - int_depth) > .01); i++)
   {
      float line_slope = (upper_h - lower_h)/(upper_d - lower_d);
      float line_inter = upper_h - line_slope*upper_d;
      float dem = view_slope - line_slope;
      float inter_pt = line_inter / dem;
      vec2 tex_coords_offset2D = inter_pt * vec2(ds.z, -length(ds.xy) );
      int_depth = view_slope*inter_pt;
      curHeight = 1.0 - texture2D( reliefmap, tex_coords_offset2D + dp ).a;
      if( curHeight < int_depth ) //new upper bound
      {
         upper_h = curHeight;
         upper_d = inter_pt;
         depth = upper_h;
      }
      else //new lower bound
      {
         lower_h = curHeight;
         lower_d = inter_pt;
         depth = lower_h;
      }
   }

   return depth;
   
//////////////////////////   
   // secant method to find intersection point
   // float H = 0;
   // float D = 0;
   // vec2 uvin = dp;
   // vec2 uvout = dp + ds.xy;
   // for( int i = 0; i < secant_steps; i++ )
   // {
      // H = Hb + (Ha - Hb) / (Da - Db) * Da;
      // vec2 uv = uvin * H + uvout * (1.0-H);
      // D = (1.0-H) - ( 1.0 - texture2D( reliefmap, uv ).a );
      // if( D < 0 )
         // { Db = D; Hb = H; }
      // else
         // { Da = D; Ha = H; }
   // }
   // return H;
}
