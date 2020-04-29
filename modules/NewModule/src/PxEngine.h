#pragma once

#include "PxPhysicsAPI.h"
#include <map>


namespace Aftr {
	class WOActor;

	class PxEngine {
	public:
		PxEngine();
		~PxEngine();
		static PxEngine* New() { return new PxEngine(); };

		void simulate(std::map<WOActor*, int>);
		void addActor(void* pointer, physx::PxActor* actor);
		physx::PxPhysics* p;
		physx::PxScene* s;
		physx::PxCooking* c;

	private:
		physx::PxFoundation* f;
		physx::PxPvd* pvd;
		physx::PxU32 version = PX_PHYSICS_VERSION;
		physx::PxDefaultCpuDispatcher* dispatch;
		physx::PxMaterial* mater;
		physx::PxDefaultAllocator all;
		physx::PxDefaultErrorCallback err;
		physx::PxPvdSceneClient* client;
	};
}
