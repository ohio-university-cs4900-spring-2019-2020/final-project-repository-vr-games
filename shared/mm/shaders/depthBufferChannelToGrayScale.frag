#version 130
//out uvec4 FragColor;
uniform sampler2D depthMap;

//out vec4 FragColor;

void main()
{
   vec2 texCoord = gl_TexCoord[0].st;
   texCoord.x = 1.0 - texCoord.x;
   //texCoord.y = 1.0 - texCoord.y;
   float depth = texture2D( depthMap, texCoord.xy ).r;
   //float depth = texture2D( depthMap, gl_TexCoord[0].st ).r;
   //gl_FragColor = vec4( color.g, color.g, color.r, 1.0 );
   gl_FragColor = vec4( depth, depth, depth, 1.0 );
}
