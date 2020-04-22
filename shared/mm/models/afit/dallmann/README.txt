***IMU center refers to the center of data collection (3.28 cm +Z from the bottom of the physical IMU), not the geometric center***

wagon_receiver.blend and wagon_receiver.3ds are the Blender and 3ds files respectively for the wagon_receiver model. The model's properties are accurate to the real-world wagon receiver's properties.

wagon_receiver_centered_imu.blend is the Blender file with the model centered on the IMU's center of data collection. The same properties that apply to the wagon_receiver model also apply to this model

wagon_receiver_with_cuts.blend places evenly distributed slices on the model to create evenly distributed vertices for creating a 
reference model

wagon_receiver_just_verts.blend has the vertices that are occluded by the front of the model removed, so a reference model can be exported. When exporting the .obj model, use Y-Forward and Z-Up from the export menu to correctly export the vertices.

wagon_receiver_just_verts.obj is the reference model

wagon_tanker.blend and wagon_tanker.3ds are the Blender and 3ds files respectively for the wagon_tanker model. Some dimensions on the wagon_tanker model are approximate, because the wagon_tanker model does not need to go through the stereo_vision pipeline. However, the proper level arms (IMU to cameras, IMU to center of model, etc.) must still be set in the virtual world for correct results

wagon_tanker_centered_imu.blend is the Blender file  The same properties that apply to the wagon_tanker model also apply to this model


TEXTURES:
rec.jpg is the texture file for the wagon_receiver
tkr.jpg is the texture file for the wagon_tanker

WAGON RECEIVER ANCHOR POINT:
In blender, wagon_receiver model's IMU center vector offset is (-0.089 m, -0.005 m, 0.8798 m) relative to (0,0,0) on the model. Therefore, this offset can be used in the virtual world to get the position of the IMU center relative to (0,0,0) on the model
 
WAGON TANKER ANCHOR POINTS:
In blender, wagon_tanker model's IMU center vector offset is (-0.19 m, 0.0 m, -0.4222 m) relative to (0,0,0) on the model. Therefore, this offset can be used in the virtual world to get the position of the IMU center relative to (0,0,0) on the model

Lever Arm from the IMU center to the IR Anchor Point is: (-0.2455 m, -0.045 m, 0.1723 m)
Lever Arm from the model center to the IR Anchor Point is: (-0.4355 m, -0.045 m, -0.2499 m)

Lever Arm from the IMU center to the EO Anchor Point is:  (-0.2455 m, 0.0525 m, 0.1619 m)
Lever Arm from the model center to the EO Anchor Point is: (-0.4355 m, 0.0525 m, -0.2603 m) 