#version 130

uniform vec2 scaleIn;
uniform vec2 scale;
uniform vec4 hmdWarpParam;
uniform vec2 screenCenter;
uniform vec2 lensCenter;

void main()
{
   gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
   gl_Position = ftransform(); //WRONG! NEED UPDATED VIEW MATRIX
}
