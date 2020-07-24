import {Scene} from "@babylonjs/core/scene";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Animation} from "@babylonjs/core/Animations";
import {CircleEase, EasingFunction} from '@babylonjs/core/Animations/easing';


function moveArcRotateCamera(camera: ArcRotateCamera, position: Vector3 | undefined, radius: number | undefined, alpha: number | undefined, beta: number | undefined, speed: number | undefined, scene: Scene, callback: (() => void) | undefined) {
  const startPos = camera.target.z;
  const startRadius = camera.radius;
  const startAlpha = camera.alpha;
  const startBeta = camera.beta;

  const easingFunction = new CircleEase();

  // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

  const translate = new Animation("camTranslate", "target.z", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  const toRadius = new Animation("camRadius", "radius", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  const toAlpha = new Animation("camAlpha", "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
  const toBeta = new Animation("camAlpha", "beta", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);



  if (position !== undefined) {
    const keys = [{frame: 0, value: startPos}, {frame: 60, value: position.z}];
    translate.setKeys(keys);
    translate.setEasingFunction(easingFunction);
    camera.animations.push(translate);
  }

  if (radius !== undefined) {
    const keys2 = [{frame: 0, value: startRadius}, {frame: 30, value: radius}];
    toRadius.setKeys(keys2);
    toRadius.setEasingFunction(easingFunction);
    camera.animations.push(toRadius);
  }

  if (alpha !== undefined) {
    const keys3 = [{frame: 0, value: startAlpha}, {frame: 30, value: alpha}];
    toAlpha.setKeys(keys3);
    toAlpha.setEasingFunction(easingFunction);
    camera.animations.push(toAlpha);
  }

  if (beta !== undefined) {
    const keys4 = [{frame: 0, value: startBeta}, {frame: 30, value: beta}];
    toBeta.setKeys(keys4);
    toBeta.setEasingFunction(easingFunction);
    camera.animations.push(toBeta);
  }

  scene.beginAnimation(camera, 0, 100, false, speed, callback);
}
export {
  moveArcRotateCamera
}