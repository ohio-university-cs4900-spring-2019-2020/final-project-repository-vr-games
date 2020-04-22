#version 130
in vec3 quadric; //per vertex attribute
in vec3 uvscale; //per vertex attribute
in vec3 tangent; //per vertex attribute

uniform vec3 lightPosWS; //world space light position
uniform vec3 camPosWS; ////world space camera position
uniform vec3 camNormWS; //world space camera normal
uniform vec3 modelPosWS; //world space model center point

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
uniform float depth;
uniform float discardDepthBelow;
uniform float scaleFactorOfModel;

out vec4 lightPosVS; //view space light position //may need to be transformed ONLY thru the VIEW matrix if model matrix is not identity
out vec3 lightPosTS; //tangent space light position

out vec4 vPosVS; //view space vertex position
out vec3 vNormVS; //view space vertex normal

out vec3 xdirTS;
out vec3 ydirTS;
out vec3 zdirTS;

//Fabio's fx implementation
out vec2 VSuv;
out vec4 VShpos;
out vec3 VSvpos;
out vec3 VSview;
out vec2 VScurvature;
out vec3 VSlight;
out vec3 VSscale;

void main()
{

   gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;

   // gl_NormalMatrix is transpose of inverse of gl_ModelViewMatrix
   // Building the matrix view Space -> Tangent Space
   vec3 n = normalize( gl_NormalMatrix * gl_Normal );
   vec3 t = normalize( gl_NormalMatrix * tangent );
   vec3 b = normalize( cross( n, t ) );
   
   xdirTS = t;
   ydirTS = b;
   zdirTS = n;

   vec4 vPosWS = ( (vec4( model * gl_Vertex )) + vec4( modelPosWS, 0 ) );
   vPosVS = view * vPosWS;   
      
   lightPosVS = view * vec4(lightPosWS, 1.0) ; //light's model matrix is always identity
   
   vNormVS = n; //n is in view space since it was mutliplied by gl_NormalMatrix

   gl_Position = proj * view * vPosWS;

   
    vec3 lightVecWS = vec3( vec3(vPosWS) - lightPosWS );
    vec3 lightVecVS = vec3( view * vec4( lightVecWS, 1.0 ) );
         
   vec3 v;
   //'v' is 'lightVecVS' converted into Tangent Space
   //these dot products are equivalent to transforming v through the INVERSE of the TBN matrix
   v.x = dot( lightVecVS, t );
   v.y = dot( lightVecVS, b );
   v.z = dot( lightVecVS, n );
   lightPosTS = v;
   
   
   //Populate VShpos - clip space vertex position in homogenius coords
   VShpos = proj * vPosVS; //a view-space coord transformed via projection matrix yeilds clip space
   VSuv = gl_TexCoord[0].xy;
   VSvpos = vPosVS.xyz;
   
   //create 3x3 tangent space matrix
   mat3x3 tangentSpaceMat = mat3x3( t, b, n );
   mat3x3 tangentSpaceInv = transpose( tangentSpaceMat );
   VSview = tangentSpaceInv * VSvpos;
   VSlight = tangentSpaceInv * ( lightPosVS.xyz - VSvpos );
   VScurvature.xy = quadric.xy;// + 0.003; //works great for a sphere!
   
   //float scaleX = 1.0;//scaleFactorOfModel;
   //float scaleY = 1.0;//scaleFactorOfModel;
   //uvscale is the UV Scale computed about the tile corresponding to the triangles about this vertex
   VSscale = vec3( uvscale.x, uvscale.y, 0.25 ); //depth is depth_fact (depth factor / scalar) value of 2.05 is good for curved objects like tourus
}
