import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import GUI from 'lil-gui';

/**
 * Debug
 */

const gui = new GUI({
  width: 300,
  title: 'Debug Panel (Press H to show/hide the panel)',
  closeFolders: false,
});

gui.close();
//gui.hide();

window.addEventListener('keydown', (event) => {
  if (event.key === 'h') gui.show(gui._hidden); //this is to toggle the debug UI
});

const debugObject = {};
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */

debugObject.color = '#a778d8';

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const material = new THREE.MeshBasicMaterial({
  color: debugObject.color,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const cubeTweaks = gui.addFolder('Awesome cube');

//you use the gui to tweak an object and specifically a property in an object, this case position of a mesh and even more specifically the 'y'
//gui.add(mesh.position, 'y', -2, 2, 0.01); //object, value, min, max, step
cubeTweaks.add(mesh.position, 'y').min(-2).max(2).step(0.01).name('elevation');

cubeTweaks.add(mesh, 'visible'); //possible use case to check what's heavy to render for example

cubeTweaks.add(material, 'wireframe');

//DON*T USE AS IS, needs .onChange to calculate the right colour variable
cubeTweaks.addColor(debugObject, 'color').onChange(() => {
  //value.getHexString(); // to get the right colour!!
  material.color.set(debugObject.color); // set the material color to the debug object color
});

debugObject.spin = () => {
  gsap.to(mesh.rotation, { y: mesh.rotation.y + Math.PI * 2 }); //Math.PI is half a circle, *2 is full circle
};

cubeTweaks.add(debugObject, 'spin'); //lil gui knows this needs a button because my spin property holds a function

debugObject.subdivision = 2;

cubeTweaks
  .add(debugObject, 'subdivision')
  .min(1)
  .max(10)
  .step(1)
  .onFinishChange(() => {
    //dispose the old geometry to avoid memory leaks!
    mesh.geometry.dispose();
    //USE onFinishChange to avoid performance issues, this is like throttling
    mesh.geometry = new THREE.BoxGeometry(
      1,
      1,
      1,
      debugObject.subdivision,
      debugObject.subdivision,
      debugObject.subdivision
    );
  });

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
