#version 430
//Written by Scott Nykl. Default Shader for a Core 3.2+ BoundingBox.

layout ( location = 0 ) in vec3 VertexPosition;
//layout ( location = 1 ) in vec3 VertexNormal;
//layout ( location = 2 ) in vec2 VertexTexCoord;
//layout ( location = 3 ) in vec3 VertexColor;

//uniform mat4 ModelMat;
//uniform mat4 NormalMat;
//uniform mat4 TexMat0; //Texture Matrix for TexUnit0
uniform mat4 MVPMat;

//uniform sampler2D TexUnit0;


//layout ( binding = 0, std140 ) uniform CameraTransforms
//{
//   mat4 View;
//   mat4 Projection;
//} Cam;

//out vec4 Color;
//out vec3 VertexES; //eye space Vertex
//out vec3 NormalES; //eye space Vertex Normal Vector
//out vec2 TexCoord;

void main()
{
   //Color = vec4( VertexColor, 1.0 );
   //NormalES = ( NormalMat * vec4( VertexNormal, 0 ) ).xyz;
   //VertexES = ( Cam.View * ModelMat * vec4( VertexPosition, 1 ) ).xyz;
   //TexCoord = ( TexMat0 * vec4( VertexTexCoord, 0, 1 ) ).st;
   
   //gl_Position is in clip space
   gl_Position = MVPMat * vec4( VertexPosition, 1.0 );
}