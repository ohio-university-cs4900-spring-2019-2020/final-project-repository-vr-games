#pragma once

#include "WO.h"
#include "PxEngine.h"
#include "PxPhysicsAPI.h"

#ifdef AFTR_CONFIG_USE_BOOST

namespace Aftr {
	class WOActor : public WO {
	public:
		physx::PxRigidActor* actor;

		static WOActor* New(
			physx::PxRigidActor* actor = nullptr,
			const std::string& path = ManagerEnvironmentConfiguration::getSMM() + "models/box/track.blend",
			Vector scale = Vector(1, 1, 1),
			MESH_SHADING_TYPE shadingType = MESH_SHADING_TYPE::mstAUTO
		);
		virtual void onCreate(const std::string& path, Vector scale = Vector(1, 1, 1), MESH_SHADING_TYPE shadingType = MESH_SHADING_TYPE::mstAUTO);

		void setDisplayMatrix(Mat4 matrix) { WO::getModel()->setDisplayMatrix(matrix); }

	protected:
		WOActor(physx::PxRigidActor* actor);
	};
}

#endif