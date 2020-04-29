#include "PxEngine.h"
#include <iostream>
#include "WOActor.h"


using namespace Aftr;
using namespace physx;

PxEngine::PxEngine()
{
	this->f = PxCreateFoundation(version, all, err);
	this->pvd = PxCreatePvd(*f);
	this->pvd->connect(*PxDefaultPvdSocketTransportCreate("127.0.0.1", 5555, 10), PxPvdInstrumentationFlag::eALL);
	this->p = PxCreatePhysics(version, *f, PxTolerancesScale(), true, pvd);
	this->c = PxCreateCooking(version, *f, PxCookingParams(PxTolerancesScale()));
	if (!this->c) {
		std::cout << "Cooking Error" << std::endl;
		std::cin.get();
	}
	this->dispatch = PxDefaultCpuDispatcherCreate(4);
	this->mater = p->createMaterial(0.5f, 0.5f, 0.6f);

	PxSceneDesc sDesc(this->p->getTolerancesScale());
	sDesc.gravity = PxVec3(0.0f, 0.0f, -9.81f);
	sDesc.cpuDispatcher = this->dispatch;
	sDesc.flags = PxSceneFlag::eENABLE_ACTIVE_ACTORS;
	sDesc.filterShader = PxDefaultSimulationFilterShader;
	this->s = this->p->createScene(sDesc);
	this->client = s->getScenePvdClient();

	if (this->client) {
		this->client->setScenePvdFlag(PxPvdSceneFlag::eTRANSMIT_CONSTRAINTS, true);
		this->client->setScenePvdFlag(PxPvdSceneFlag::eTRANSMIT_CONTACTS, true);
		this->client->setScenePvdFlag(PxPvdSceneFlag::eTRANSMIT_SCENEQUERIES, true);
	}
}

PxEngine::~PxEngine()
{
	this->s->release();
	this->f->release();
	this->p->release();
}

void PxEngine::simulate(std::map<WOActor*, int>) 
{
	this->s->simulate(ManagerSDLTime::getTimeSinceLastPhysicsIteration() / 1000.0f);
	this->s->fetchResults(true);
	PxU32 numTrans = 0;
	PxActor** activeActors = this->s->getActiveActors(numTrans);
	for (PxU32 i = 0; i < numTrans; i++) {
		WOActor* wo = static_cast<WOActor*>(activeActors[i]->userData);
		if (wo != nullptr && wo->actor != nullptr) {
			PxTransform trans = wo->actor->getGlobalPose();
			PxMat44 pose = PxMat44(trans);

			float convert[16] = {
				pose(0, 0), pose(0, 1), pose(0, 2), pose(3, 0),
				pose(1, 0), pose(1, 1), pose(1, 2), pose(3, 1),
				pose(2, 0), pose(2, 1), pose(2, 2), pose(3, 2),
				pose(0, 3), pose(1, 3), pose(2, 3), pose(3, 3)
			};
			Mat4 mat(convert);
			wo->setDisplayMatrix(mat);
			wo->setPosition(Vector(mat[12], mat[13], mat[14]));
		}
	}
}

void PxEngine::addActor(void* pointer, PxActor* actor) 
{
	actor->userData = pointer;
	this->s->addActor(*actor);
}