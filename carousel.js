console.log('Carousel module loaded');

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isLowPowerDevice = navigator.hardwareConcurrency <= 4;
const isHighPowerDevice = navigator.hardwareConcurrency > 8;
const hasGoodGPU = 'gpu' in navigator;

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
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    let modelInteracting = false;

    function updateSlidePositions() {
        console.log('Updating positions, current index:', currentIndex);
        slides.forEach((slide, index) => {
            slide.classList.remove('prev-2', 'prev-1', 'current', 'next-1', 'next-2');
            const diff = index - currentIndex;
            const viewer = slide.querySelector('model-viewer');
            
            // Optimize for mobile
            if (isMobile || isLowPowerDevice) {
                // Only show current slide on mobile
                if (diff === 0) {
                    slide.classList.add('current');
                    if (viewer) {
                        viewer.style.display = 'block';
                        viewer.setAttribute('auto-rotate', '');
                        viewer.setAttribute('camera-controls', '');
                    }
                } else {
                    slide.style.opacity = '0';
                    if (viewer) {
                        viewer.style.display = 'none';
                        viewer.removeAttribute('auto-rotate');
                        viewer.removeAttribute('camera-controls');
                    }
                }
            } else {
                // Desktop behavior with performance optimizations
                if (diff === 0) {
                    slide.classList.add('current');
                    if (viewer) {
                        viewer.setAttribute('auto-rotate', '');
                        viewer.setAttribute('camera-controls', '');
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

    // Enhanced touch support
    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
        // Prevent page scroll while swiping
        if (Math.abs(touchEndX - touchStartX) > 10) {
            e.preventDefault();
        }
    }, { passive: false });

    track.addEventListener('touchend', e => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;
        
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        isSwiping = false;
    });

    // Model viewer interaction handling
    slides.forEach(slide => {
        const viewer = slide.querySelector('model-viewer');
        if (viewer) {
            viewer.addEventListener('camera-change', () => {
                modelInteracting = true;
                setTimeout(() => {
                    modelInteracting = false;
                }, 100);
            });

            viewer.addEventListener('mousedown', () => {
                modelInteracting = true;
            });

            viewer.addEventListener('mouseup', () => {
                setTimeout(() => {
                    modelInteracting = false;
                }, 100);
            });

            viewer.addEventListener('touchstart', () => {
                modelInteracting = true;
            });

            viewer.addEventListener('touchend', () => {
                setTimeout(() => {
                    modelInteracting = false;
                }, 100);
            });

            // Set GPU preferences and limits
            viewer.setAttribute('renderer', 'webgl');
            viewer.setAttribute('max-camera-orbit', '180deg 180deg 200%');
            
            // Limit high-end devices
            if (isHighPowerDevice) {
                viewer.setAttribute('max-field-of-view', '30deg');
                viewer.setAttribute('min-field-of-view', '25deg');
                viewer.setAttribute('interpolation-decay', '200');
                viewer.style.setProperty('--environment-intensity', '0.8');
                viewer.style.setProperty('--reflection-intensity', '0.7');
                limitFrameRate();
            }
            
            // Reduce quality on low-power devices
            if (isLowPowerDevice) {
                viewer.setAttribute('shadow-intensity', '0');
                viewer.style.setProperty('--environment-intensity', '0.5');
                viewer.style.setProperty('--reflection-intensity', '0.5');
            }

            // Optimize loading strategy
            viewer.addEventListener('load', () => {
                if (!slide.classList.contains('current')) {
                    viewer.removeAttribute('auto-rotate');
                    if (isMobile || isLowPowerDevice) {
                        viewer.style.display = 'none';
                    }
                }
                
                // Limit texture resolution
                if (isHighPowerDevice) {
                    viewer.style.setProperty('--max-texture-size', '1024');
                }
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
    if ('requestAnimationFrame' in window) {
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        let lastFrameTime = 0;

        function throttledRender(currentTime) {
            if (currentTime - lastFrameTime >= frameTime) {
                lastFrameTime = currentTime;
                // Your render code here
            }
            requestAnimationFrame(throttledRender);
        }

        requestAnimationFrame(throttledRender);
    }
}