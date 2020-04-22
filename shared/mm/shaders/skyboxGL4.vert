#version 430
//Written by Scott Nykl. Skybox Shader for MGLSkybox using Core 3.2+.

layout ( location = 0 ) in vec3 VertexPosition;
layout ( location = 1 ) in vec3 VertexNormal;
layout ( location = 2 ) in vec2 VertexTexCoord;
layout ( location = 3 ) in vec4 VertexColor;

uniform mat4 ModelMat;
uniform sampler2D TexUnit0;

layout ( binding = 0, std140 ) uniform CameraTransforms
{
   mat4 View;
   mat4 Projection;
} Camera;

out vec2 TexCoord;

void main()
{
   TexCoord = VertexTexCoord;
   gl_Position = Camera.Projection * Camera.View * ModelMat * vec4( VertexPosition, 1.0 );
}