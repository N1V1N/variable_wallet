import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { initializeCarousel } from './carousel.js';
import { OBJConverter } from './objConverter.js';

// Define model configurations
const modelConfigs = [
    {
        id: 'q1petg-model',
        name: 'Q1PETG',
        description: 'Entry Level Performance',
        materials: {
            sides: {
                color: new THREE.Color(0.15, 0.22, 0.18),
                metalness: 0.4,
                roughness: 0.35
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q2al-model',
        name: 'Q2Al',
        description: 'Aluminum Series 2',
        materials: {
            sides: {
                color: new THREE.Color(0.3, 0.3, 0.3),
                metalness: 0.9,
                roughness: 0.2
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q2ti-model',
        name: 'Q2Ti',
        description: 'Titanium Series 2',
        materials: {
            sides: {
                color: new THREE.Color(0.35, 0.37, 0.40),
                metalness: 0.95,
                roughness: 0.1
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q2da-model',
        name: 'Q2Da',
        description: 'Damascus Series 2',
        materials: {
            sides: {
                color: new THREE.Color(0.08, 0.08, 0.08),
                metalness: 0.9,
                roughness: 0.2
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q3al-model',  // Back to 5th position (index 4)
        name: 'Q3Al',
        description: 'Aluminum Series 3',
        materials: {
            sides: {
                color: new THREE.Color(0.3, 0.3, 0.3),
                metalness: 0.9,
                roughness: 0.2
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q3ti-model',
        name: 'Q3Ti',
        description: 'Titanium Series 3',
        materials: {
            sides: {
                color: new THREE.Color(0.35, 0.37, 0.40),
                metalness: 0.95,
                roughness: 0.1
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q3da-model',
        name: 'Q3Da',
        description: 'Damascus Series 3',
        materials: {
            sides: {
                color: new THREE.Color(0.08, 0.08, 0.08),
                metalness: 0.9,
                roughness: 0.2
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q3t-model',
        name: 'Q3T',
        description: 'Tungsten Series 3',
        materials: {
            sides: {
                color: new THREE.Color(0.325, 0.396, 0.325),
                metalness: 0.95,
                roughness: 0.1
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    },
    {
        id: 'q3g-model',
        name: 'Q3G',
        description: 'Gold Series 3',
        materials: {
            sides: {
                color: new THREE.Color(0.588, 0.294, 0.294),
                metalness: 0.9,
                roughness: 0.15
            },
            center: {
                color: new THREE.Color(0.6, 0.45, 0.12),
                metalness: 1.0,
                roughness: 0.2
            }
        }
    }
];

console.log('Three.js Version:', THREE.REVISION);

async function loadGLBModel(glbPath) {
    console.log('Loading GLB model:', glbPath);
    const response = await fetch(glbPath);
    const blob = await response.blob();
    return blob;
}

async function convertOBJtoGLB(objPath, config) {
    console.log('Starting conversion for', config.name);
    const scene = new THREE.Scene();
    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    try {
        // First load the MTL file
        console.log('Loading MTL file...');
        const materials = await new Promise((resolve, reject) => {
            mtlLoader.load(
                'VW.mtl',
                resolve,
                undefined,
                reject
            );
        });

        // Set materials path and preload
        materials.preload();
        loader.setMaterials(materials);

        console.log('Loading OBJ file...');
        const obj = await new Promise((resolve, reject) => {
            loader.load(
                objPath,
                (loadedObj) => {
                    console.log('OBJ loaded successfully, object structure:', loadedObj);
                    console.log('Number of children:', loadedObj.children.length);
                    loadedObj.children.forEach((child, index) => {
                        console.log(`Child ${index}:`, child);
                    });
                    resolve(loadedObj);
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('OBJ loading error:', error);
                    reject(error);
                }
            );
        });

        console.log('Setting up scene...');
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        scene.add(ambientLight);
        scene.add(directionalLight);

        console.log('Applying materials...');
        let meshIndex = 0;
        obj.traverse(child => {
            if (child instanceof THREE.Mesh) {
                console.log(`Applying material to mesh ${meshIndex}:`, child);
                const material = new THREE.MeshStandardMaterial(
                    meshIndex === 0 ? config.materials.center : config.materials.sides
                );
                child.material = material;
                meshIndex++;
            }
        });

        scene.add(obj);

        console.log('Converting to GLB...');
        const glbData = await new Promise((resolve, reject) => {
            const exporter = new THREE.GLTFExporter();
            exporter.parse(
                scene,
                (result) => {
                    console.log('GLB conversion successful, data size:', result.byteLength);
                    resolve(result);
                },
                (error) => {
                    console.error('GLB conversion failed:', error);
                    reject(error);
                },
                { binary: true }
            );
        });

        return glbData;
    } catch (error) {
        console.error('Detailed conversion error:', error);
        console.error('Error stack:', error.stack);
        return null;
    }
}

async function createModelSlide(config) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.cssText = `
        min-width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        perspective: 1000px;
    `;
    
    const portalFrame = document.createElement('div');
    portalFrame.style.cssText = `
        width: 90%;
        height: 90%;
        position: relative;
        border-radius: 8px;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent);
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        overflow: hidden;
        transform-style: preserve-3d;
    `;
    
    const viewer = document.createElement('model-viewer');
    viewer.id = config.id;
    viewer.alt = config.name;
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', 'true');
    viewer.setAttribute('rotation-per-second', '30deg');
    viewer.setAttribute('camera-orbit', '0deg 75deg 105%');
    viewer.setAttribute('exposure', '1');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.style.cssText = `
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        --poster-color: transparent;
        background: transparent;
    `;

    try {
        const converter = new OBJConverter();
        const material = new THREE.MeshStandardMaterial(config.materials.sides);
        const glbData = await converter.convertToGLB('VW.obj', material);
        viewer.src = converter.createURL(glbData);
    } catch (error) {
        console.error(`Error creating model for ${config.name}:`, error);
        viewer.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
    }

    portalFrame.appendChild(viewer);
    slide.appendChild(portalFrame);
    return slide;
}

export async function initializeModels() {
    console.log('Starting model initialization...');
    try {
        console.log('Creating carousel slides...');
        const track = document.querySelector('.carousel-track');
        
        if (!track) {
            console.error('Carousel track not found');
            return;
        }

        // Create slides for each model config
        for (const config of modelConfigs) {
            const slide = await createModelSlide(config);
            track.appendChild(slide);
            console.log(`Added slide for ${config.name}`);
        }

        // Create navigation markers
        const navContainer = document.querySelector('.carousel-navigation');
        navContainer.innerHTML = '';
        modelConfigs.forEach((_, index) => {
            const marker = document.createElement('div');
            marker.className = 'nav-marker';
            
            // Golden ratio-based dimensions
            const baseSize = 21;
            const goldenRatio = 1.618;
            
            marker.style.cssText = `
                width: ${baseSize}px;
                height: ${baseSize / goldenRatio}px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            // Create inner elements for layered effect
            const inner1 = document.createElement('div');
            const inner2 = document.createElement('div');
            
            inner1.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
                transform: rotate(45deg);
                transition: all 0.3s ease;
            `;
            
            inner2.style.cssText = `
                position: absolute;
                width: ${baseSize / goldenRatio}px;
                height: ${baseSize / (goldenRatio * goldenRatio)}px;
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(45deg);
                top: ${(baseSize - baseSize / goldenRatio) / 2}px;
                left: ${(baseSize - baseSize / goldenRatio) / 2}px;
                transition: all 0.3s ease;
            `;

            marker.appendChild(inner1);
            marker.appendChild(inner2);
            navContainer.appendChild(marker);
        });

        console.log('Initializing carousel...');
        initializeCarousel(4);
        console.log('Carousel initialization complete');
        
    } catch (error) {
        console.error('Error in initialization:', error);
        console.log('Error details:', error.stack);
    }
} 