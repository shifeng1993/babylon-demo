import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";

// 相机
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";

// 定位
import {Vector3} from "@babylonjs/core/Maths/math.vector";
// 光源
import {DirectionalLight} from "@babylonjs/core/Lights/directionalLight"; // 定向光
import {PointLight} from "@babylonjs/core/Lights/pointLight";   // 点光源
import {SpotLight} from "@babylonjs/core/Lights/spotLight";   // 射灯
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight"; // 半球光
// 模型
import {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {SphereBuilder} from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import {BoxBuilder} from "@babylonjs/core/Meshes/Builders/boxBuilder";
import {GroundBuilder} from "@babylonjs/core/Meshes/Builders/groundBuilder";
// 材质
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial";
import {FresnelParameters} from '@babylonjs/core/Materials/fresnelParameters';
// 动画
import {Animation} from "@babylonjs/core/Animations";
import {CircleEase, EasingFunction} from '@babylonjs/core/Animations/easing';

// 事件
import {PointerEventTypes} from '@babylonjs/core/Events/pointerEvents'; // 鼠标事件
import {ActionManager} from '@babylonjs/core/Actions/actionManager';
import {ExecuteCodeAction} from '@babylonjs/core/Actions/directActions';
// 粒子系统
import {ParticleSystem} from '@babylonjs/core/Particles';
import {GUI3DManager, SpherePanel, HolographicButton} from '@babylonjs/gui';

import {CreateSceneClass} from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {addLabelToMesh} from "../gui";
import grassTextureUrl from "../../assets/grass.jpg";
import {Color4, Color3} from "@babylonjs/core/Maths/math.color";
// import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";

// import "@babylonjs/loaders/glTF";
// import controllerModel from "../../assets/glb/cabinet.glb";

import {Ground} from '../components/mode/Ground'; // 地面
import {Cabinet} from '../components/mode/Cabinet';  // 机柜

import xary from '../components/materials/xray';  // x光材质

import {moveArcRotateCamera} from '../utils';
export class DefaultSceneWithTexture implements CreateSceneClass {

  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // 创建一个场景对象

    const scene = new Scene(engine);

    let allowEvent: boolean = false; // 是否允许事件
    /****************************** 相机部分 ********************************/
    const camera: ArcRotateCamera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      50,   // 相机半径
      new Vector3(0, 0, 0),
      scene
    );

    // 设置target到原点
    camera.setTarget(new Vector3(0, 0, 0)); // 相机原点为

    camera.lowerBetaLimit = 0.5;   // 旋转角度最低限制
    camera.upperBetaLimit = (Math.PI / 2) * 0.95; // 旋转角度最高限制
    camera.lowerRadiusLimit = 50;   // 相机半径最低限制
    camera.upperRadiusLimit = 200;  // 相机半径最高限制
    camera.useAutoRotationBehavior = true;// 摄像机自动旋转
    camera.useFramingBehavior = true;

    camera.attachControl(canvas, true);

    /****************************** 创建光源 ********************************/
    const light = new HemisphericLight("light", new Vector3(100, 100, 0), scene);
    // const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(100, 100, 20), scene);
    // 光源亮度 0-1
    light.intensity = 0.4;

    /****************************** 材质部分 ********************************/
    // 定义x光材质
    const xray_mat = await xary(scene);

    /****************************** 地形部分(房间) ********************************/
    const ground = await Ground(scene);
    // 加载x光材质，变为透视
    ground.meshes.forEach(mesh => {
      mesh.material = xray_mat;
    })

    /****************************** 渲染机柜 ********************************/
    let data: number[] = (new Array(30)).map((item, index) => index);
    let cabinets = [];

    for (let i = 0; i < data.length; i++) {
      let cabinet = await Cabinet(scene);
      cabinets.push({
        data: data[i],
        cabinet
      });
    }



    let rowTotal: number = 10;
    let isFollow = false;

    let navigateStack: any = [];
    let hoverActive: any = [];
    let cabinetDefaultMaterial: BABYLON.Material | null;
    cabinets.forEach(({data, cabinet}, index) => {
      let x = Math.floor(index / rowTotal);
      let y = Math.floor(index % rowTotal);

      // 每行10个按照一半分开
      if (y >= rowTotal / 2) {
        y += 2
      }

      // 机柜定位
      cabinet.meshes[0].position = new Vector3(x * 60 - 80, 20, y * 12.1 - 65);

      // 注册事件
      // let cabinetMesh = cabinet.meshes[0]
      cabinet.meshes.forEach(mesh => {
        mesh.actionManager = new ActionManager(scene);

        // 注册左键单击事件
        mesh.actionManager.registerAction(
          // 这里是一个bug 不能用直接用导出的模块ExecuteCodeAction 需要使用BABYLON.ExecuteCodeAction
          new BABYLON.ExecuteCodeAction(
            ActionManager.OnDoublePickTrigger,
            (mesh: any) => {
              if (!allowEvent) return

              if (!isFollow) {
                isFollow = true;

                // 关闭摄像机自动旋转
                camera.useAutoRotationBehavior = false
                // 先解开相机限制
                camera.lowerRadiusLimit = 55;

                // 锁定中心点物体
                camera.lockedTarget = cabinet.meshes[0];

                // 打开柜子门 绕着Y轴旋转 120度
                cabinet.meshes[3].rotate(BABYLON.Axis.Y, 120 / 180 * Math.PI, BABYLON.Space.LOCAL);

                // 加载x光材质，变为透视
                cabinet.meshes.forEach((mesh, index) => {
                  if (index === 3) {
                    console.log(mesh.material)
                    console.log(xray_mat)
                    cabinetDefaultMaterial = mesh.material;
                  }
                  mesh.material = xray_mat;
                })

                let alpha = (camera.alpha > 0) ? Math.floor(camera.alpha / (Math.PI * 2)) * (Math.PI * 2) : Math.ceil(camera.alpha / (Math.PI * 2)) * (Math.PI * 2)

                // 移动相机视角
                moveArcRotateCamera(camera, cabinet.meshes[0].position, 55, alpha, Math.PI / 2, 2, scene, () => {
                  // 完成相机平滑转换视角后锁定相机
                  camera.lowerBetaLimit = Math.PI / 2;
                  camera.upperRadiusLimit = 55;
                  camera.lowerAlphaLimit = 0;
                  camera.upperAlphaLimit = 0;

                  navigateStack.push(cabinet);
                })
              }
            }));


        // 注册鼠标移入
        mesh.actionManager.registerAction(
          // 这里是一个bug 不能用直接用导出的模块ExecuteCodeAction 需要使用BABYLON.ExecuteCodeAction
          new BABYLON.ExecuteCodeAction(
            ActionManager.OnPointerOverTrigger,
            (mesh: any) => {
              if (!isFollow && hoverActive.length == 0) {
                camera.useAutoRotationBehavior = false;// 摄像机自动旋转
                // console.log(321312)
                hoverActive.push(1)
              }
            }));
        // 鼠标划出
        mesh.actionManager.registerAction(
          // 这里是一个bug 不能用直接用导出的模块ExecuteCodeAction 需要使用BABYLON.ExecuteCodeAction
          new BABYLON.ExecuteCodeAction(
            ActionManager.OnPointerOutTrigger,
            (mesh: any) => {
              if (!isFollow && hoverActive.length != 0) {

                camera.useAutoRotationBehavior = true;// 摄像机自动旋转
                // console.log('out')
                hoverActive.pop()
              }
            }));
      })
    })

    // 键盘事件
    let esc = false;
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
      if (evt.sourceEvent.key === 'Escape' && !esc) {
        esc = true;
        allowEvent = false;
        let cabinet = navigateStack[navigateStack.length - 1];
        if (cabinet && cabinet.meshes.length === 4) {
          console.log(12312321312)
          isFollow = false;

          camera.lowerBetaLimit = 0.5;   // 旋转角度最低限制
          camera.upperBetaLimit = (Math.PI / 2) * 0.95; // 旋转角度最高限制
          camera.lowerAlphaLimit = null;
          camera.upperAlphaLimit = null;
          camera.lowerRadiusLimit = 50;   // 相机半径最低限制
          camera.upperRadiusLimit = 200;  // 相机半径最高限制

          // 柜子关门 绕着Y轴旋转 -120度
          cabinet.meshes[3].rotate(BABYLON.Axis.Y, -120 / 180 * Math.PI, BABYLON.Space.LOCAL);

          cabinet.meshes.forEach((mesh: AbstractMesh) => {
            mesh.material = cabinetDefaultMaterial;
          })

          camera.lockedTarget = ground.meshes[0];
          moveArcRotateCamera(camera, ground.meshes[0].position, 200, 0, Math.PI / 3, 2, scene, () => {
            // 完成相机平滑转换视角后锁定相机
            camera.lowerRadiusLimit = 200
            camera.useAutoRotationBehavior = true;// 摄像机自动旋转
            camera.useFramingBehavior = true;

            navigateStack.pop();
            allowEvent = true;
          })

        }
        setTimeout(() => {
          esc = false;
        }, 500);
      }
    }));

    camera.lockedTarget = ground.meshes[0];

    // 加载完毕隐藏loading
    setTimeout(() => {
      // 隐藏ui后拉远视角
      engine.hideLoadingUI();
      // 开始相机动画
      setTimeout(() => {
        moveArcRotateCamera(camera, ground.meshes[0].position, 200, camera.alpha, camera.beta, 1, scene, () => {
          // 完成相机平滑转换视角后锁定相机
          camera.lowerRadiusLimit = 200

          // 打开全局事件监听
          allowEvent = true;
        })
      }, 200);
    }, 200);
    return scene;
  };
}

export default new DefaultSceneWithTexture();