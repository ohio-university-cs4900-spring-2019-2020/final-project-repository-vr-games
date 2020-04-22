varying vec3 ecPosition;
varying vec3 normal;

uniform sampler2D tex;

vec4 Ambient;
vec4 Diffuse;
vec4 Specular;

void pointLight(in int i, in vec3 normal, in vec3 eye, in vec3 ecPosition3)
{
   float nDotVP;       // normal . light direction
   float nDotHV;       // normal . light half vector
   float pf;           // power factor
   float attenuation;  // computed attenuation factor
   float d;            // distance from surface to light source
   vec3  VP;           // direction from surface to light position
   vec3  halfVector;   // direction of maximum highlights

   // Compute vector from surface to light position
   VP = gl_LightSource[i].position.xyz - ecPosition3;

   // Compute distance between surface and light position
   d = length(VP);

   // Normalize the vector from surface to light position
   VP = normalize(VP);

   // Compute attenuation
   attenuation = 1.0 / (gl_LightSource[i].constantAttenuation +
       gl_LightSource[i].linearAttenuation * d +
       gl_LightSource[i].quadraticAttenuation * d * d);

   nDotVP = max(0.0, dot(normal, VP));

   vec3 R = normalize(-reflect(VP, normal));
   pf = pow(max(dot(R,eye),0.0),.3*gl_FrontMaterial.shininess);

   attenuation = 1.0;
   Ambient  += gl_LightSource[i].ambient * attenuation;
   Diffuse  += gl_LightSource[i].diffuse * nDotVP * attenuation;
   Specular += gl_FrontLightProduct[i].specular * pf * attenuation;
}

void main(void)
{
   vec4 color;
   vec3 eye;

   eye = vec3 (0,0,1);

   Ambient = vec4(0.0);
   Diffuse = vec4(0.0);
   Specular = vec4(0.0);

   pointLight(0, normal, eye, ecPosition);

   color = gl_FrontLightModelProduct.sceneColor +
     Ambient * gl_FrontMaterial.ambient +
     Diffuse * gl_FrontMaterial.diffuse;
   
   vec4 texel = texture2D(tex,gl_TexCoord[0].st);
   color *= texel;
   
   color += Specular;
   color = clamp( color, 0.0, 1.0);
   
   gl_FragColor = color;
}