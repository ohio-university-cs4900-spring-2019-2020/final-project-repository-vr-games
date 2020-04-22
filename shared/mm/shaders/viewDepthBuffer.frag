uniform sampler2D texture;

void main( void )
{
	vec4 texel = texture2D( texture, gl_TexCoord[0].st );
	
	//gl_FragColor = texel * gl_Color;
   
   //float frag = gl_FragCoord.z * gl_FragCoord.w;
   //float frag = 1.0 / gl_FragCoord.w;
   //frag = 0.5 * abs(frag);
   
   //gl_FragColor = vec4( frag,0,0,1.0);
   
   
   
   
   
   float ndcDepth = (2.0 * gl_FragCoord.z - (gl_DepthRange.far - gl_DepthRange.near)) / (gl_DepthRange.far - gl_DepthRange.near);
   float clipDepth = ndcDepth / gl_FragCoord.w;
   gl_FragColor = vec4(0,(clipDepth * 0.5) + 0.5,0,1); 
	
}