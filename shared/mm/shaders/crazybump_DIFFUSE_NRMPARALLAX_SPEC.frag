#version 130

uniform sampler2D diffuseTexture;
uniform sampler2D normalTexture;
uniform sampler2D specularTexture;
	
// New bumpmapping
in vec3 lightVecTS; //tangent space
in vec3 halfVecTS; //tangent space
in vec3 eyeVecTS; //tangent space

in vec3 vertPosES;
in vec3 vertPosTS;
in vec3 xdirTS;
in vec3 zdirTS;

in vec3 tangentVec;
in vec3 lightVecES;

vec2 computeParallaxMappingUVCoordMethodA();
vec2 computeParallaxMappingUVCoordMethodB();
vec2 computeParallaxMappingUVCoordMethodC();
vec2 computeParallaxMappingUVCoordMethodD();
vec2 computeParallaxMappingUVCoordMethodE();
vec2 computeParallaxMappingUVCoordMethodF();
vec2 computeParallaxMappingUVCoordMethodF( vec2 inUV, float scale, float bias );

float lerpf( float a, float b, float s); //helper linear interpolation 's' of the way between 'a' and 'b'
void doReliefMapping();
float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds );

void main()
{
   doReliefMapping();
   return;

   //For depth mapping, we first have to compute the new texture coordinate to sample.
   vec2 parallaxTexCoord = vec2(0);
   parallaxTexCoord = computeParallaxMappingUVCoordMethodA();
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodB();
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodC();
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodD();
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodE();
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodF();
   

   //http://ciardhubh.de/node/18
   // Base color from diffuse texture
   vec4 baseColor = texture2D( diffuseTexture, parallaxTexCoord.st );

   // Uncompress normal from normal map texture
   vec3 normal = normalize( texture2D( normalTexture, parallaxTexCoord.st).rgb * 2.0 - 1.0);
   //normal.y = -normal.y; //invert up/down
   normal.x = -normal.x;

   // Ambient
   //vec4 ambient = gl_LightSource[0].ambient * baseColor;
   vec4 ambient = gl_LightModel.ambient * baseColor; //use OpenGL's global ambient
                                                      //color instead of a light's ambient

   // Diffuse
   // Normalize interpolated direction to light
   vec3 lightVecTS = normalize( lightVecTS );
   // Full strength if normal points directly at light
   float diffuseIntensity = max(dot(lightVecTS, normal), 0.0);
   vec4 diffuse = gl_LightSource[0].diffuse * baseColor * diffuseIntensity;

   // Specular
   float shininess = 8.0;
   vec4 specular = vec4(0.0, 0.0, 0.0, 0.0);
   // Only calculate specular light if light reaches the fragment.
   if (diffuseIntensity > 0.0)
   {
      // Color of specular reflection
      vec4 specularColour = texture2D(specularTexture, parallaxTexCoord.xy); 
      // Specular strength, Blinn–Phong shading model
      float specularModifier = max(dot(normal, normalize(halfVecTS)), 0.0); 
      specular = gl_LightSource[0].specular * specularColour * pow(specularModifier, shininess);
   }

   // Sum of all lights
   gl_FragColor = clamp(ambient + diffuse + specular, 0.0, 1.0);
   //float depthMap = texture2D(normalTexture, parallaxTexCoord.xy).a;
   //gl_FragColor = vec4(depthMap,depthMap,depthMap,1.0);

   // Use the diffuse texture's alpha value.
   gl_FragColor.a = baseColor.a;

   //vec4 v4 = vec4( 0,0,0,1 );
   //vec4 tv = vec4(normalize(tangentVec),1);
   //vec4 v4 = vec4( abs(tv.x),abs(tv.y),abs(tv.z),1);
   
   //gl_FragColor = v4;
   

   ////// lookup normal from normal map, move from [0,1] to  [-1, 1] range, normalize
   ////vec3 normal = 2.0 * texture2D(normalTexture, parallaxTexCoord.st).rgb - 1.0;
   ////normal = normalize(normal);

   ////// compute diffuse lighting
   ////float lamberFactor= max(dot(lightVecTS, normal), 0.0) ;
   ////vec4 diffuseMaterial = vec4(0.0);
   ////vec4 diffuseLight  = vec4(0.0);

   ////// compute specular lighting
   ////vec4 specularMaterial;
   ////vec4 specularLight;
   ////float shininess;
   ////float shininessCoef;


   ////// compute ambient
   ////vec4 ambientLight = gl_LightSource[0].ambient;	

   //////if (lamberFactor > 0.0)
   //////{
   ////diffuseMaterial = texture2D(diffuseTexture, parallaxTexCoord.st);
   //////diffuseMaterial = vec4(1,1,1,1);
   ////diffuseLight = gl_LightSource[0].diffuse;

   ////// In doom3, specular value comes from a texture
   //////Specular = specularMaterial * specularLight * speculatCoef
   //////speculatCoef = pow (max (dot (halfVecTS, normal), 0.0), shininess) 

   ////specularMaterial = vec4(.20);
   ////specularLight = gl_LightSource[0].specular;
   ////shininess = normalize( 2.0 * texture2D(specularTexture, parallaxTexCoord.st) -1 );
   ////shininessCoef = pow (max (dot (halfVecTS, normal), 0.0), shininess);
   ////gl_FragColor =	diffuseMaterial * diffuseLight * lamberFactor ;
   ////gl_FragColor += specularMaterial * specularLight * 1.0;			

   //////}

   //////if(lamberFactor > .5)
   //////gl_FragColor = vec4(lightVecTS,1);
   //////gl_FragColor = vec4(lightVecTS,1);

   ////gl_FragColor += ambientLight;

}

vec2 computeParallaxMappingUVCoordMethodA()
{
   float scale = 0.05;
   float bias = -0.05;
   float h = texture2D( normalTexture, gl_TexCoord[0].st ).a;
   float v = h * scale + bias;
   vec3 eye = normalize( eyeVecTS );
   vec2 newTexCoord = gl_TexCoord[0].st + ( eye.xy * v );
   return newTexCoord;
}

vec2 computeParallaxMappingUVCoordMethodB()
{
   // //vec3 rgb = texture2D( diffuseTexture, newTexCoord ).rgb; 


   //1.Object Coordinates are transformed by the ModelView matrix to produce Eye Coordinates.
   //2.Eye Coordinates are transformed by the Projection matrix to produce Clip Coordinates.
   //3.Clip Coordinate X, Y, and Z are divided by Clip Coordinate W to produce Normalized Device Coordinates.
   //4.Normalized Device Coordinates are scaled and translated by the viewport parameters to produce Window Coordinates.
   //http://www.ziggyware.com/readarticle.php?article_id=47
   int fmaxsamples = 15; // the maximum number of samples for sampling the height field profile
   int fminsamples = 5; // the minimum number of samples for sampling the height field profile

   vec2 parallaxTexCoord = vec2(0);
   //parallaxTexCoord = computeParallaxMappingUVCoordMethodA();
   vec2 texcoord = vec2( gl_TexCoord[0].st );

   //int nnumsteps = lerpf( fmaxsamples, fminsamples, dot( eyeveces, normveces ) );
   //vec3 normal = normalize( texture2D( normalTexture, texcoord.st).rgb * 2.0 - 1.0);
   int nnumsteps = 500;//lerpf( (float)fmaxsamples, (float)fminsamples, dot( eyeVecTS, normal ) );
   float fstepsize = 1.0 / float(nnumsteps);

   vec3 raydir = vec3( normalize( eyeVecTS ) );
   raydir *= fstepsize; //direction we march from polygonal surface down towards depth mask
   
   //vec2 texcoord = vec2( gl_TexCoord[0].st );
   vec2 texoffset = vec2( 0.0, 0.0 );
   vec3 raypos = vec3( vec2( texcoord ), 1.0 ); //position we have currently marched

   int nstepindex = 0;
   float curdepthval = 0.0; //current depth value within the alpha channels depth mask give the ray's xy
   
   while( nstepindex < nnumsteps )
   {
      raypos = raypos + raydir;
      curdepthval = texture2D( normalTexture, raypos.st ).a;

      if( raypos.z <= curdepthval )
      {
         texoffset = vec2( raypos.xy );
         break;
      }

      nstepindex += 1;
   }

   // texoffset *= .05;
   return texcoord + texoffset;
}

//Kaneo's parallax mapping (no offset limiting)
vec2 computeParallaxMappingUVCoordMethodC()
{
   float scale = 0.05;
   float bias = -0.05;
   float h = texture2D( normalTexture, gl_TexCoord[0].st ).a;
   h = h * scale + bias;
   vec3 eye = normalize( eyeVecTS );
   vec2 newTexCoord = gl_TexCoord[0].st + ( eye.xy * h ) / eye.z;
   return newTexCoord;
}

//parallax mapping w/ offset limiting
vec2 computeParallaxMappingUVCoordMethodD()
{
   float scale = 0.05;
   float bias = -0.05;
   
   vec3 view = normalize( eyeVecTS );
   float h = texture2D( normalTexture, gl_TexCoord[0].st ).a * scale + bias;
   vec2 newTexCoord = gl_TexCoord[0].st + h * view.xy ;// view.z;
   return newTexCoord;
}

//parallax mapping w/ offset limiting
vec2 computeParallaxMappingUVCoordMethodD( vec2 inUV, float scale, float bias )
{
   vec3 view = normalize( eyeVecTS );
   float h = texture2D( normalTexture, inUV ).a * scale + bias;
   vec2 newTexCoord = inUV + h * view.xy ;// view.z;
   return newTexCoord;
}

//iterative parallax mapping
vec2 computeParallaxMappingUVCoordMethodE()
{
   float scale = 0.05;
   float bias = -0.05;
   
   vec3 view = normalize( eyeVecTS );
   
   
   // vec3 uvh = vec3( gl_TexCoord[0].s,  gl_TexCoord[0].t, texture2D( normalTexture, gl_TexCoord[0].st ).a );//vec3(0,0,0);// = texture2D( normalTexture, gl_TexCoord[0].st );
   
   // uvh.z = uvh.z * scale + bias;
   
   // for( int i = 0; i < 4; ++i )
   // {
      // vec4 normal = texture2D( normalTexture, uvh.xy );
      // float h = normal.a * scale + bias;
      // uvh += ( h - uvh.z ) * normal.z * view;
   // }
   
   // return uvh.xy;// + gl_TexCoord[0].st;
   
   
   vec4 normOrig = texture2D( normalTexture, gl_TexCoord[0].st );
   normOrig.a = normOrig.a * scale + bias; //normalized tangent space height at gl_TexCoord[0].st
   float horig = normOrig.a;             //height at st
   float nz = normOrig.z;                //Z component of normal at st
   vec2 uvOrig = gl_TexCoord[0].st;
   vec3 uvhOrig = vec3( uvOrig.x, uvOrig.y, horig );

   
   // vec2 uv = computeParallaxMappingUVCoordMethodF();
   // vec4 norm = texture2D( normalTexture, uv );
   // norm.a = norm.a * scale + bias;
   // float h = norm.a; //height at uv
   // vec3 uvh = vec3( uv.x, uv.y, h );
   
   for( int i = 0; i < 4; ++i )
   {
      vec2 uv = computeParallaxMappingUVCoordMethodD( uvhOrig.xy, scale, bias );
      vec4 norm = texture2D( normalTexture, uv );
      norm.a = norm.a * scale + bias;
      float h = norm.a; //height at uv
      vec3 uvh = vec3( uv.x, uv.y, h );
      
      uvhOrig += ( horig - h ) * normOrig.z * view;
      horig = h;
      normOrig.z = norm.z;
   }
   
   return uvhOrig.xy;
}

//parallax mapping w/ slope information
vec2 computeParallaxMappingUVCoordMethodF()
{
   float scale = 0.10;
   float bias = -0.05;
   
   vec2 uv = gl_TexCoord[0].st;
   vec3 view = normalize( eyeVecTS );
   vec4 normal = texture2D( normalTexture, uv );
   float h = normal.a * scale + bias;
   uv += h * normal.z * view.xy;
   
   return uv;
}

vec2 computeParallaxMappingUVCoordMethodF( vec2 inUV, float scale, float bias )
{ 
   vec2 uv = inUV;
   vec3 view = normalize( eyeVecTS );
   vec4 normal = texture2D( normalTexture, uv );
   float h = normal.a * scale + bias;
   uv += h * normal.z * view.xy;
   
   return uv;
}

float lerpf( float a, float b, float s)
{
    return float(a + (b - a) * s);       
}

void doReliefMapping()
{
   // f2s main frag relief( v2f IN,
   // uniform sampler2D rmtex:TEXUNIT0, // rm texture map
   // uniform sampler2D colortex:TEXUNIT1, // color texture map
   // uniform float4 lightpos, // light position in view space
   // uniform float4 ambient, // ambient color
   // uniform float4 diffuse, // diffuse color
   // uniform float4 specular, // specular color
   // uniform float2 planes, // near and far planes info
   // uniform float tile, // tile factor
   // uniform float depth) // scale factor for height-field depth
   // { 
   //f2s OUT;
   vec4 t,c;
   vec3 p,v,l,s;
   vec2 dp,ds,uv;
   float d;
   
   float tile = 1.0;
   float depth = 0.1;
   vec4 ambient = gl_LightModel.ambient;
   vec4 diffuse = vec4(1,1,1,1);
   
   
   // ray intersect in view direction
         // p = IN.vpos; // pixel position in eye space
         p = vertPosTS;
         //v = normalize( p );
         v = normalize( vertPosTS ); //v is used in computations that are in tangent space, thus we want v to be in tangent space
         // v = normalize(p); // view vector in eye space
         // // view vector in tangent space
         // s = normalize(float3(dot(v,IN.tangent.xyz),
         // dot(v,IN.binormal.xyz),dot(IN.normal,-v))); //SLNXX , notice how -v is negated when transforming by TBN matrix... perhaps this is because RM uses depth map (extrude downwards) verse height map
   // size and start position of search in texture space
   
   s = normalize( eyeVecTS ); //view/eye vector in tangent space //texture2D( normalTexture, gl_TexCoord[0].st ).a;
      s.z = s.z * -1.0;
   
   ds = s.xy * depth / s.z;
   dp = gl_TexCoord[0].st * tile;


   // get intersection distance
   d = rayIntersectDepthMap( normalTexture, dp, ds );
   // get normal and color at intersection point
   uv = dp + ds * d;
   t = texture2D( normalTexture, uv ); //Normals created by crazy bump are ALWAYS output in tangent space. T is already in tangent space.
   c = texture2D( diffuseTexture, uv );
   vec4 specular = texture2D( specularTexture, uv );
   t.xyz = t.xyz * 2.0 - 1.0; // expand normal to eye space (this is not eye space, but tangent space)
   //t = vec4(0,0,1,1);
         // t.xyz=normalize(t.x*IN.tangent.xyz+
         // t.y*IN.binormal.xyz+t.z*IN.normal);

         // compute light direction
   p += v * d * s.z; /// Currently RIGHT HERE SLN: looks like recreating eye space light direction, l. But on line 365,366, vec4 t is dotted w/ l... since we use crazy bump, t is tangent space
      //l=normalize(p-lightpos.xyz); //use the vertex interpolated eye space light vector here SLNXX
   l = lightVecTS * -1.0;
   #ifdef RM_DEPTHCORRECT
      // planes.x=-far/(far-near); planes.y =-far*near/(far-near);
      OUT.depth=((planes.x*p.z+planes.y)/-p.z);
   #endif
      // compute diffuse and specular terms
            //float att=saturate(dot(-l,IN.normal));
      // float att = saturate( dot( -l, zdirTS ) );
      float att = clamp( dot( -l, zdirTS ), 0.0, 1.0 );
      // float diff=saturate(dot(-l,t.xyz));
      float diff = clamp( dot( -l, t.xyz ), 0.0, 1.0 );
      // float spec=saturate(dot(normalize(-l-v),t.xyz));
      float spec = clamp( dot( halfVecTS, t.xyz  ), 0.0, 1.0 );
      
            // Color of specular reflection
            //vec4 specularColour = texture2D(specularTexture, parallaxTexCoord.xy); 
            // Specular strength, Blinn–Phong shading model
            //float specularModifier = max(dot(normal, normalize(halfVecTS)), 0.0); 
            //spec = max(dot(t.xyz, normalize(halfVecTS)), 0.0); 
            //specular = gl_LightSource[0].specular * specularColour * pow(specularModifier, shininess);
      
      
      vec4 finalcolor = ambient * c;
   //#define RM_SHADOWS
   #ifdef RM_SHADOWS
      // ray intersect in light direction
      dp += ds * d; // update position in texture space
      // light direction in texture space
      // s = normalize(float3(dot(l,IN.tangent.xyz),
                           // dot(l,IN.binormal.xyz),
                           // dot(IN.normal,-l)));
      s = normalize( l );
         s.z *= -1; //normals points into depth map in relief mapping, not up/away from surface
         
      ds = s.xy * depth / s.z;
      dp -= ds * d; // entry point for light ray in texture space
      // get intresection distance from light ray
      float dl = rayIntersectDepthMap( normalTexture, dp, ds.xy );
      if( dl < d - 0.05 ) // if pixel in shadow
      {
         diff *= dot( ambient.xyz, vec3(1.0,1.0,1.0) ) * 0.3333;
         spec=0;
      } 
   #endif
   
   //finalcolor.xyz += att * ( c.xyz * diffuse.xyz * diff + specular.xyz * pow( spec, 4 ) );
   finalcolor.xyz = diffuse.xyz * diff; //diffuse lighting only
   //finalcolor.xyz = vec3(spec,spec,spec);
   finalcolor.w = 1.0;
   gl_FragColor = finalcolor;
   return;
   
   //show normal map w/o
   vec4 abss = vec4(abs(t.x),abs(t.y),abs(t.z),1);
   gl_FragColor = abss;//finalcolor;
   gl_FragColor.a = 1.0;
   //OUT.color=finalcolor;
   //return OUT;

}

float rayIntersectDepthMap( sampler2D reliefmap, vec2 dp, vec2 ds )
{
   const int linear_search_steps = 40;
   const int binary_search_steps = 5;
   float depth_step = 1.0 / linear_search_steps;
   float size = depth_step; // current size of search window
   float depth = 0.0; // current depth position (more like the current parametric value along ds, 0 is point A, 1 is point B)
   // best match found (starts with last position 1.0)
   float best_depth=1.0;
   //search from front to back for first point inside the object
   //   this for loop performs the linear march along vector A->B which finds the first linearly
   //   spaced point under the height field this result depth is used
   //   as the anchor in the binary search
   for( int i = 0; i < linear_search_steps - 1; i++ )
   {
      depth += size;
      vec4 t = texture2D( reliefmap, dp + ds * depth );
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
      if (depth >= t.w)
      {
         best_depth = depth;
         depth -= 2*size;
      }
      depth += size;
   }
   return best_depth;
}
