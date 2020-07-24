/*
 * @Description: 
 * @Author: shifeng
 * @Email: shifeng199307@gmail.com
 * @Date: 2020-07-24 20:17:56
 */

import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {IParticleSystem} from '@babylonjs/core/Particles/IParticleSystem';
import {Skeleton} from '@babylonjs/core/Bones/skeleton';
import {AnimationGroup} from '@babylonjs/core/Animations';
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";

import "@babylonjs/loaders/glTF";
import serverModel1U from "../../../../assets/glb/1U-server.glb";
import serverModel2U from "../../../../assets/glb/2U-server.glb";
import serverModel4U from "../../../../assets/glb/4U-server.glb";

interface Mesh {
  meshes: AbstractMesh[];
  particleSystems: IParticleSystem[];
  skeletons: Skeleton[];
  animationGroups: AnimationGroup[];
}

export enum ServerType {
  ONE_UNIT = 1,
  TWO_UNIT = 2,
  FOUR_UNIT = 4,
}

export async function Server(scene: Scene, serverType: ServerType): Promise<Mesh> {
  let model: any;

  switch (serverType) {
    case ServerType.ONE_UNIT:
      model = serverModel1U;
      break;
    case ServerType.TWO_UNIT:
      model = serverModel2U;
      break;
    case ServerType.FOUR_UNIT:
      model = serverModel4U;
      break;

    default:
      model = serverModel1U;
      break;
  }

  return SceneLoader.ImportMeshAsync(
    "",
    "",
    model,
    scene,
    undefined,
    ".glb"
  );
}
