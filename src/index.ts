import {Engine} from "@babylonjs/core/Engines/engine";
import {getSceneModuleWithName} from "./createScene";
import {LoadingScreen, ILoadingScreen} from './components/Loading';
import './index.less';

const getModuleToLoad = (): string | undefined => {
  // ATM using location.search
  if (!location.search) {
    return;
  } else {
    return location.search.substr(location.search.indexOf('scene=') + 6);
  }
}

export const babylonInit = async (): Promise<Engine> => {
  // get the module to load
  const moduleName = getModuleToLoad();
  const createSceneModule = await getSceneModuleWithName(moduleName);

  // Execute the pretasks, if defined
  await Promise.all(createSceneModule.preTasks || []);
  // Get the canvas element
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  // Generate the BABYLON 3D engine
  const engine = new Engine(canvas, true);

  // loading加在引擎上
  const loadingScreen: ILoadingScreen = new LoadingScreen('loading');
  engine.loadingScreen = loadingScreen;

  //创建场景前开启loading
  engine.displayLoadingUI();

  // 创建场景
  const scene = await createSceneModule.createScene(engine, canvas);

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
  return engine;
}

babylonInit().then(() => {
  // scene started rendering, everything is initialized
});