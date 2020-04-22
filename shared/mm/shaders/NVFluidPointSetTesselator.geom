#version 120 
#extension GL_EXT_geometry_shader4 : enable

//Author: Soctt Nykl
//Billboard Geometry shader.
//Takes as input a set of verticies, each representing one point.
//This geometry shader takes that single point as the center of a
//billboarded quad that is textured from [0,1] procedurally.
//The billboards are oriented to always face towards the camera on
//all 3 axes.

uniform vec3 camPos;
uniform vec3 camNorm;
uniform vec3 modelPos;
uniform mat4 modelMat;
uniform mat4 viewMat;
uniform vec2 dimXY;

//Geometry language built-in outputs:
varying out vec4 gl_FrontColor;
varying out vec4 gl_BackColor;
varying out vec4 gl_FrontSecondaryColor;
varying out vec4 gl_BackSecondaryColor;
varying out vec4 gl_TexCoord[]; // at most gl_MaxTextureCoords
varying out float gl_FogFragCoord;

//special built-in output variables:
// gl_PointSize, gl_ClipVertex, gl_Layer, gl_Position, gl_PrimitiveID.

//Geometry language input varying variables:
// varying in vec4 gl_FrontColorIn[gl_VerticesIn];
// varying in vec4 gl_BackColorIn[gl_VerticesIn];
// varying in vec4 gl_FrontSecondaryColorIn[gl_VerticesIn];
// varying in vec4 gl_BackSecondaryColorIn[gl_VerticesIn];
// varying in vec4 gl_TexCoordIn[gl_VerticesIn][]; // at most will be// gl_MaxTextureCoords
// varying in float gl_FogFragCoordIn[gl_VerticesIn];
// varying in vec4 gl_PositionIn[gl_VerticesIn];
// varying in float gl_PointSizeIn[gl_VerticesIn];
// varying in vec4 gl_ClipVertexIn[gl_VerticesIn];

void main(void)
{
   int i;
   int j;
   vec4 pts[4];//[0],[1],[2],[3] //top-left, top-right, bottom-left, bottom-right vert locations
   vec4 tex[4];//[0],[1],[2],[3] //top-left, top-right, bottom-left, bottom-right tex coords
   vec3 xdir;
   vec3 ydir;
   vec3 zdir;
   mat4 rot;
   mat4 trans;
   mat4 transNeg;
   
   pts[0] = vec4(0, dimXY.x,0,1) + vec4(0,0, dimXY.y,0);
   pts[1] = vec4(0,-dimXY.x,0,1) + vec4(0,0, dimXY.y,0);
   pts[2] = vec4(0, dimXY.x,0,1) + vec4(0,0,-dimXY.y,0);
   pts[3] = vec4(0,-dimXY.x,0,1) + vec4(0,0,-dimXY.y,0);
   
   tex[0] = vec4(1,1,0,0);
   tex[1] = vec4(0,1,0,0);
   tex[2] = vec4(1,0,0,0);
   tex[3] = vec4(0,0,0,0);
   
   gl_TexCoord[0] = vec4(0,0,0,0);
   
   vec4 modelSpaceVertex = vec4(0,0,0,0.0);
   
   for( i = 0; i < gl_VerticesIn; i++ )
   {
      modelSpaceVertex = modelMat * gl_PositionIn[i];
      modelSpaceVertex += vec4( modelPos, 1.0 );
      
      xdir = camPos - vec3( modelSpaceVertex );
      xdir = normalize( xdir );
      ydir = cross( camNorm, xdir );
      ydir = normalize( ydir );
      zdir = cross( xdir, ydir );
      zdir = normalize( zdir );
      
      //rot[0] = vec4(xdir,0); rot[1] = vec4(ydir,0); rot[2] = vec4(zdir,0); rot[3] = vec4(0,0,0,1.0);
      rot[0][0] = xdir[0]; rot[1][0] = ydir[0]; rot[2][0]  = zdir[0]; rot[3][0] = 0;
      rot[0][1] = xdir[1]; rot[1][1] = ydir[1]; rot[2][1]  = zdir[1]; rot[3][1] = 0;
      rot[0][2] = xdir[2]; rot[1][2] = ydir[2]; rot[2][2]  = zdir[2]; rot[3][2] = 0;
      rot[0][3] = 0.0;     rot[1][3] = 0.0;     rot[2][3]  = 0.0;     rot[3][3] = 1.0;
      
      trans[0][0] = 1.0; trans[1][0] = 0.0; trans[2][0]  = 0.0; trans[3][0] = modelSpaceVertex.x;
      trans[0][1] = 0.0; trans[1][1] = 1.0; trans[2][1]  = 0.0; trans[3][1] = modelSpaceVertex.y;
      trans[0][2] = 0.0; trans[1][2] = 0.0; trans[2][2]  = 1.0; trans[3][2] = modelSpaceVertex.z;
      trans[0][3] = 0.0; trans[1][3] = 0.0; trans[2][3]  = 0.0; trans[3][3] = 1.0;
      
      for( j = 0; j < 4; ++j )
      {
         gl_Position = gl_ProjectionMatrix * viewMat * trans * rot * pts[j];
         gl_TexCoord[0] = tex[j];
         gl_FrontColor = gl_FrontColorIn[i];
         EmitVertex();
      }
      EndPrimitive();
   }
}
