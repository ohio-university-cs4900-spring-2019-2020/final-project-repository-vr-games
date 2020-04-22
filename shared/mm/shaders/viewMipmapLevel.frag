#extension GL_EXT_gpu_shader4 : enable
uniform sampler2D texture;
uniform float lodLevel;
uniform vec2 texSize;

void main( void )
{
	gl_FragData[0].xyzw = texture2D( texture, gl_TexCoord[0].st );
   ivec2 oCoord = ivec2(gl_TexCoord[0].st * ivec2(texSize) );
   gl_FragData[0].xyzw = texelFetch2D( texture, oCoord.xy, (int)lodLevel );	
}