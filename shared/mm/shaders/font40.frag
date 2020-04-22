#version 430
//Written by Chad Mourning. Default Shader for fonts for a Core 3.2+.
//Same as default objects, sans lighting

layout ( binding = 0 ) uniform sampler2D TexUnit0;

in vec4 Color;
in vec2 TexCoord;

layout ( location = 0 ) out vec4 FragColor;

void main()
{
   vec4 color = texture( TexUnit0, TexCoord );
	if( color.a < .5 )	  
	  discard;
   FragColor = color * Color;
}