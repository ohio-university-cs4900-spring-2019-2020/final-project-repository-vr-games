uniform vec3 color;
uniform float epsilon;
uniform sampler2D texture;

void main( void )
{
	vec4 texel = texture2D( texture, gl_TexCoord[0].st );
	if( texel.x < color.x + epsilon && texel.x > color.x - epsilon &&
	    texel.y < color.y + epsilon && texel.y > color.y - epsilon &&
		 texel.z < color.z + epsilon && texel.z > color.z - epsilon )
	{
		discard;
	}
	else
	{
		gl_FragColor = texel * gl_Color;
      gl_FragColor.a = 1.0;
	}
}