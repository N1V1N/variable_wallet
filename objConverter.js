import { THREE, objLoader, gltfExporter, scene } from './three-instance.js';

export class OBJConverter {
    constructor() {
        this.scene = scene;
        this.loader = objLoader;
        // Pre-allocate buffers
        this.tempVector = new THREE.Vector3();
    }

    async convertToGLB(objPath, material) {
        try {
            console.log('Starting OBJ load from path:', objPath);
            const obj = await new Promise((resolve, reject) => {
                this.loader.load(
                    objPath,
                    (loadedObj) => {
                        // Apply optimized geometry processing
                        loadedObj.traverse(child => {
                            if (child instanceof THREE.Mesh) {
                                const geometry = child.geometry;
                                
                                // Pre-compute buffer size
                                const vertexCount = geometry.attributes.position.count;
                                const optimizedPositions = new Float32Array(vertexCount * 3);
                                const positions = geometry.attributes.position.array;

                                // Batch process vertices for better performance
                                for (let i = 0; i < positions.length; i += 3) {
                                    // Process vertices in groups of 3 (x,y,z)
                                    this.tempVector.set(
                                        Math.round(positions[i] * 88) / 88,
                                        Math.round(positions[i + 1] * 88) / 88,
                                        Math.round(positions[i + 2] * 88) / 88
                                    );
                                    
                                    optimizedPositions[i] = this.tempVector.x;
                                    optimizedPositions[i + 1] = this.tempVector.y;
                                    optimizedPositions[i + 2] = this.tempVector.z;
                                }

                                // Efficient buffer updates
                                geometry.setAttribute('position', 
                                    new THREE.BufferAttribute(optimizedPositions, 3)
                                );
                                
                                // Remove unused attributes early
                                geometry.deleteAttribute('uv');
                                geometry.deleteAttribute('color');
                                
                                // Optimize normal computation
                                geometry.computeVertexNormals();
                                
                                // Optimize memory
                                geometry.attributes.position.needsUpdate = true;
                                geometry.attributes.normal.needsUpdate = true;
                                geometry.computeBoundingSphere();
                                geometry.computeBoundingBox();
                                
                                child.material = material;
                                child.matrixAutoUpdate = false;
                                child.frustumCulled = true;
                            }
                        });
                        console.log('OBJ loaded and optimized');
                        resolve(loadedObj);
                    },
                    null,
                    reject
                );
            });

            // Optimize scene
            this.scene.add(obj);
            obj.updateMatrix();
            obj.updateMatrixWorld(true);

            // Export with optimized settings
            return new Promise((resolve, reject) => {
                gltfExporter.parse(
                    this.scene,
                    (gltf) => {
                        this.scene.remove(obj);
                        const blob = new Blob([gltf], {
                            type: 'model/gltf-binary'
                        });
                        resolve(URL.createObjectURL(blob));
                    },
                    (error) => {
                        this.scene.remove(obj);
                        reject(error);
                    },
                    {
                        binary: true,
                        onlyVisible: true,
                        maxTextureSize: 256,
                        forceIndices: true,
                        includeCustomExtensions: false,
                        embedImages: false,
                        precision: 8,
                        indices: true,
                        dracoOptions: {
                            compressionLevel: 0,
                            quantizePosition: 14, // Higher precision for position
                            quantizeNormal: 10,   // Good enough for normals
                            quantizeColor: 8
                        }
                    }
                );
            });

        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        }
    }

    dispose() {
        this.scene.clear();
    }
}