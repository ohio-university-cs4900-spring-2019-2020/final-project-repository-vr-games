uniform sampler2D texture;

void main( void )
{
   if( gl_TexCoord[0].s < 0.0 || gl_TexCoord[0].t < 0.0 ||
       gl_TexCoord[0].s > 1.0 || gl_TexCoord[0].t > 1.0 )
		discard;
      
   float epsilon = 0.05;
   vec3 color = vec3(0.0,0.0,0.0);
      
   vec4 texel = texture2D( texture, gl_TexCoord[0].st );
	if( texel.x < color.x + epsilon && texel.x > color.x - epsilon &&
	    texel.y < color.y + epsilon && texel.y > color.y - epsilon &&
		 texel.z < color.z + epsilon && texel.z > color.z - epsilon )
	{
		discard;
	}

	gl_FragColor = texel * gl_Color;
}