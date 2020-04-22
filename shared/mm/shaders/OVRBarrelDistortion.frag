#version 130

uniform sampler2D tex;

uniform vec2 scaleIn;
uniform vec2 scale;
uniform vec4 hmdWarpParam;
uniform vec2 screenCenter;
uniform vec2 lensCenter;


vec2 HmdWarp( vec2 in01 )
{
   vec2 theta = (in01 - lensCenter) * scaleIn; // scales to [-1, 1]
   float  rSq = theta.x * theta.x + theta.y * theta.y;
   vec2 theta1 = theta * (hmdWarpParam.x + hmdWarpParam.y * rSq +
                 hmdWarpParam.z * rSq * rSq + hmdWarpParam.w * rSq * rSq * rSq );
   return lensCenter + scale * theta1;
}

void main()
{
   vec2 tc = HmdWarp( gl_TexCoord[0].st ); //vec2 tc = HmdWarp( oTexCoord );   
   
   vec2 lowerVec = screenCenter - vec2( 0.25, 0.5 );
   vec2 upperVec = screenCenter + vec2( 0.25, 0.5 );
   if( tc.x < lowerVec.x || tc.y < lowerVec.y || tc.x > upperVec.x || tc.y > upperVec.y )
      gl_FragColor = vec4(0,0,1,1);
   else
      gl_FragColor = texture2D( tex, tc );
};
