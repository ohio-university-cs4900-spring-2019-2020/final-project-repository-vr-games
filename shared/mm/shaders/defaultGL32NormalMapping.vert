#version 430
//Written by Scott Nykl. Default Shader for a Core 3.2+.
//Performs per fragment ambient/diffuse/specular shading with material
//properties, textures, and lights.

layout ( location = 0 ) in vec3 VertexPosition;
layout ( location = 1 ) in vec3 VertexNormal;
layout ( location = 2 ) in vec2 VertexTexCoord;
layout ( location = 3 ) in vec4 VertexColor;
layout ( location = 4 ) in vec3 VertexTangent;

uniform mat4 ModelMat;
uniform mat4 NormalMat;
uniform mat4 TexMat0; //Texture Matrix for TexUnit0
uniform mat4 MVPMat;

uniform sampler2D TexUnit0;


layout ( binding = 0, std140 ) uniform CameraTransforms
{
   mat4 View;
   mat4 Projection;
   mat4 Shadow; //for shadow mapping
   // A Value of 0 = Render w/ No shadows
   // A Value of 1 = Generate depth map only
   // A Value of 2 = Render w/ Shadow mapping
   int ShadowMapShadingState;
} Cam;

layout ( binding = 1, std140 ) uniform LightInfo
{
   vec4 PosEye[8]; // Light's Eye space position (same as view space)
   vec4 Irgba[8]; // Light's Intensity for red, green, blue reflectivity components
   vec4 GlobalAmbient;
   int NumLights; // Number of lights in the LightInfo array   
} Lights;

out vec4 Color;
out vec3 VertexES; //eye space Vertex
out vec3 NormalES; //eye space Vertex Normal Vector
out vec2 TexCoord;
out vec4 ShadowCoord;
out flat int ShadowMapShadingState; //Set to non-zero value when generating a shadow map (only filling the depth buffer)

//Normal mapping specific outputs
//These are linearly interpolated across the face at each fragment.
out vec3 lightDirTS; //normalized direction vertex -> Light in tangent space
out vec3 viewDirTS; //normalized direction vertx -> eyeball (camera) in tangent space

void main()
{
   Color = VertexColor;
   NormalES = ( Cam.View * ModelMat * vec4( VertexNormal, 0 ) ).xyz;
   vec3 TangentES = ( Cam.View * ModelMat * vec4( VertexTangent, 0 ) ).xyz;
   VertexES = ( Cam.View * ModelMat * vec4( VertexPosition, 1 ) ).xyz;
   TexCoord = ( TexMat0 * vec4( VertexTexCoord, 0, 1 ) ).st;   
   
   ShadowCoord =  Cam.Shadow *  ModelMat * vec4( VertexPosition, 1 );
   ShadowMapShadingState = Cam.ShadowMapShadingState; // pass to fragment shader
   
   //Use the per-vertex Tangent Vector and Normal to create a TBN matrix that 
   //transfroms a Vector from Eye Space to Tangent Space. We will use this to transform
   //VertexES -> VertexTS. VertexTS is the vector in tangent space looking from the camera to the vertex.
   vec3 n = normalize( NormalES );
	vec3 t = normalize( TangentES );
	vec3 b = cross( n, t );
   
   
   //Matrix for transformation to tangent space
   mat3 toTangentSpace = mat3(
      t.x, b.x, n.x,   //first column
      t.y, b.y, n.y,   //second column
      t.z, b.z, n.z ); //third column
   //Get position in eye space
   
   //Transform light dir and view dir to tangent space
   lightDirTS = normalize( toTangentSpace * ( Lights.PosEye[0].xyz - VertexES ) );
   viewDirTS = toTangentSpace * normalize( -VertexES );  
   
   //gl_Position is in clip space
   gl_Position = MVPMat * vec4( VertexPosition, 1.0 );
   
   
   
   // //We need to compute the light direction to compute the blinn half-vector
   // vec3 v;
   // vec3 lightDirES = normalize( Lights.PosEye[0].xyz - VertexES );
   // v.x = dot( lightDirES, t );
	// v.y = dot( lightDirES, b );
	// v.z = dot( lightDirES, n );
	// lightVecTS = normalize( v );
   
   // //Transform the vector from camera to vertex. Transform it from Eye Space to Tangent Space.
   // //The dot products below are equivalent to transforming VertexES through the INVERSE of the [t|b|n] matrix.
   // v.x = dot( VertexES, t );
	// v.y = dot( VertexES, b );
	// v.z = dot( VertexES, n );
	// eyeVecTS = normalize( v ); //Vec from camera to vertex in Tangent Space
   
   // //When we compute the half-vector, the vector from the camera to the vertex needs to
   // //be normalized first.
   // vec3 halfVecTS = normalize( eyeVecTS + lightVecTS ) / 2.0;
   
}