console.log('Carousel module loaded');

import { CoreLimiter } from './core-limiter.js';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isLowPowerDevice = navigator.hardwareConcurrency <= 4;
const isHighPowerDevice = navigator.hardwareConcurrency > 8;
const hasGoodGPU = 'gpu' in navigator;
const MAX_FPS = 30;
const ANIMATION_INTERVAL = 1000 / MAX_FPS;
const FRAME_BUDGET = 33.33; // 30fps budget in ms
const ANIMATION_DECAY = 400;  // Slower animations
const INTERACTION_DELAY = 200;  // Increased interaction delay
let lastFrameTime = 0;
let rafId = null;

export function initializeCarousel(startIndex = 0) {
    console.log('Starting carousel initialization...');
    
    const track = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    const slides = document.querySelectorAll('.carousel-slide');
    const slideCount = slides.length;
    
    console.log('Initial carousel state:', {
        track,
        slides: Array.from(slides).map(slide => ({
            classList: Array.from(slide.classList),
            dimensions: {
                width: slide.offsetWidth,
                height: slide.offsetHeight
            },
            styles: window.getComputedStyle(slide)
        }))
    });
    
    if (!track || !slides.length) return;
    
    let currentIndex = startIndex;
    let modelInteracting = false;

    function updateSlidePositions() {
        const isAnimationEnabled = document.getElementById('animationToggle').checked;
        
        console.log('Updating positions, current index:', currentIndex);
        slides.forEach((slide, index) => {
            slide.classList.remove('prev-2', 'prev-1', 'current', 'next-1', 'next-2');
            const diff = index - currentIndex;
            const viewer = slide.querySelector('model-viewer');
            
            // Update the mobile optimization section in updateSlidePositions()
            if (isMobile || isLowPowerDevice) {
                // Keep all slides in DOM but optimize non-visible ones
                if (diff === 0) {
                    // Current slide
                    slide.classList.add('current');
                    slide.style.opacity = '1';
                    slide.style.visibility = 'visible';
                    if (viewer) {
                        viewer.style.display = 'block';
                        viewer.style.visibility = 'visible';
                        
                        // Check animation toggle state for mobile too
                        if (isAnimationEnabled) {
                            viewer.setAttribute('auto-rotate', '');
                            viewer.setAttribute('camera-controls', '');
                            viewer.setAttribute('interaction-prompt', 'auto');
                            viewer.style.pointerEvents = 'auto';
                        } else {
                            // Keep locked state on mobile
                            viewer.removeAttribute('auto-rotate');
                            viewer.removeAttribute('camera-controls');
                            viewer.setAttribute('interaction-prompt', 'none');
                            viewer.style.pointerEvents = 'none';
                            viewer.setAttribute('camera-orbit', '45deg 55deg 100%');
                            viewer.setAttribute('camera-target', '0m 0m 0m');
                            viewer.setAttribute('field-of-view', '30deg');
                            viewer.setAttribute('exposure', '0.7');
                            viewer.style.setProperty('--environment-intensity', '0.5');
                            viewer.style.setProperty('--reflection-intensity', '0.3');
                            viewer.setAttribute('shadow-intensity', '0.4');
                        }
                    }
                } else {
                    // Off-screen slides
                    slide.style.opacity = '0';
                    slide.style.visibility = 'hidden';
                    if (viewer) {
                        viewer.style.display = 'block';
                        viewer.removeAttribute('auto-rotate');
                        viewer.removeAttribute('camera-controls');
                        viewer.setAttribute('interaction-prompt', 'none');
                        viewer.style.pointerEvents = 'none';
                        
                        // Keep the same locked position for non-visible slides
                        if (!isAnimationEnabled) {
                            viewer.setAttribute('camera-orbit', '45deg 55deg 100%');
                            viewer.setAttribute('camera-target', '0m 0m 0m');
                            viewer.setAttribute('field-of-view', '30deg');
                            viewer.setAttribute('exposure', '0.7');
                            viewer.style.setProperty('--environment-intensity', '0.5');
                            viewer.style.setProperty('--reflection-intensity', '0.3');
                            viewer.setAttribute('shadow-intensity', '0.4');
                        }
                    }
                }
            } else {
                // Desktop behavior with performance optimizations
                if (diff === 0) {
                    slide.classList.add('current');
                    if (viewer) {
                        // Only enable controls if animations are enabled
                        if (isAnimationEnabled) {
                            viewer.setAttribute('auto-rotate', '');
                            viewer.setAttribute('camera-controls', '');
                            viewer.setAttribute('interaction-prompt', 'auto');
                            viewer.style.pointerEvents = 'auto';
                        } else {
                            // Keep the locked state
                            viewer.removeAttribute('auto-rotate');
                            viewer.removeAttribute('camera-controls');
                            viewer.setAttribute('interaction-prompt', 'none');
                            viewer.style.pointerEvents = 'none';
                            viewer.setAttribute('camera-orbit', '45deg 55deg 100%');
                            viewer.setAttribute('camera-target', '0m 0m 0m');
                            viewer.setAttribute('field-of-view', '30deg');
                            viewer.setAttribute('exposure', '0.7');
                            viewer.style.setProperty('--environment-intensity', '0.5');
                            viewer.style.setProperty('--reflection-intensity', '0.3');
                            viewer.setAttribute('shadow-intensity', '0.4');
                        }
                    }
                } else if (diff === 1 || diff === -slideCount + 1) {
                    slide.classList.add('next-1');
                    if (viewer) {
                        viewer.removeAttribute('auto-rotate');
                    }
                } else if (diff === -1 || diff === slideCount - 1) {
                    slide.classList.add('prev-1');
                    if (viewer) {
                        viewer.removeAttribute('auto-rotate');
                    }
                }
                
                // Completely disable far slides
                if (Math.abs(diff) > 1) {
                    if (viewer) {
                        viewer.style.display = 'none';
                    }
                } else {
                    if (viewer) {
                        viewer.style.display = 'block';
                    }
                }
            }
        });
        
        // Log all slide states after update
        console.log('Slide states after update:', Array.from(slides).map((slide, i) => ({
            index: i,
            classes: Array.from(slide.classList),
            opacity: window.getComputedStyle(slide).opacity,
            transform: window.getComputedStyle(slide).transform
        })));

        // Update navigation markers
        const markers = document.querySelectorAll('.nav-marker');
        markers.forEach((marker, index) => {
            marker.classList.toggle('active', index === currentIndex);
        });

        // Update model-viewer interaction state
        slides.forEach(slide => {
            const viewer = slide.querySelector('model-viewer');
            if (viewer) {
                if (slide.classList.contains('current')) {
                    viewer.style.pointerEvents = 'auto';
                } else {
                    viewer.style.pointerEvents = 'none';
                }
            }
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        updateSlidePositions();
    }

    function nextSlide() {
        if (!modelInteracting) {
            goToSlide(currentIndex + 1);
        }
    }

    function prevSlide() {
        if (!modelInteracting) {
            goToSlide(currentIndex - 1);
        }
    }

    // Event listeners
    prevButton?.addEventListener('click', prevSlide);
    nextButton?.addEventListener('click', nextSlide);

    // Add click listeners to markers
    const markers = document.querySelectorAll('.nav-marker');
    markers.forEach((marker, index) => {
        marker.addEventListener('click', () => goToSlide(index));
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Model viewer interaction handling
    slides.forEach(slide => {
        const viewer = slide.querySelector('model-viewer');
        if (viewer) {
            // Keep our working base settings
            viewer.setAttribute('camera-controls', '');
            viewer.setAttribute('auto-rotate', '');
            viewer.setAttribute('exposure', '1');
            viewer.setAttribute('shadow-intensity', '0.7');  // Slightly reduced shadows
            
            // Add back safe optimizations
            viewer.setAttribute('loading', 'lazy');  // Load models only when needed
            viewer.setAttribute('camera-orbit-sensitivity', '0.5');  // Smoother controls
            viewer.setAttribute('rotation-per-second', '30deg');  // Controlled rotation speed
            
            // Gentle environment adjustments
            viewer.style.setProperty('--environment-intensity', '0.8');
            viewer.style.setProperty('--reflection-intensity', '0.6');
            
            // Keep visibility settings
            viewer.style.display = 'block';
            viewer.style.visibility = 'visible';
            viewer.style.opacity = '1';

            // Performance settings for high-end devices only
            if (isHighPowerDevice) {
                viewer.setAttribute('max-field-of-view', '30deg');
                viewer.setAttribute('min-field-of-view', '25deg');
            }

            // Add CPU-focused optimizations
            viewer.setAttribute('interpolation-decay', ANIMATION_DECAY);
            viewer.setAttribute('interaction-prompt-threshold', '2000');  // Delay prompts
            
            // Batch camera updates
            viewer.addEventListener('camera-change', () => {
                modelInteracting = true;
                batchUpdate(() => {
                    modelInteracting = false;
                });
            });

            // Batch interaction updates
            let interactionTimeout;
            viewer.addEventListener('mousedown', () => {
                modelInteracting = true;
                clearTimeout(interactionTimeout);
            });

            viewer.addEventListener('mouseup', () => {
                clearTimeout(interactionTimeout);
                interactionTimeout = setTimeout(() => {
                    batchUpdate(() => {
                        modelInteracting = false;
                    });
                }, INTERACTION_DELAY);
            });
        }
    });

    // Initialize position
    updateSlidePositions();
    console.log('Carousel initialization complete');

    // Update the visibility change listener
    document.addEventListener('visibilitychange', () => {
        const viewers = document.querySelectorAll('model-viewer');
        const currentSlide = document.querySelector('.carousel-slide:nth-child(' + (currentIndex + 1) + ')');
        viewers.forEach(viewer => {
            if (document.hidden) {
                viewer.removeAttribute('auto-rotate');
                viewer.setAttribute('loading', 'lazy');
            } else {
                if (viewer.closest('.carousel-slide') === currentSlide) {
                    viewer.setAttribute('auto-rotate', '');
                    viewer.setAttribute('loading', 'eager');
                }
            }
        });
    });

    // Clean up when page unloads
    window.addEventListener('unload', () => {
        CoreLimiter.cleanup();
    });
}

function updateSlidePositions(currentIndex) {
    console.log('Updating slide positions, current index:', currentIndex);
    const slides = document.querySelectorAll('.carousel-slide');
    console.log('Found slides:', slides.length);
    
    slides.forEach((slide, index) => {
        slide.classList.remove('prev-2', 'prev-1', 'current', 'next-1', 'next-2');
        const diff = index - currentIndex;
        console.log(`Slide ${index}, diff: ${diff}`);
        
        if (diff === -2) slide.classList.add('prev-2');
        else if (diff === -1) slide.classList.add('prev-1');
        else if (diff === 0) slide.classList.add('current');
        else if (diff === 1) slide.classList.add('next-1');
        else if (diff === 2) slide.classList.add('next-2');
    });
}

function limitFrameRate() {
    let lastFrameTime = 0;
    let rafId;

    function frameLimit(timestamp) {
        if (timestamp - lastFrameTime < ANIMATION_INTERVAL) {
            rafId = requestAnimationFrame(frameLimit);
            return;
        }
        lastFrameTime = timestamp;
        rafId = requestAnimationFrame(frameLimit);
    }

    frameLimit(0);

    // Cleanup when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            frameLimit(0);
        }
    });
}

// Replace requestAnimationFrameThrottled with:
function requestAnimationFrameThrottled(callback) {
    // Always use CoreLimiter to force single-core
    return CoreLimiter.requestFrame((timestamp) => {
        if (timestamp - lastFrameTime < FRAME_BUDGET) {
            return;
        }
        lastFrameTime = timestamp;
        callback(timestamp);
    });
}

// Update animation handling
function updateAnimations() {
    if (document.hidden) return;
    
    batchUpdate(() => {
        // Your animation code here
        updateAnimations();
    });
}

// Clean up when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(rafId);
    } else {
        updateAnimations();
    }
});

// Optimize matrix effect
function createMatrixEffect() {
    const title = document.querySelector('.title');
    const chars = '0123456789ABCDEF';
    const numChars = 3;  // Further reduced
    
    for (let i = 0; i < numChars; i++) {
        const char = document.createElement('span');
        char.className = 'matrix-char';
        char.style.left = `${Math.random() * 100}%`;
        char.style.top = `${Math.random() * 100}%`;
        char.style.animationDelay = `${Math.random() * 4}s`;
        
        // Batch character updates
        setInterval(() => {
            batchUpdate(() => {
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
            });
        }, 800);  // Increased delay

        title.appendChild(char);
    }
}

// Add this new function for batched updates
function batchUpdate(callback) {
    if (document.hidden) return;
    
    requestIdleCallback(() => {
        CoreLimiter.requestFrame(callback);
    }, { timeout: 100 });
}