import { THREE, objLoader, gltfExporter, scene } from './three-instance.js';

export class OBJConverter {
    constructor() {
        this.scene = scene;
        this.loader = objLoader;
    }

    async convertToGLB(objPath, material) {
        try {
            console.log('Starting OBJ load from path:', objPath);
            const obj = await new Promise((resolve, reject) => {
                this.loader.load(
                    objPath,
                    (loadedObj) => {
                        console.log('OBJ loaded successfully:', loadedObj);
                        resolve(loadedObj);
                    },
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
                    },
                    (error) => {
                        console.error('OBJ loading error:', error);
                        reject(error);
                    }
                );
            });

            console.log('Applying materials...');
            obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                    child.geometry.computeVertexNormals();
                }
            });

            this.scene.add(obj);

            console.log('Converting to GLB...');
            const glbData = await new Promise((resolve, reject) => {
                gltfExporter.parse(
                    this.scene,
                    (result) => {
                        console.log('GLB conversion successful');
                        resolve(result);
                    },
                    (error) => {
                        console.error('GLB conversion error:', error);
                        reject(error);
                    },
                    { binary: true }
                );
            });

            const blob = new Blob([glbData], { type: 'model/gltf-binary' });
            return URL.createObjectURL(blob);

        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        } finally {
            this.scene.remove(...this.scene.children.filter(child => child instanceof THREE.Mesh));
        }
    }

    dispose() {
        this.scene.clear();
    }
}