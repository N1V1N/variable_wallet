console.log('Carousel module loaded');

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
            
            // Handle wrapping around
            if (diff === 0) {
                slide.classList.add('current');
                console.log('Set current slide:', index, 'opacity:', window.getComputedStyle(slide).opacity);
            } else if (diff === 1 || diff === -slideCount + 1) {
                slide.classList.add('next-1');
                console.log('Set next-1 slide:', index, 'opacity:', window.getComputedStyle(slide).opacity);
            } else if (diff === 2 || diff === -slideCount + 2) {
                slide.classList.add('next-2');
            } else if (diff === -1 || diff === slideCount - 1) {
                slide.classList.add('prev-1');
                console.log('Set prev-1 slide:', index, 'opacity:', window.getComputedStyle(slide).opacity);
            } else if (diff === -2 || diff === slideCount - 2) {
                slide.classList.add('prev-2');
            }
            
            // Force reflow to ensure opacity transition
            slide.offsetHeight;
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