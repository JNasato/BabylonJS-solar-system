/// <reference path='./vendor/babylon.d.ts' />

// get canvas
const canvas = document.getElementById('renderCanvas');

// create a BabylonJS engine
const engine = new BABYLON.Engine(canvas, true);

function createCamera(scene) {
  const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 15, BABYLON.Vector3.Zero(), scene);
  // let user move camera
  camera.attachControl(canvas);

  // limit camera movement
  camera.lowerRadiusLimit = 12;
  camera.upperRadiusLimit = 50;
}

function createLight(scene) {
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.5;
  light.groundColor = new BABYLON.Color3(0, 0, 0);
}

function createSun(scene) {
  const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
  sunMaterial.emissiveTexture = new BABYLON.Texture('assets/images/sun.jpg');
  sunMaterial.diffuseColor = BABYLON.Color3.Black();
  sunMaterial.specularColor = BABYLON.Color3.Black();

  const sun = BABYLON.MeshBuilder.CreateSphere('sun', {
    segments: 32,
    diameter: 8
  }, scene);
  sun.material = sunMaterial;

  // sun light
  const sunLight = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), scene);
  sunLight.intensity = 2.5;
}

function createPlanet(scene, image, diameter, x, y, speed) {
  const planetMaterial = new BABYLON.StandardMaterial(`${image}_material`, scene);
  planetMaterial.diffuseTexture = new BABYLON.Texture(`assets/images/${image}`, scene);
  planetMaterial.specularColor = BABYLON.Color3.Black();

  const planet = new BABYLON.MeshBuilder.CreateSphere(`${image}`, {
    segments: 16,
    diameter
  }, scene);
  planet.position.x = x;
  planet.position.y = y;
  planet.material = planetMaterial;

  planet.orbit = {
    radius: planet.position.x,
    speed,
    angle: 0
  };

  scene.registerBeforeRender(() => {
    planet.position.x = planet.orbit.radius * Math.sin(planet.orbit.angle);
    planet.position.z = planet.orbit.radius * Math.cos(planet.orbit.angle);
    planet.orbit.angle += planet.orbit.speed;
  });
}

function createSkybox(scene) {
  const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
  skyboxMaterial.backFaceCulling = false;
  // remove reflection in skybox
  skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
  skyboxMaterial.specularColor = BABYLON.Color3.Black();
  // texture the 6 sides of box
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/images/skybox/skybox', scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

  const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {
    size: 1000,
  }, scene);
  // move skybox with camera
  skybox.infiniteDistance = true;

  skybox.material = skyboxMaterial;
}

function createShip(scene) {
  BABYLON.SceneLoader.ImportMesh('', 'assets/models/', 'spaceCraft1.obj', scene, (meshes) => {
    meshes.forEach((mesh) => {
      mesh.position = new BABYLON.Vector3(16, 3.5, 0);
      mesh.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
      mesh.rotation.x = 1;
      mesh.rotation.y = 0;
      mesh.orbit = {
        radius: mesh.position.x,
        speed: -0.004,
        angle: 0
      };

      scene.registerBeforeRender(() => {
        mesh.position.x = mesh.orbit.radius * Math.sin(mesh.orbit.angle);
        mesh.position.z = mesh.orbit.radius * Math.cos(mesh.orbit.angle);
        mesh.rotation.y += mesh.orbit.speed;
        mesh.orbit.angle += mesh.orbit.speed;
      });
    });
  });
}

function createScene() {
  // create a new scene
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color3.Black();

  // create a camera
  createCamera(scene);

  // create a light
  createLight(scene);

  //create the sun
  createSun(scene);

  // create planets
  createPlanet(scene, 'sand.png', 1, 10, 1, 0.005);
  createPlanet(scene, 'dark_rock.png', 2, 15, 3, -0.004);
  createPlanet(scene, 'brown_rock.png', 0.75, 21, -2, 0.002);

  // create skybox
  createSkybox(scene);

  // create ship
  createShip(scene);

  return scene;
}

// create the scene 
const mainScene = createScene();

engine.runRenderLoop(() => {
  mainScene.render();
})