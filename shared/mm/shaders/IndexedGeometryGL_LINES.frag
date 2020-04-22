#version 430
//Written by Scott Nykl. Default Shader for Core 3.2+ when rendering GL_LINES with a per vertex color.

in vec4 Color;
layout (location = 0) out vec4 FragColor;

void main()
{
   FragColor = Color;
}