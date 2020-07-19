import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";

// 相机
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {ArcFollowCamera} from '@babylonjs/core/Cameras/followCamera';
import {FollowCamera} from "@babylonjs/core/Cameras/followCamera";
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera';
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

export class DefaultSceneWithTexture implements CreateSceneClass {

  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // 创建一个场景对象

    const scene = new Scene(engine);

    /****************************** 相机部分 ********************************/
    let camera: ArcRotateCamera | null = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      50,   // 相机半径
      new Vector3(0, 0, 0),
      scene
    );
    let followCamera: FollowCamera | null = null;

    // 设置target到原点
    camera.setTarget(new Vector3(0, 0, 0)); // 相机原点为

    camera.lowerBetaLimit = 0.5;   // 旋转角度最低限制
    camera.upperBetaLimit = (Math.PI / 2) * 0.95; // 旋转角度最高限制
    camera.lowerRadiusLimit = 50;   // 相机半径最低限制
    camera.upperRadiusLimit = 200;  // 相机半径最高限制
    camera.useAutoRotationBehavior = true;// 摄像机自动旋转

    camera.attachControl(canvas, true);

    // 给相机挂动画
    const animationCamera = new Animation("tutoAnimation", "radius", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

    // Animation keys
    let keys = [];
    // 动画第0帧的值
    keys.push({
      frame: 0,
      value: 50
    });
    // 动画第100帧的值
    keys.push({
      frame: 50,
      value: 200
    });

    // 给相机挂上动画
    animationCamera.setKeys(keys);

    const easingFunction = new CircleEase();

    // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

    // Adding easing function to my animation
    animationCamera.setEasingFunction(easingFunction);

    camera.animations.push(animationCamera);

    /****************************** 创建光源 ********************************/
    const light = new HemisphericLight("light", new Vector3(100, 100, 0), scene);
    // const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(100, 100, 20), scene);
    // 光源亮度 0-1
    light.intensity = 1;

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
    console.log(data)

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
        mesh.actionManager.registerAction(
          // 这里是一个bug 不能用直接用导出的模块ExecuteCodeAction 需要使用BABYLON.ExecuteCodeAction
          new BABYLON.ExecuteCodeAction(
            ActionManager.OnLeftPickTrigger,
            (mesh: any) => {
              console.log(123, mesh, data)
              // ArcFollowCamera
              if (!isFollow) {
                isFollow = true;
                camera && (camera.useAutoRotationBehavior = false);// 摄像机自动旋转
                if (!followCamera) {
                  followCamera = new FollowCamera("FollowCam", new Vector3(0, 0, 0), scene);
                }
                // 当前位置到目标位置的加速度
                followCamera.cameraAcceleration = 0.05

                // 停止加速的速度
                followCamera.maxCameraSpeed = 3

                camera && (followCamera.position = camera.position);

                followCamera.radius = 53;

                // 相机的目标高度高于目标的原点
                followCamera.heightOffset = 0;

                // 摄像机绕xy绕目标原点旋转
                followCamera.rotationOffset = -90;


                followCamera.lockedTarget = cabinet.meshes[0];

                // 打开柜子门
                cabinet.meshes[3].addRotation(0, 120 / 180 * Math.PI, 0);

                // cabinet.meshes.forEach(m => {
                //   m.material = xray_mat;
                // })
                // // followCamera.
                // console.log()
                navigateStack.push(cabinet);
                scene.activeCameras.pop();
                scene.activeCameras.push(followCamera);
              }

              // 先解开相机限制
              // camera.lowerRadiusLimit = 50;
              // camera.lockedTarget = cabinet.meshes[0];
              // // camera.lockedTarget = cabinet.meshes[0];
              // camera.useAutoRotationBehavior = false; // 相机停止转动
              // camera.radius = 50;
              // camera.alpha = 0;
              // camera.beta = 0;
              // camera.target._z = 20;
              // camera.rotation = new Vector3(0, 0, 0)
              // // 相机到目标的距离
              // followCamera.radius = 100;

              // console.log("%c ActionManager: long press : " + mesh.name, 'background: green; color: white');
            }));
      })
    })

    // 键盘事件
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
      if (evt.sourceEvent.key === 'Escape') {
        let mesh = navigateStack.pop();
        if (mesh.meshes.length === 4) {
          let cabinet = mesh;
          if (followCamera) {
            followCamera.radius = 170;

            // 相机的目标高度高于目标的原点
            followCamera.heightOffset = 104;

            // 摄像机绕xy绕目标原点旋转
            followCamera.rotationOffset = -90;

            followCamera.lockedTarget = ground.meshes[0];

            setTimeout(() => {
              isFollow = false;
              // 柜子关门
              cabinet.meshes[3].addRotation(0, -120 / 180 * Math.PI, 0);
              setTimeout(() => {
                // 切换主相机

                console.log(followCamera)
                if (!camera) {
                  camera = new ArcRotateCamera(
                    "my first camera",
                    0,
                    Math.PI / 3,
                    followCamera?.radius || 50,   // 相机半径
                    new Vector3(0, 0, 0),
                    scene
                  );

                  camera.lowerBetaLimit = 0.5;   // 旋转角度最低限制
                  camera.upperBetaLimit = (Math.PI / 2) * 0.95; // 旋转角度最高限制
                  camera.lowerRadiusLimit = 50;   // 相机半径最低限制
                  camera.upperRadiusLimit = 200;  // 相机半径最高限制
                }
                followCamera = null;
                scene.activeCameras.pop();
                scene.activeCameras.push(camera)
                camera.alpha = 0;
                camera.useAutoRotationBehavior = true;
              }, 1200);
            }, 0);
          }





        }
      }
    }));

    camera.lockedTarget = ground.meshes[0];

    // 加载完毕隐藏loading
    setTimeout(() => {
      // 隐藏ui后拉远视角
      engine.hideLoadingUI();
      // 开始相机动画
      setTimeout(() => {
        // 相机动画执行
        scene.beginAnimation(camera, 0, 100, false, undefined, () => {
          // 相机动画执行完成后 锁定相机最低半径
          camera && (camera.lowerRadiusLimit = 200);   // 相机半径最低限制
        });
      }, 300);
    }, 200);
    return scene;
  };
}

export default new DefaultSceneWithTexture();