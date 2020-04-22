#version 430
//Written by Scott Nykl. Skybox Shader for MGLSkybox using Core 3.2+.

uniform sampler2D TexUnit0;

in vec2 TexCoord;
layout (location = 0) out vec4 FragColor;

void main()
{
   FragColor = texture( TexUnit0, TexCoord );
}