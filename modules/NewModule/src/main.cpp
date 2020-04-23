//**********************************************************************************
// STEAMiE's Entry Point.
//**********************************************************************************

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include "GLViewNewModule.h" //GLView subclass instantiated to drive this simulation
#include "NetMsgAntGsSetback.h"
#include "irrKlang-64bit-1.6.0/irrKlang-64bit-1.6.0/include/irrKlang.h"

using namespace irrklang;

#pragma comment(lib, "irrKlang.lib") // link with irrKlang.dll

/// Saves the in passed params argc and argv in a vector of strings.
std::vector< std::string > saveInputParams( int argc, char** argv );

/**
   This creates a GLView subclass instance and begins the GLView's main loop.
   Each iteration of this loop occurs when a reset request is received. A reset
   request causes the entire GLView to be destroyed (since its exits scope) and
   begin again (simStatus == -1). This loop exits when a request to exit the 
   application is received (simStatus == 0 ).
*/
int main( int argc, char* argv[] )
{
	// start the sound engine with default parameters
	ISoundEngine* engine = createIrrKlangDevice();

	// code to play some 2D sound, looped
    //engine->play2D("../../media/getout.ogg", true);

	// Attempted 3d sound code
	
	ISound* music = engine->play3D("../../media/getout.ogg",
		vec3df(0, 0, 0), true, false, true);

	if (music){
		music->setMinDistance(1.0f);
		music->setMaxDistance(3.0f);
		music->setPosition(vec3df(0,0,0) );
	}
		

	double volDownInc = 0.2; //ow much to decrease the volume by
	float posOnCircle = 1;
	float radius = 3;
	//const float radius = 0.1;

   std::vector< std::string > args = saveInputParams( argc, argv ); ///< Command line arguments passed via argc and argv, reserved to size of argc
   int simStatus = 0;

   do
   {
	   // more attempted 3d audio code
	   posOnCircle += 0.04f;
	   vec3df pos3d( radius * cosf(posOnCircle), radius * sinf(posOnCircle * 0.5f), 0);

	   engine->setListenerPosition(vec3df(0, 0, 0), vec3df(0, 0, 1));



      std::unique_ptr< Aftr::GLViewNewModule > glView( Aftr::GLViewNewModule::New( args ) );
      simStatus = glView->startWorldSimulationLoop(); // Runs until simulation exits or requests a restart (values 0 or -1, respectively)
   
   }
   while( simStatus != 0 );

   std::cout << "Exited AfterBurner Engine Normally..." << std::endl;

   //for 3d audio
   if (music)
	   music->drop(); // release music stream. 
   engine->drop(); // delete engine

   return 0;
}

std::vector< std::string > saveInputParams( int argc, char** argv )
{
   std::vector< std::string > args( argc );
   for( int i = 0; i < argc; ++i )
   {
      std::string arg( argv[i] );
      args[i] = arg;
   }

   return args;
}
