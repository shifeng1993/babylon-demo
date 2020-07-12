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
import {SphereBuilder} from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import {BoxBuilder} from "@babylonjs/core/Meshes/Builders/boxBuilder";
import {GroundBuilder} from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

// 材质
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial";
// 动画
import {Animation} from "@babylonjs/core/Animations";
// 粒子系统
import {ParticleSystem} from '@babylonjs/core/Particles';

import {CreateSceneClass} from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {addLabelToMesh} from "../gui";
import grassTextureUrl from "../../assets/grass.jpg";
import {Color4, Color3} from "@babylonjs/core/Maths/math.color";

export class DefaultSceneWithTexture implements CreateSceneClass {

  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    // var camera = new UniversalCamera("UniversalCamera", new Vector3(0, 0, -10), scene);
    const camera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      20,
      new Vector3(0, 0, 0),
      scene
    );
    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;
    // 允许摄像机对画布默认事件的操作
    camera.attachControl(canvas, true);

    // var camera = new FollowCamera("FollowCam", new Vector3(0, 0, 0), scene);

    // // 相机到目标的距离
    // camera.radius = 10;

    // // 相机的目标高度高于目标的原点
    // camera.heightOffset = 10;

    // // 摄像机绕xy绕目标原点旋转
    // camera.rotationOffset = 0;

    // // 当前位置到目标位置的加速度
    // camera.cameraAcceleration = 0.005

    // // 停止加速的速度
    // camera.maxCameraSpeed = 5

    // // This attaches the camera to the canvas
    // camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    // var light = new SpotLight("spotLight", new Vector3(0, 30, -10), new Vector3(0, -1, 0), Math.PI / 3, 2, scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 1;

    // Our built-in 'sphere' shape.
    const sphere = SphereBuilder.CreateSphere(
      "sphere",
      {diameter: 2, segments: 32},
      scene
    );

    const box = BoxBuilder.CreateBox(
      "box",
      {height: 0, width: 2, depth: 0.5},
      scene
    );

    box.position = new Vector3(0, 1, 1);
    box.rotation = new Vector3(Math.PI / 2, Math.PI / 2 / 3,)
    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Our built-in 'ground' shape.
    const ground = GroundBuilder.CreateGround(
      "ground",
      {width: 10, height: 6},
      scene
    );

    // 定义一个材质
    const groundMaterial = new StandardMaterial("ground material", scene);
    // 给材质附上纹理
    groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);
    // 给group附上定义的材质
    ground.material = groundMaterial;

    const boxMaterial = new StandardMaterial('box material', scene);

    boxMaterial.diffuseColor = new Color3(1, 0, 1);
    boxMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
    boxMaterial.emissiveColor = new Color3(1, 1, 1);
    boxMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

    box.material = boxMaterial;

    camera.lockedTarget = sphere;
    // Create a particle system
    var particleSystem = new ParticleSystem("particles", 2000, scene);

    //Texture of each particle
    particleSystem.particleTexture = new Texture(grassTextureUrl, scene);

    // Where the particles come from
    particleSystem.emitter = box; // the starting object, the emitter
    particleSystem.minEmitBox = new Vector3(-1, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new Vector3(1, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;

    // Emission rate
    particleSystem.emitRate = 1500;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new Vector3(0, -9.81, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new Vector3(-7, 8, 3);
    particleSystem.direction2 = new Vector3(7, 8, -3);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    // Start the particle system
    particleSystem.start();
    var keys = [];
    var animation = new Animation("animation", "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE);
    // At the animation key 0, the value of scaling is "1"
    keys.push({
      frame: 0,
      value: 0
    });

    // At the animation key 50, the value of scaling is "0.2"
    keys.push({
      frame: 50,
      value: Math.PI
    });

    // At the animation key 100, the value of scaling is "1"
    keys.push({
      frame: 100,
      value: 0
    });

    // Launch animation
    animation.setKeys(keys);
    box.animations.push(animation);
    scene.beginAnimation(box, 0, 100, true);
    // setTimeout(() => {
    //   scene.beginAnimation(box, 100, 0, true);
    // }, 2000);

    //Set gravity for the scene (G force like, on Y-axis)
    // scene.gravity = new Vector3(0, -0.9, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;
    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "",
      require('../../assets/glb/samsung-controller.glb'),
      scene,
      undefined,
      ".glb"
    );

    // just scale it so we can see it better
    importResult.meshes[0].scaling.scaleInPlace(10);
    //Then apply collisions and gravity to the active camera
    // camera.checkCollisions = true;
    // //finally, say which mesh will be collisionable
    // camera.collisionRadius = new Vector3(0.5, 0.5, 0.5)
    ground.checkCollisions = true;
    box.checkCollisions = true;
    return scene;
  };
}

export default new DefaultSceneWithTexture();