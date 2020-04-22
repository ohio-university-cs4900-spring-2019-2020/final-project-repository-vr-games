#version 120 
#extension GL_EXT_geometry_shader4 : enable

varying float isGeneratedInGeoShader;
   
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

   //increment variable
   int i;

   /////////////////////////////////////////////////////////////
   //This example has two parts
   //	step a) draw the primitive pushed down the pipeline
   //		 there are gl_Vertices # of vertices
   //		 put the vertex value into gl_Position
   //		 use EmitVertex => 'create' a new vertex
   // 		use EndPrimitive to signal that you are done creating a primitive!
   //	step b) create a new piece of geometry (I.E. WHY WE ARE USING A GEOMETRY SHADER!)
   //		I just do the same loop, but swizzle the x and y values
   //	result => the line we want to draw, and the same line, but along the other axis

   //Pass-thru!
   for( i = 0; i < gl_VerticesIn; i++ )
   {
      gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_PositionIn[i];
      //gl_Position = gl_PositionIn[i];
      //gl_FrontColor = vec4(1.0,0,0,1.0);
      isGeneratedInGeoShader = 0;
      gl_TexCoord[0] = gl_TexCoordIn[i][0];
      EmitVertex();
   }
   EndPrimitive();
   
   
   for( i = 0; i < gl_VerticesIn; i++ )
   {
      //translate the new geometry by a offset vector in coordinate frame of original model verts
      gl_Position = gl_PositionIn[i] + vec4( 0.0, 0.0, 20.0, 0 );
      gl_Position = gl_ProjectionMatrix * gl_ModelViewMatrix * gl_Position;
      //gl_FrontColor = vec4(0,1.0f,0,1.0);
      isGeneratedInGeoShader = 1;
      gl_TexCoord[0] = gl_TexCoordIn[i][0];
      EmitVertex();
   }
   EndPrimitive();
}
