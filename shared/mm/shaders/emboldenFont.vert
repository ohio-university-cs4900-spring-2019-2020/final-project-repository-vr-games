uniform vec3 color;
uniform float epsilon;
uniform sampler2D texture;

void main (void)
{
    gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
    gl_FrontColor = gl_Color;
    // Do fixed functionality vertex transform
    gl_Position = ftransform();
}