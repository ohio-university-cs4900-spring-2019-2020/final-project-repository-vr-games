uniform sampler2D diffuseTexture;
uniform sampler2D normalTexture;
uniform sampler2D specularTexture;
	
// New bumpmapping
varying vec3 lightVecTS; //tangent space
varying vec3 halfVecTS; //tangent space
varying vec3 eyeVecTS; //tangent space

void main()
{
   //http://ciardhubh.de/node/18
   // Base colour from diffuse texture
   vec4 baseColour = texture2D(diffuseTexture, gl_TexCoord[0].st);

   // Uncompress normal from normal map texture
   vec3 normal = normalize( texture2D( normalTexture, gl_TexCoord[0].st).rgb * 2.0 - 1.0);
   // normal.z = -normal.z; //invert 

   // Ambient
   vec4 ambient = gl_LightSource[0].ambient * baseColour;

   // Diffuse
   // Normalize interpolated direction to light
   vec3 lightVecTS = normalize( lightVecTS );
   // Full strength if normal points directly at light
   float diffuseIntensity = max(dot(lightVecTS, normal), 0.0);
   vec4 diffuse = gl_LightSource[0].diffuse * baseColour * diffuseIntensity;

   // Specular
   float shininess = 8.0;
   vec4 specular = vec4(0.0, 0.0, 0.0, 0.0);
   // Only calculate specular light if light reaches the fragment.
   if (diffuseIntensity > 0.0)
   {
      // Colour of specular reflection
      vec4 specularColour = texture2D(specularTexture, gl_TexCoord[0].xy); 
      // Specular strength, Blinn–Phong shading model
      float specularModifier = max(dot(normal, normalize(halfVecTS)), 0.0); 
      specular = gl_LightSource[0].specular * specularColour * pow(specularModifier, shininess);
   }

   // Sum of all lights
   gl_FragColor = clamp(ambient + diffuse + specular, 0.0, 1.0);
   //float depthMap = texture2D(normalTexture, gl_TexCoord[0].xy).a;
   //gl_FragColor = vec4(depthMap);

   // Use the diffuse texture's alpha value.
   gl_FragColor.a = baseColour.a;


   ////// lookup normal from normal map, move from [0,1] to  [-1, 1] range, normalize
   ////vec3 normal = 2.0 * texture2D(normalTexture, gl_TexCoord[0].st).rgb - 1.0;
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
   ////diffuseMaterial = texture2D(diffuseTexture, gl_TexCoord[0].st);
   //////diffuseMaterial = vec4(1,1,1,1);
   ////diffuseLight = gl_LightSource[0].diffuse;

   ////// In doom3, specular value comes from a texture
   //////Specular = specularMaterial * specularLight * speculatCoef
   //////speculatCoef = pow (max (dot (halfVecTS, normal), 0.0), shininess) 

   ////specularMaterial = vec4(.20);
   ////specularLight = gl_LightSource[0].specular;
   ////shininess = normalize( 2.0 * texture2D(specularTexture, gl_TexCoord[0].st) -1 );
   ////shininessCoef = pow (max (dot (halfVecTS, normal), 0.0), shininess);
   ////gl_FragColor =	diffuseMaterial * diffuseLight * lamberFactor ;
   ////gl_FragColor += specularMaterial * specularLight * 1.0;			

   //////}

   //////if(lamberFactor > .5)
   //////gl_FragColor = vec4(lightVecTS,1);
   //////gl_FragColor = vec4(lightVecTS,1);

   ////gl_FragColor += ambientLight;

}
