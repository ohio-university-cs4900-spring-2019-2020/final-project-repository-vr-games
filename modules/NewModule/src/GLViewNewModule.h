#pragma once

#include "GLView.h"
#include "PxEngine.h"

namespace Aftr
{
   class Camera;

/**
   \class GLViewNewModule
   \author Scott Nykl 
   \brief A child of an abstract GLView. This class is the top-most manager of the module.

   Read \see GLView for important constructor and init information.

   \see GLView

    \{
*/

class GLViewNewModule : public GLView
{
public:
   static GLViewNewModule* New( const std::vector< std::string >& outArgs );
   virtual ~GLViewNewModule();
   virtual void updateWorld(); ///< Called once per frame
   virtual void loadMap(); ///< Called once at startup to build this module's scene
   virtual void createNewModuleWayPoints();
   virtual void onResizeWindow( GLsizei width, GLsizei height );
   virtual void onMouseDown( const SDL_MouseButtonEvent& e );
   virtual void onMouseUp( const SDL_MouseButtonEvent& e );
   virtual void onMouseMove( const SDL_MouseMotionEvent& e );
   virtual void onKeyDown( const SDL_KeyboardEvent& key );
   virtual void onKeyUp( const SDL_KeyboardEvent& key );
   virtual void physXInit();

protected:
	std::string msg = " ";
	float carX = 50.0;
	float carY = 50.0;
	float carZ = 5.0;
	bool moveUp, moveDown, moveLeft, moveRight;
	Vector CarLookDir; //to store the look diretion of the car
	float carAngle;
	int carDir = 0; // 0=face forward, 1=face left, 2=face right, 3=face back
   GLViewNewModule( const std::vector< std::string >& args );
   virtual void onCreate();
   void createTriangleMesh(WO* wo);
   PxEngine* physics;
   float* vertexListCopy;
   unsigned int* indicesCopy;
   
   /*
   physx::PxDefaultAllocator a;
   physx::PxFoundation* f;
   physx::PxPhysics* p;
   physx::PxScene* s;
   physx::PxPvd* gpvd;
   physx::PxDefaultCpuDispatcher* d;
   */
};

}  //namespace Aftr
