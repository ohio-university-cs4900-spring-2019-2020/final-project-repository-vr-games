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

//VertexShader outputs specific to the quadric-based rendering
in vec2 VSuv;
in vec4 VShpos;
in vec3 VSvpos;
in vec3 VSview;
in vec2 VScurvature;
in vec3 VSlight;
in vec3 VSscale;

float lerpf( float a, float b, float s ); //helper linear interpolation 's' of the way between 'a' and 'b'

void doDiffuseShading();
void doDiffuseShadingRMS();
void doReliefMapping();
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds );
float rayIntersectDepthMapSecant( sampler2D reliefmap, vec2 dp, vec3 ds );

//#define USE_SECANT_METHOD


//Quadric-based relief mapping function prototypes and constants -----------
void doReliefMappingQuadric(); //Quadric-based relief mapping algorithm
float ray_intersect_rm_curved( sampler2D reliefmap, vec2 tx, vec3 v, float tmax, float dataz ); //Quadric-based ray intersection
vec3 ray_position( float t, vec2 tx, vec3 v, float dataz );
vec3 rayDisplacementCurved( float t, vec3 v, float dataz );

//Quadric-based number of linear search steps
#define l_search_steps_quadric 64
//Quadric-based number of binary search steps
#define b_search_steps_quadric 5
//End of Quadric-based relief mapping function prototypes and constants ----

void main()
{
   //doReliefMapping();
   //doDiffuseShading();
   //doAmbientDiffuseSpecTexturedShadingRMS();
   //doReliefMapping();
   //doReliefMapping();
   doReliefMappingQuadric();
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
   float d;   
   float tile = 1.0;
   
   vec4 ambient = vec4(.4,.4,.4,1);
   vec4 diffuse = vec4(1,1,1,1);
   
   p = vPosVS.xyz;
   v = normalize( p );
   
   //'s' is 'v' converted into Tangent Space for the depth map intersection testing
   //these dot products are equivalent to transforming v through the INVERSE of the TBN matrix
   s = normalize( vec3( dot( v, xdirTS ), dot( v, ydirTS ), dot( -v, vNormVS ) ) );
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
   //if( uv.x < 0 || uv.x > 1 ||uv.y < 0 || uv.y > 1 )
   //   discard;
      
   //if( d > discardDepthBelow )
   //   discard;
      
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
   
   p += v * cc;
   
   l = normalize( p - lightPosVS.xyz );
   #define RM_DEPTHCORRECT
   #ifdef RM_DEPTHCORRECT
      float near = 0.01; float far = 500.0;
      //SLN: added standard GL Pipeline code to convert from view space to window coordinates
      vec4 homoClip = gl_ProjectionMatrix * vec4(p.x,p.y,p.z,1.0);
      float ndcDepth = homoClip.z / homoClip.w;
      float theFragDepth = ( ( gl_DepthRange.diff * ndcDepth ) + gl_DepthRange.near + gl_DepthRange.far ) / 2.0;
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
      dp -= ds * d;
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
   finalColor.xyz += att * ( c.xyz * diffuse.xyz * diff + specular.xyz * pow( spec, 12) );
   gl_FragColor = finalColor;
}

//linear search followed by binary search
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds )
{
   const int linear_search_steps = 30;
   const int binary_search_steps = 5;
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

void doReliefMappingQuadric()
{
   // //outUVCoord is (3.67301, 2.47706, 0.00000)...
   // if( abs(VSuv.x - 3.67301) < 0.001 && abs(VSuv.y - 2.47706) < 0.001 )
   // {
      // gl_FragColor = vec4(1,0,0,1);
      // return;
   // }
   
    if( dot( vNormVS.xyz, normalize( vPosVS.xyz ) ) > 0 ) //backface culling
       discard;

	vec3 v = normalize( VSview );
	v.z *= -1;
	
	// mapping scale from object to texture space
	vec3 mapping = 1.0 / (VSscale);
	
	
	// quadric constants
   //Ensure that ALL input curvature coefficients are NOT zero or this fragment shader will output bad values
	float dataz = VScurvature.x * v.x * v.x + VScurvature.y * v.y * v.y;
   // if( abs( dataz ) < 0.0001 )
   // {
      // if( dataz < 0 )
         // dataz = -0.001;
      // else
         // dataz = 0.001;
   // }
	dataz = sign( dataz ) * max( abs( dataz ), 0.001 );
	
	// compute max distance for search min(t(z=0),t(z=1))
	float d = v.z * v.z - 4 * dataz * VSscale.z;
	float tmax = 50;
	if( d > 0 ) //t when z = 1
      tmax = min( tmax, ( -v.z + sqrt(d) ) / ( -2.0 * dataz ) );
	d = v.z / dataz;	// t when z=0
	if( d > 0 )
		tmax = min( tmax,d );
		
		
	// transform view and quadric data to texture space
	v *= mapping;
	dataz *= mapping.z;
		
	// ray intersect depth map
	float t = ray_intersect_rm_curved( normalTexture, VSuv, v, tmax, dataz );
	float alpha = 1;
	if( t > tmax )
		discard;//alpha = 0; // no intesection, discard fragment	
		
	// compute intersected position
	vec3 p = ray_position( t, VSuv, v, dataz );
	vec3 l = normalize( VSlight );

	
	vec3 normal = texture2D( normalTexture, p.xy ).xyz;
   // expand normal from normal map in local polygon space
   normal.xyz = normalize( normal.xyz * 2.0 - 1.0 );
   normal = normalize( normal.x * xdirTS + normal.y * ydirTS + normal.z * zdirTS ); //needs to be
   //in tangent space since it is dotted against the tangent space 'l' light vector for diffuse computation

	
	vec4 color = texture2D( diffuseTexture, p.xy );
	
	// compute diffuse and specular terms
	float diff = clamp( dot( l,normal ), 0.0, 1.0 );
   vec3 vNorm = normalize( VSview ); //restore view vector prior to computing specularity value
	float spec = clamp( dot( normalize( l - vNorm ), normal ), 0.0, 1.0 );
	
	// attenuation factor
	float att = 1.0 - max( 0, l.z ); att = 1.0 - att * att;
	
	vec4 finalcolor;
	finalcolor.xyz = att * ( ( color.xyz * diff ) + vec3(.1,.1,.1) + (vec3( 1, 1, 1 ) * pow( spec, 90.0 )) );
	finalcolor.w = alpha;
   
   
   #define RM_DEPTHCORRECT_CURVED
   #ifdef RM_DEPTHCORRECT_CURVED
      float near = 0.01; float far = 500.0;      
      
      // compute displaced pixel position in view space
      vec3 viewSpaceVec = normalize( vPosVS.xyz );      
      vec3 viewHitPt = vPosVS.xyz + viewSpaceVec * t; //view-space collision point
      
      //SLN: added standard GL Pipeline code to convert from view space to window coordinates
      vec4 homoClip = gl_ProjectionMatrix * vec4( viewHitPt.x, viewHitPt.y, viewHitPt.z, 1.0 );
      float ndcDepth = homoClip.z / homoClip.w;
      float theFragDepth = ( ( gl_DepthRange.diff * ndcDepth ) + gl_DepthRange.near + gl_DepthRange.far ) / 2.0;

      gl_FragDepth = theFragDepth;
     
   #endif
   
   
   // if( abs(VSuv.x - 3.67301) < 0.001 && abs(VSuv.y - 2.47706) < 0.001 )
   // {
      // gl_FragColor = vec4(1,0,0,1);
      // return;
   // }
   
   gl_FragColor = finalcolor;
}

float ray_intersect_rm_curved( sampler2D reliefmap, vec2 tx, vec3 v, float tmax, float dataz )
{
   const int linear_search_steps = l_search_steps_quadric;

   float t = 0.0;
   float size = ( tmax + 0.001 ) / linear_search_steps;

   // search front to back for first point inside object
   for( int i = 0; i < linear_search_steps; i++ )
   {
		vec3 p = ray_position( t, tx, v, dataz );
		float tex = 1.0 - texture2D( reliefmap, p.xy ).w;
		if( p.z < tex )
			t += size;
   }

   const int binary_search_steps = b_search_steps_quadric;

   // recurse around first point for closest match
   for( int i = 0; i < binary_search_steps; i++ )
   {
      size *= 0.5;
      vec3 p = ray_position( t, tx, v, dataz );
      float tex = 1.0 - texture2D( reliefmap, p.xy ).w;
      if( p.z < tex )
         t += 2 * size;
      t -= size;
   }
   return t;
}

vec3 ray_position(   float t,      // search parameters
                     vec2 tx,      // original pixel texcoord
                     vec3 v,       // view vector in texture space
                     float dataz ) // data constants
{
	vec3 r = v * t;
	r.z -= t * t * dataz;
	r.xy += tx;
	return r;
}

vec3 rayDisplacementCurved( float t,      // search parameters
                            vec3 v,       // view vector in texture space
                            float dataz ) // data constants
{
	vec3 r = v * t;
	r.z -= t * t * dataz;
	return r;
}
