import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export class OBJConverter {
    constructor() {
        this.scene = new THREE.Scene();
        this.loader = new OBJLoader();

        // Create lights with proper targets
        const lights = [
            { pos: [1, 1, 1], intensity: 1.0 },
            { pos: [-1, -1, -1], intensity: 0.8 },
            { pos: [0, 1, 0], intensity: 0.6 }
        ].map(({ pos, intensity }) => {
            const light = new THREE.DirectionalLight(0xffffff, intensity);
            light.position.set(...pos);
            
            // Add target for each light
            const target = new THREE.Object3D();
            target.position.set(0, 0, -1);
            light.target = target;
            this.scene.add(target);
            
            return light;
        });

        // Add all lights at once
        this.scene.add(...lights);
    }

    async convertToGLB(objPath, material) {
        try {
            // Load OBJ
            const obj = await new Promise((resolve, reject) => {
                this.loader.load(
                    objPath,
                    resolve,
                    undefined,
                    reject
                );
            });

            // Apply material and optimize geometry
            obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                    child.geometry.computeVertexNormals();
                }
            });

            this.scene.add(obj);

            // Convert to GLB
            const glbData = await new Promise((resolve, reject) => {
                const exporter = new GLTFExporter();
                exporter.parse(
                    this.scene,
                    (result) => {
                        if (!(result instanceof ArrayBuffer)) {
                            reject(new Error('Invalid GLB format'));
                            return;
                        }
                        resolve(result);
                    },
                    (error) => reject(error),
                    { 
                        binary: true,
                        onlyVisible: true,
                        includeCustomExtensions: true
                    }
                );
            });

            const blob = new Blob([glbData], { type: 'model/gltf-binary' });
            return URL.createObjectURL(blob);

        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        } finally {
            // Clean up meshes but keep lights
            this.scene.remove(...this.scene.children.filter(child => child instanceof THREE.Mesh));
        }
    }

    dispose() {
        this.scene.clear();
    }
} 