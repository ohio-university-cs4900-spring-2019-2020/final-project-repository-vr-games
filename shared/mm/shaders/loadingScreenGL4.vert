#version 430
//Written by Scott Nykl. Displays an orthographic rectangle where each vertex is a different color
//and the color is linearly interpolated across the fragments.

layout ( location = 0 ) in vec3 VertexPosition;
//layout ( location = 1 ) in vec3 VertexNormal;
//layout ( location = 2 ) in vec2 VertexTexCoord;
layout ( location = 3 ) in vec4 VertexColor;

uniform mat4 MVPMatrix;

out vec4 Color;

void main()
{
   Color = VertexColor;
   gl_Position = MVPMatrix * vec4( VertexPosition, 1.0 );
}