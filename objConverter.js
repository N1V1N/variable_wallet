import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export class OBJConverter {
    constructor() {
        this.scene = new THREE.Scene();
        this.loader = new OBJLoader();
        
        // Use directional lights instead of ambient
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 1, 1);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-1, -1, -1);
        
        this.scene.add(directionalLight1);
        this.scene.add(directionalLight2);
    }

    async convertToGLB(objPath, material) {
        try {
            // Load OBJ
            const obj = await new Promise((resolve, reject) => {
                this.loader.load(objPath, resolve, undefined, reject);
            });

            // Apply material
            obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });

            this.scene.add(obj);

            // Convert to GLB with proper options
            const exporter = new GLTFExporter();
            const glbData = await new Promise((resolve, reject) => {
                exporter.parse(
                    this.scene,
                    (result) => {
                        if (result instanceof ArrayBuffer) {
                            resolve(result);
                        } else {
                            reject(new Error('Exported data is not in the correct format'));
                        }
                    },
                    (error) => reject(error),
                    { binary: true, forceIndices: true, includeCustomExtensions: true }
                );
            });

            return glbData;
        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        } finally {
            this.scene.clear();
        }
    }

    createURL(glbData) {
        if (!(glbData instanceof ArrayBuffer)) {
            throw new Error('Invalid GLB data format');
        }
        const blob = new Blob([glbData], { type: 'model/gltf-binary' });
        return URL.createObjectURL(blob);
    }
} 