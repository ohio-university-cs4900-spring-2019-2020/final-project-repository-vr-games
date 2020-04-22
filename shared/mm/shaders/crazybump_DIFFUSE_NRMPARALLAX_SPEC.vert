#version 130

in vec3 tangent;
out vec3 lightVecTS; //output in tangent space
out vec3 halfVecTS; //output in tangent space
out vec3 eyeVecTS; //output in tangent space

out vec3 vertPosES; //output vertex position in eye space
out vec3 vertPosTS; //output vertex pos in tangent space

out vec3 xdirTS;
out vec3 zdirTS;

out vec3 tangentVec;
out vec3 lightVecES;


void main()
{
   gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;

   // Building the matrix Eye Space -> Tangent Space
   vec3 n = normalize( gl_NormalMatrix * gl_Normal );
   vec3 t = normalize( gl_NormalMatrix * tangent );
   t *= -1.0;
   vec3 b = normalize( cross( n, t ) );

   vec4 vp = gl_ModelViewMatrix *  gl_Vertex;
   vec3 vertexPosition = vp.xyz;
   vec3 lightDir = vec3( normalize( gl_LightSource[0].position - vp ) );
   lightVecES = lightDir;
         
   // transform light and half angle vectors by tangent basis
   vec3 v;
   v.x = dot( lightDir, t );
   v.y = dot( lightDir, b );
   v.z = dot( lightDir, n );
   lightVecTS = normalize( v );

   xdirTS = t;
   zdirTS = n;
   
   v.x = dot( vertexPosition, t );
   v.y = dot( vertexPosition, b );
   v.z = dot( vertexPosition, n );
   eyeVecTS = normalize( v );

   vertexPosition = normalize( vertexPosition );

   /* Normalize the halfVector to pass it to the fragment shader */
   vec3 halfVector = normalize( (vertexPosition + lightDir) / 2.0 );
   v.x = dot( halfVector, t );
   v.y = dot( halfVector, b );
   v.z = dot( halfVector, n );
   halfVecTS = normalize( v );

   tangentVec = tangent;
     
   //gl_Position = ftransform();
   gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Vertex;
}
