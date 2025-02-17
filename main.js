import { initializeCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Loading screen handler
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            document.getElementById('main-content').style.display = 'block';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 1500);
    });

    // Initialize carousel
    initializeCarousel(3);

    // Model viewer interaction setup and logging
    document.querySelectorAll('model-viewer').forEach((viewer, index) => {
        // Click rotation handler
        viewer.addEventListener('click', (event) => {
            if (event.button === 0) { // Left click only
                const currentRotation = viewer.getCameraOrbit();
                const targetRotation = {
                    theta: currentRotation.theta + Math.PI,
                    phi: currentRotation.phi,
                    radius: currentRotation.radius
                };
                viewer.cameraOrbit = `${targetRotation.theta}rad ${targetRotation.phi}rad ${targetRotation.radius}m`;
            }
        });

        // Loading and error handlers
        viewer.addEventListener('error', (error) => {
            console.warn(`Model Viewer ${index} error:`, error);
            // Don't try to dismiss or reset - just log the error
        });
        
        viewer.addEventListener('load', () => {
            console.log(`Model ${index} loaded successfully`);
            viewer.style.opacity = '1';  // Ensure model is visible when loaded
        });

        viewer.addEventListener('loading', event => {
            if (event.detail) {
                const progress = Math.round(event.detail.totalProgress * 100);
                console.log(`Model ${index} loading progress: ${progress}%`);
            }
        });

        // Ensure model is visible
        viewer.style.opacity = '1';
        viewer.style.visibility = 'visible';
    });

    // Add this after your existing code
    document.getElementById('toggleMobilePreview').addEventListener('click', () => {
        const mobileFrame = document.getElementById('mobile-frame');
        const mainContent = document.getElementById('main-content');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (mobileFrame.classList.contains('hidden')) {
            // Show mobile preview
            mobileFrame.classList.remove('hidden');
            const mobileContent = mainContent.cloneNode(true);
            mobileFrame.querySelector('.mobile-frame-content').innerHTML = '';
            mobileFrame.querySelector('.mobile-frame-content').appendChild(mobileContent);
        } else {
            // Hide mobile preview
            mobileFrame.classList.add('hidden');
        }
    });

    // Add after your existing code
    function createMatrixEffect() {
        const title = document.querySelector('.title');
        const chars = '0123456789ABCDEF';
        const numChars = 10;

        for (let i = 0; i < numChars; i++) {
            const char = document.createElement('span');
            char.className = 'matrix-char';
            char.style.left = `${Math.random() * 100}%`;
            char.style.top = `${Math.random() * 100}%`;
            char.style.animationDelay = `${Math.random() * 4}s`;
            
            setInterval(() => {
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
            }, 200);

            title.appendChild(char);
        }
    }

    createMatrixEffect();

    // Add this to your existing DOMContentLoaded event listener
    const animationToggle = document.getElementById('animationToggle');
    
    animationToggle.addEventListener('change', () => {
        const viewers = document.querySelectorAll('model-viewer');
        viewers.forEach(viewer => {
            if (animationToggle.checked) {
                // Re-enable all animations and interactions
                if (viewer.closest('.carousel-slide.current')) {
                    viewer.setAttribute('auto-rotate', '');
                    viewer.setAttribute('camera-controls', '');
                    viewer.setAttribute('interaction-prompt', 'auto');
                    viewer.style.pointerEvents = 'auto';
                }
            } else {
                // Disable all animations and interactions
                viewer.removeAttribute('auto-rotate');
                viewer.removeAttribute('camera-controls');
                viewer.setAttribute('interaction-prompt', 'none');
                viewer.style.pointerEvents = 'none';
                // Set a cool fixed position
                viewer.setAttribute('camera-orbit', '45deg 55deg 100%');
                viewer.setAttribute('camera-target', '0m 0m 0m');
                viewer.setAttribute('field-of-view', '30deg');
            }
        });

        // Also toggle the matrix effect and scan line
        const title = document.querySelector('.title');
        const body = document.querySelector('body');
        if (!animationToggle.checked) {
            // Pause all CSS animations
            document.body.style.setProperty('--animation-state', 'paused');
            title.querySelectorAll('.matrix-char').forEach(char => {
                char.style.animationPlayState = 'paused';
            });
            body.style.setProperty('animation-play-state', 'paused');
        } else {
            // Resume all CSS animations
            document.body.style.setProperty('--animation-state', 'running');
            title.querySelectorAll('.matrix-char').forEach(char => {
                char.style.animationPlayState = 'running';
            });
            body.style.setProperty('animation-play-state', 'running');
        }
    });
}); 