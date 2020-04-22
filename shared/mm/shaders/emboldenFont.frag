uniform float modifier;
uniform sampler2D texture;
uniform bool useFragDepth;
uniform float fragDepth;

void main( void )
{
	vec4 texel = texture2D( texture, gl_TexCoord[0].st );
	vec4 c = texel * gl_Color;
	if( c.a > 0.0 )//|| c.b < 1.0 || c.g < 1.0)
	{
		gl_FragColor = vec4(c.r,c.g,c.b,c.a*modifier);
      if( useFragDepth )
         gl_FragDepth = fragDepth;
	}
	else
	{
		discard;
	}
}