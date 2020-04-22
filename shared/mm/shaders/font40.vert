#version 430
//Written by Chad Mourning. Default Shader for fonts for a Core 3.2+.
//Same as default shader for objects, excepts skips the lighting stage

layout ( location = 0 ) in vec2 VertexPosition;
layout ( location = 1 ) in vec3 VertexNormal;
layout ( location = 2 ) in vec2 VertexTexCoord;
layout ( location = 3 ) in vec4 VertexColor;

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

out vec4 Color;
out vec2 TexCoord;

void main()
{
   Color = VertexColor;
   TexCoord = ( TexMat0 * vec4( VertexTexCoord, 0, 1 ) ).st;   
   TexCoord = ( vec4( VertexTexCoord, 0, 1 ) ).st;   
   
   //gl_Position is in clip space
   gl_Position = MVPMat * vec4( VertexPosition, 0.0, 1.0 );
}