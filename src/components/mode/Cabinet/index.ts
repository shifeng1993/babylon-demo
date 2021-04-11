/*
 * @Description: 机柜mesh组件
 * @Author: shifeng
 * @Email: shifeng199307@gmail.com
 * @Date: 2020-07-16 21:39:40
 */
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";

import "@babylonjs/loaders/glTF";
import controllerModel from "../../../../assets/glb/cabinet.glb";

console.log(controllerModel)

export async function Cabinet(scene: Scene): Promise<any> {
  return SceneLoader.ImportMeshAsync(
    "",
    "",
    controllerModel,
    scene,
    undefined,
    ".glb"
  );
} 