#include "WOActor.h"

#ifdef AFTR_CONFIG_USE_BOOST

using namespace Aftr;
using namespace physx;

WOActor* WOActor::New(physx::PxRigidActor* actor, const std::string& path, Vector scale, MESH_SHADING_TYPE shadingType) {
	WOActor* wo = new WOActor(actor);
	wo->onCreate(path, scale, shadingType);
	return wo;
}

WOActor::WOActor(physx::PxRigidActor* actor) : IFace(this), WO() {
	this->actor = actor;
}

void WOActor::onCreate(const std::string& path, Vector scale, MESH_SHADING_TYPE shadingType) {
	WO::onCreate(path, scale, shadingType);
}

#endif