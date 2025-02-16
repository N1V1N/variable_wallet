console.log('Converter module loading...');

import { THREE, objLoader, mtlLoader, gltfExporter, scene } from './three-instance.js';
import { initializeCarousel } from './carousel.js';
import { OBJConverter } from './objConverter.js';

console.log('Imports completed in converter.js');

// Define model configurations
const modelConfigs = [
    {
        id: 'q1petg-model',
        name: 'Q1PETG',
        description: "We'll find a good plastic someday!",
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
        description: 'Aluminum Quality 2',
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
        description: 'Titanium Quality 2',
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
        description: 'Damascus Quality 2',
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
        id: 'q3al-model',
        name: 'Q3Al',
        description: 'Aluminum Quality 3',
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
        description: 'Titanium Quality 3',
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
        description: 'Damascus Quality 3',
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
        description: 'Tungsten Quality 3',
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
        description: 'Gold Quality 3',
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

// Cache GLB URL to prevent multiple conversions
let cachedGLBUrl = null;

async function convertModelOnce(material) {
    if (cachedGLBUrl) {
        console.log('Using cached GLB URL');
        return cachedGLBUrl;
    }

    console.log('Converting master OBJ to GLB...');
    try {
        const converter = new OBJConverter();
        console.log('Created OBJConverter instance');
        
        // Verify the file exists first
        const response = await fetch('VW.obj');  // Remove '../assets/' directory
        if (!response.ok) {
            console.error('Failed to fetch OBJ file:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            throw new Error(`Failed to fetch OBJ file: ${response.status} ${response.statusText}`);
        }
        console.log('OBJ file exists and is accessible');
        
        const url = await converter.convertToGLB('VW.obj', material);
        if (!url) {
            console.error('GLB conversion failed - no URL returned');
            throw new Error('GLB conversion failed');
        }
        console.log('Got URL from converter:', url.substring(0, 100) + '...');  // Log first 100 chars of URL
        cachedGLBUrl = url;
        console.log('Master GLB conversion complete');
        return url;
    } catch (error) {
        console.error('Detailed error in convertModelOnce:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
        });
        throw error;
    }
}

async function createModelSlide(config) {
    // Create slide elements
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.cssText = `
        min-width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        perspective: 1000px;
    `;

    // Add title and description container
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
        position: absolute;
        top: 20px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 2;
    `;

    const title = document.createElement('h2');
    title.textContent = config.name;
    title.style.cssText = `
        font-family: 'Rajdhani', sans-serif;
        font-size: 1.4em;
        color: rgba(255, 255, 255, 0.95);
        margin: 0;
        text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
        letter-spacing: 0.2em;
        font-weight: 400;
        text-transform: uppercase;
        -webkit-font-smoothing: antialiased;
    `;

    const description = document.createElement('p');
    description.textContent = config.description;
    description.style.cssText = `
        font-family: 'Crimson Text', serif;
        font-size: 1.2em;
        color: rgba(255, 255, 255, 0.7);
        margin: 10px 0 0 0;
        font-style: italic;
    `;

    textContainer.appendChild(title);
    textContainer.appendChild(description);
    slide.appendChild(textContainer);
    
    const viewer = document.createElement('model-viewer');
    viewer.id = config.id;
    viewer.alt = config.name;
    viewer.setAttribute('camera-controls', 'true');
    viewer.setAttribute('auto-rotate', 'true');
    viewer.setAttribute('disable-tap', '');
    viewer.setAttribute('rotation-per-second', '30deg');
    viewer.setAttribute('camera-orbit', '0deg 75deg 105%');
    viewer.setAttribute('min-field-of-view', '45deg');
    viewer.setAttribute('max-field-of-view', '45deg');
    viewer.setAttribute('exposure', '1');
    viewer.setAttribute('shadow-intensity', '0');
    viewer.setAttribute('shadow-softness', '0');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.setAttribute('environment-intensity', '1');
    viewer.setAttribute('interaction-prompt', 'none');
    viewer.setAttribute('max-pixels', '1024');
    viewer.setAttribute('render-scale', '0.75');
    viewer.setAttribute('camera-target', '0 0 0');
    viewer.setAttribute('min-camera-orbit', 'auto auto 50%');
    viewer.setAttribute('max-camera-orbit', 'auto auto 150%');
    viewer.setAttribute('interaction-policy', 'allow-when-focused');
    viewer.setAttribute('tone-mapping', 'reinhard');
    viewer.style.cssText = `
        width: 100%;
        height: 100%;
        --poster-color: transparent;
        background: transparent;
    `;

    slide.appendChild(viewer);
    
    try {
        console.log(`Starting material setup for ${config.name}`);
        // Create a single material for the entire model
        const material = new THREE.MeshStandardMaterial({
            ...config.materials.sides,
            side: THREE.DoubleSide,
            flatShading: false,
            vertexColors: false,
            transparent: false
        });

        console.log(`Getting GLB URL for ${config.name}`);
        const url = await convertModelOnce(material);
        console.log(`Setting src for ${config.name}`);

        // Create a promise that resolves after a timeout or model load
        const loadPromise = new Promise((resolve, reject) => {
            console.log(`Setting up load listeners for ${config.name}`);
            
            // Set a timeout of 5 seconds
            const timeoutId = setTimeout(() => {
                console.log(`Timeout reached for ${config.name}, continuing anyway`);
                resolve();
            }, 5000);

            viewer.addEventListener('load', () => {
                console.log(`Model loaded for ${config.name}`);
                clearTimeout(timeoutId);
                resolve();
            }, { once: true });

            viewer.addEventListener('error', (error) => {
                console.error(`Model load error for ${config.name}:`, error);
                clearTimeout(timeoutId);
                // Resolve instead of reject to continue loading
                resolve();
            }, { once: true });
        });

        viewer.src = url;

        // Add GPU optimization
        scene.matrixAutoUpdate = false;
        scene.autoUpdate = false;

        return { slide, loadPromise };
    } catch (error) {
        console.error(`Error creating model for ${config.name}:`, error);
        viewer.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
        return { slide, loadPromise: Promise.resolve() };
    }
}

export async function initializeModels() {
    console.log('Starting model initialization...');
    try {
        const track = document.querySelector('.carousel-track');
        
        if (!track) {
            console.error('Carousel track not found');
            return false;
        }

        // Create all slides first and add them to DOM
        const slidePromises = modelConfigs.map(async (config, index) => {
            console.log(`Creating slide ${index + 1}/${modelConfigs.length} for ${config.name}...`);
            const { slide, loadPromise } = await createModelSlide(config);
            console.log(`Slide created for ${config.name}, adding to track...`);
            track.appendChild(slide);
            return loadPromise;
        });

        try {
            console.log('Starting Promise.all for slide loading');
            await Promise.all(slidePromises);
            console.log('All slides loaded successfully');
        } catch (error) {
            console.error('Error during slide loading:', error);
            throw error;
        }
        
        // Create navigation markers
        console.log('Creating navigation markers...');
        const navContainer = document.querySelector('.carousel-navigation');
        navContainer.innerHTML = '';  // Clear existing markers
        modelConfigs.forEach((_, index) => {
            const marker = document.createElement('div');
            marker.className = 'nav-marker';
            // Add initial styles
            marker.style.background = index === 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
            marker.style.transform = index === 0 ? 'rotate(180deg) scale(1.2)' : 'rotate(180deg)';
            navContainer.appendChild(marker);
        });
        
        // Initialize carousel
        console.log('About to initialize carousel with slides:', document.querySelectorAll('.carousel-slide').length);
        initializeCarousel(4);  // Start at Q3Al
        console.log('Carousel initialization complete');
        return true;
    } catch (error) {
        console.error('Detailed initialization error:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}