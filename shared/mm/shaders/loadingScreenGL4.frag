#version 430
//Written by Scott Nykl. Displays an orthographic rectangle where each vertex is a different color
//and the color is linearly interpolated across the fragments.

in vec4 Color;
layout (location = 0) out vec4 FragColor;

void main()
{
   FragColor = vec4( Color );
}