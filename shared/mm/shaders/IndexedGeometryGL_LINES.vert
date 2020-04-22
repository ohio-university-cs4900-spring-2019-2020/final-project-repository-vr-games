#version 430
//Written by Scott Nykl. Default Shader for Core 3.2+ when rendering GL_LINES with a per vertex color.

layout (location = 0) in vec3 VertexPosition;
//layout (location = 1) in vec3 VertexNormal;
//layout (location = 2) in vec2 VertexTexCoord;
layout (location = 3) in vec4 VertexColor;

//uniform sampler2D TexUnit0;
uniform mat4 MVPMatrix;

layout ( binding = 0, std140 ) uniform CameraTransforms
{
   mat4 View;
   mat4 Projection;
} Cam;

//out vec2 TexCoord;
out vec4 Color;

void main()
{
   Color = VertexColor;
   gl_Position = MVPMatrix * vec4( VertexPosition, 1.0 );
}