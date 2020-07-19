import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";

// 相机
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
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
    const camera = new ArcRotateCamera(
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

    // var camera = new FollowCamera("FollowCam", new Vector3(0, 0, 0), scene);

    // // 相机到目标的距离
    // camera.radius = 10;

    // // 相机的目标高度高于目标的原点
    // camera.heightOffset = 10;

    // // 摄像机绕xy绕目标原点旋转
    // camera.rotationOffset = Math.PI/2;

    // // 当前位置到目标位置的加速度
    // camera.cameraAcceleration = 0.005

    // // 停止加速的速度
    // camera.maxCameraSpeed = 5

    // // This attaches the camera to the canvas
    // camera.attachControl(canvas, true);

    /****************************** 创建光源 ********************************/
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
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
    // let cabinetsPosition:Vector3[] = Array[];
    let cabinetTotal: number = 30;
    let cabinets = [];
    for (let key of new Array(cabinetTotal)) {
      cabinets.push(await Cabinet(scene));
    }

    let rowTotal: number = 10;
    cabinets.forEach((cabinet, index) => {
      let x = Math.floor(index / rowTotal);
      let y = Math.floor(index % rowTotal);
      console.log(cabinet)

      // 每行10个按照一半分开
      if (y >= rowTotal / 2) {
        y += 2
      }

      // 设定每个机柜的原点
      const origin = new Vector3(x * 60 - 70, 0, y * 12.1 - 65);

      // 机柜应用原点
      cabinet.meshes[0].position = origin;


      // 注册事件
      let cabinetMesh = cabinet.meshes[0]
      cabinet.meshes.forEach(mesh => {
        mesh.isPickable = true; // 开启pick
        mesh.actionManager = new ActionManager(scene);
        mesh.actionManager.registerAction(new ExecuteCodeAction(
          ActionManager.OnLeftPickTrigger, (function (mesh: any) {
            console.log(123)
            // console.log("%c ActionManager: long press : " + mesh.name, 'background: green; color: white');
          }).bind(this, mesh)));
      })
      // cabinetMesh.actionManager = new ActionManager(scene);
      // cabinetMesh.actionManager.registerAction(new ExecuteCodeAction(
      //   ActionManager.OnPointerOverTrigger, (function () {
      //     console.log(321321)
      //     // console.log("%c ActionManager: long press : " + mesh.name, 'background: green; color: white');
      //   }).bind(this, cabinetMesh)));

      // cabinet.meshes[1].addRotation(120 / 180 * Math.PI, 0, 0)
    })

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
          camera.lowerRadiusLimit = 200;   // 相机半径最低限制
        });
      }, 300);
    }, 200);
    return scene;
  };
}

export default new DefaultSceneWithTexture();