uniform float alpha;
uniform float epsilon;
uniform sampler2D texture;

void main( void )
{
	vec4 texel = texture2D( texture, gl_TexCoord[0].st );
	if( texel.a < (alpha + epsilon) && texel.a > (alpha - epsilon) )
	{
		discard;
	}
	else
	{
		gl_FragColor = texel * gl_Color;
	}
}