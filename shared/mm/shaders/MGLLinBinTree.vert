#version 400

//in vec3 myJunk;
in vec3 vObj; //vertex in object space (local model space)
//in vec3 vNrmObj;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projMat;

// layout (std140) uniform Matrices
// {
   // mat4 modelMat;
   // mat4 viewMat;
   // mat4 projMat;
// };

//uniform sampler2D texUnit0;
//uniform vec4 LightPosition;

out float height; // altitude of this vertex from WGS84 ellipsoid
out vec3 vEye;    //vertex in eye space (aka view space)
//out vec3 normal;

void main()
{
   height = vObj.z;// + myJunk.z;
   
   // Eye-coordinate position of vertex, needed in lighting calculations
   vec4 vEye4 = (viewMat * modelMat * vec4( vObj, 1 ));
   
   vEye = vEye4.xyz;
   //ecPosition = vec3(ModelViewMatrix * vec4(VertexPosition,1));
   //normal = normalize(NormalMatrix * VertexNormal);

   //textureCoord0 = VertexTextureCoordinate0;//worry about texture matrices later

   // Do fixed functionality vertex transform
   gl_Position = projMat * vEye4; //clip space
}