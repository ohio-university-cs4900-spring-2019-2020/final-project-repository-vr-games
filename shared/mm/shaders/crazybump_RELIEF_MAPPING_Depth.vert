#version 130
//in vec3 tangent;

uniform vec3 lightPosWS; //world space light position
uniform vec3 camPosWS; ////world space camera position
uniform vec3 camNormWS; //world space camera normal
uniform vec3 modelPosWS; //world space model center point

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
uniform float depth;
uniform float discardDepthBelow;

out vec4 lightPosVS; //view space light position //may need to be transformed ONLY thru the VIEW matrix if model matrix is not identity
//out vec3 lightPosTS; //tangent space light position

out vec4 vPosVS; //view space vertex position
out vec3 vNormVS; //view space vertex normal

//out vec3 xdirTS;
//out vec3 ydirTS;
//out vec3 zdirTS;

out vec4 modelViewProjZ; // 3rd column from ModelViewProjection Matrix

void main()
{

   gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;

   // gl_NormalMatrix is transpose of inverse of gl_ModelViewMatrix
   // Building the matrix view Space -> Tangent Space
   vec3 n = normalize( gl_NormalMatrix * gl_Normal );
   //vec3 t = normalize( gl_NormalMatrix * tangent ); 
   //vec3 b = normalize( cross( n, t ) );
   
   //xdirTS = t;
   //ydirTS = b;
   //zdirTS = n;

   vec4 vPosWS = ( (vec4( model * gl_Vertex )) + vec4( modelPosWS, 0 ) );
   vPosVS = view * vPosWS;
      
   lightPosVS = view * vec4(lightPosWS, 1.0) ; //light's model matrix is always identity
   
   vNormVS = n; //n is in view space since it was mutliplied by gl_NormalMatrix

   gl_Position = proj * view * vPosWS;
   //gl_Position = ftransform();

   
    vec3 lightVecWS = vec3( vec3(vPosWS) - lightPosWS );
    vec3 lightVecVS = vec3( view * vec4( lightVecWS, 1.0 ) );
         
   //vec3 v;
   //'v' is 'lightVecVS' converted into Tangent Space
   //these dot products are equivalent to transforming v through the INVERSE of the TBN matrix
   //v.x = dot( lightVecVS, t );
   //v.y = dot( lightVecVS, b );
   //v.z = dot( lightVecVS, n );
   //lightPosTS = v;

   
   //gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;
   
   // //get 3rd column of MVP to compute proper depth per fragment in relief mapping
   // //fragment shader
    mat4 mvp = gl_ProjectionMatrix;// * gl_ModelViewMatrix;
    modelViewProjZ = vec4( mvp[2][0], mvp[2][1], mvp[2][2], mvp[2][3] );
}
