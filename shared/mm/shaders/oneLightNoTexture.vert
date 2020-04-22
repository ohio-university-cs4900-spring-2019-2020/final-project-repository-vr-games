varying vec3 ecPosition;
varying vec3 normal;

void main (void)
{
    // Eye-coordinate position of vertex, needed in various calculations
    ecPosition = vec3(gl_ModelViewMatrix * gl_Vertex);
    normal = normalize(gl_NormalMatrix * gl_Normal);

    // Do fixed functionality vertex transform
    gl_Position = ftransform();
}