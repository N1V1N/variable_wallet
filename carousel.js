export function initializeCarousel(startIndex = 0) {
    // Get fresh references to DOM elements
    const container = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    
    if (!container || !slides.length) {
        console.error('Carousel elements not found');
        return;
    }

    let currentIndex = startIndex;
    const slideCount = slides.length;

    function updateCarouselPosition(skipAnimation = false) {
        if (skipAnimation) {
            container.style.transition = 'none';
        }
        
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        if (skipAnimation) {
            container.offsetHeight; // Force reflow
            container.style.transition = 'transform 0.5s ease-in-out';
        }

        // Update dots and accessibility
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
            dot.setAttribute('aria-selected', index === currentIndex);
        });

        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== currentIndex);
            
            // Pause/play auto-rotation based on visibility
            const viewer = slide.querySelector('model-viewer');
            if (viewer) {
                if (index === currentIndex) {
                    viewer.setAttribute('auto-rotate', '');
                } else {
                    viewer.removeAttribute('auto-rotate');
                }
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        updateCarouselPosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateCarouselPosition();
    }

    // Event Listeners
    prevButton?.addEventListener('click', prevSlide);
    nextButton?.addEventListener('click', nextSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarouselPosition();
        });
    });

    // Touch handling
    let touchStartX = 0;
    let touchStartY = 0;

    container.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });

    container.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
            if (diffX > 0) nextSlide();
            else prevSlide();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });

    // Initialize position immediately
    updateCarouselPosition(true);
    
    // Log initialization
    console.log(`Carousel initialized with ${slideCount} slides`);
} 