import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/exporters/GLTFExporter.js';

export async function initializeModelViewer(options = {}) {
    const {
        modelPath,
        containerId,
        width,
        height,
        backgroundColor
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Apply custom styles if provided
    if (width) container.style.width = width;
    if (height) container.style.height = height;
    if (backgroundColor) container.style.backgroundColor = backgroundColor;

    // Convert OBJ to GLB
    try {
        const glbUrl = await convertOBJtoGLB(modelPath);
        if (glbUrl) {
            container.src = glbUrl;
            container.setAttribute('loading', 'eager');
        }
    } catch (error) {
        console.error('Error initializing model:', error);
    }
}

async function convertOBJtoGLB(objPath) {
    const scene = new THREE.Scene();
    const loader = new OBJLoader();
    
    try {
        const obj = await new Promise((resolve, reject) => {
            loader.load(objPath, resolve, undefined, reject);
        });
        
        scene.add(obj);
        const exporter = new GLTFExporter();
        
        const glbData = await new Promise((resolve, reject) => {
            exporter.parse(scene, resolve, { binary: true });
        });
        
        const blob = new Blob([glbData], { type: 'application/octet-stream' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error converting OBJ to GLB:', error);
        return null;
    }
} 