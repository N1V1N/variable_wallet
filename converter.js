import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/exporters/GLTFExporter.js';
import { initializeCarousel } from './carousel.js';

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
    const scene = new THREE.Scene();
    const loader = new OBJLoader();
    
    try {
        // Basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        scene.add(ambientLight);
        scene.add(directionalLight);

        // Load model
        const obj = await new Promise((resolve, reject) => {
            loader.load(objPath, resolve, undefined, reject);
        });

        // Process each variant
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

        // Update carousel
        const container = document.querySelector('.carousel-container');
        container.innerHTML = '';
        models.forEach(model => {
            container.appendChild(createModelSlide(model));
        });

        // Update dots
        const dotsContainer = document.querySelector('.carousel-dots');
        dotsContainer.innerHTML = '';
        models.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `dot${index === 4 ? ' active' : ''}`;
            dotsContainer.appendChild(dot);
        });

        // Initialize carousel immediately
        initializeCarousel(4);
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

function createModelSlide(model) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const container = document.createElement('div');
    container.className = 'vw-model-container';
    
    const viewer = document.createElement('model-viewer');
    viewer.id = model.id;
    viewer.alt = model.name;
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('rotation-per-second', '30deg');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.setAttribute('exposure', '1.0');
    viewer.setAttribute('environment-intensity', '1.8');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('shadow-softness', '1');

    // Set source from blob
    const blob = new Blob([model.glbData], { type: 'model/gltf-binary' });
    viewer.src = URL.createObjectURL(blob);

    const info = document.createElement('div');
    info.className = 'model-info';
    info.innerHTML = `
        <h2>${model.name}</h2>
        <p>${model.description}</p>
    `;

    container.appendChild(viewer);
    container.appendChild(info);
    slide.appendChild(container);

    return slide;
}

export async function initializeModels() {
    console.log('Starting model initialization...');
    try {
        const success = await convertOBJtoGLB('VW.obj');
        console.log('Conversion result:', success);
        if (success) {
            console.log('Setting up carousel...');
            const container = document.querySelector('.carousel-container');
            const slides = document.querySelectorAll('.carousel-slide');
            console.log(`Found ${slides.length} slides`);
            initializeCarousel(4); // Start at index 4 (Q3Al)
            console.log('Carousel initialized');
        }
    } catch (error) {
        console.error('Error in initialization:', error);
    }
} 