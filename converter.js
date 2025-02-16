import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OBJLoader } from 'https://unpkg.com/three@0.157.0/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from 'https://unpkg.com/three@0.157.0/examples/jsm/exporters/GLTFExporter.js';
import { initializeCarousel } from './carousel.js';

// Make sure THREE is available globally
window.THREE = THREE;

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

async function convertOBJtoGLB(objPath) {
    console.log('Starting OBJ to GLB conversion...');
    
    // Wait a moment for DOM to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const track = document.querySelector('.carousel-track');
    const navContainer = document.querySelector('.carousel-navigation');
    
    if (!track || !navContainer) {
        console.error('Required elements not found:');
        console.log('Track:', track);
        console.log('Navigation:', navContainer);
        return false;
    }
    
    const scene = new THREE.Scene();
    const loader = new OBJLoader();
    
    try {
        // Basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        scene.add(ambientLight);
        scene.add(directionalLight);

        console.log('Loading OBJ file:', objPath);
        const obj = await new Promise((resolve, reject) => {
            loader.load(objPath, resolve, undefined, reject);
        });
        console.log('OBJ loaded successfully');

        console.log('Processing model variants...');
        const models = await Promise.all(modelConfigs.map(async config => {
            const modelCopy = obj.clone();
            let meshIndex = 0;

            modelCopy.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    const material = new THREE.MeshStandardMaterial(
                        meshIndex === 0 ? config.materials.center : config.materials.sides
                    );
                    child.material = material;
                    meshIndex++;
                }
            });

            const modelScene = new THREE.Scene();
            modelScene.add(modelCopy);

            const glbData = await new Promise(resolve => {
                const exporter = new GLTFExporter();
                exporter.parse(modelScene, resolve, { binary: true });
            });

            return { id: config.id, name: config.name, description: config.description, glbData };
        }));
        console.log(`Processed ${models.length} model variants`);

        console.log('Updating carousel track...');
        track.innerHTML = '';
        models.forEach(model => {
            const slide = createModelSlide(model);
            track.appendChild(slide);
            console.log(`Added slide for model: ${model.id}`);
        });

        console.log('Creating navigation markers...');
        navContainer.innerHTML = '';
        models.forEach((_, index) => {
            const marker = document.createElement('div');
            marker.className = 'nav-marker';
            
            // Golden ratio-based dimensions
            const baseSize = 21; // Fibonacci number
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

        // Initialize carousel immediately
        initializeCarousel(4);
        return true;
    } catch (error) {
        console.error('Error in convertOBJtoGLB:', error);
        return false;
    }
}

function createModelSlide(model) {
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
    viewer.id = model.id;
    viewer.alt = model.name;
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', 'false');
    viewer.setAttribute('rotation-per-second', '30deg');
    viewer.style.cssText = 'width: 100%; height: 100%; transform-style: preserve-3d;';
    
    // Set source from blob
    const blob = new Blob([model.glbData], { type: 'model/gltf-binary' });
    viewer.src = URL.createObjectURL(blob);

    portalFrame.appendChild(viewer);
    slide.appendChild(portalFrame);

    return slide;
}

export async function initializeModels() {
    console.log('Starting model initialization...');
    try {
        console.log('Converting OBJ to GLB...');
        const success = await convertOBJtoGLB('VW.obj');
        console.log('Conversion result:', success);
        
        if (success) {
            console.log('Checking carousel elements...');
            const track = document.querySelector('.carousel-track');
            console.log('Track element:', track);
            
            const slides = document.querySelectorAll('.carousel-slide');
            console.log('Found slides:', slides.length);
            
            if (!track || !slides.length) {
                console.error('Carousel structure not found');
                console.log('Track:', track);
                console.log('Slides:', slides);
                return;
            }
            
            console.log('Initializing carousel with slides...');
            initializeCarousel(4);
            console.log('Carousel initialization complete');
        }
    } catch (error) {
        console.error('Error in initialization:', error);
        console.log('Error details:', error.stack);
    }
} 