import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// Initialize loaders with the shared THREE instance
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const gltfExporter = new GLTFExporter();

// Create a shared scene
const scene = new THREE.Scene();

// Create shared lights
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(0, 10, 0);
const mainTarget = new THREE.Object3D();
mainTarget.position.set(0, 0, -1);
mainLight.target = mainTarget;
scene.add(mainTarget);
scene.add(mainLight);

const pointLight1 = new THREE.PointLight(0xffffff, 0.4);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Export everything through this file
export { THREE, objLoader, mtlLoader, gltfExporter, scene };