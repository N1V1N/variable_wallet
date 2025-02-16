console.log('Carousel module loaded');

export function initializeCarousel(startIndex = 0) {
    console.log('Starting carousel initialization...');
    
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const navContainer = document.querySelector('.carousel-navigation');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    
    console.log('Found elements:', {
        track: track?.className,
        slides: slides?.length,
        navContainer: navContainer?.className,
        prevButton: prevButton?.className,
        nextButton: nextButton?.className,
        markers: document.querySelectorAll('.nav-marker')?.length
    });

    if (!track || !slides.length) {
        console.error('Carousel elements not found:', {
            trackFound: !!track,
            slidesLength: slides.length
        });
        return;
    }

    let currentIndex = startIndex;
    const slideCount = slides.length;

    function updateSlidePosition() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update slides
        slides.forEach((slide, index) => {
            const viewer = slide.querySelector('model-viewer');
            if (viewer) {
                if (index === currentIndex) {
                    viewer.setAttribute('auto-rotate', '');
                } else {
                    viewer.removeAttribute('auto-rotate');
                }
            }
        });

        // Update navigation markers
        const markers = document.querySelectorAll('.nav-marker');
        markers.forEach((marker, index) => {
            if (index === currentIndex) {
                marker.classList.add('active');
                marker.style.background = 'rgba(255, 255, 255, 0.4)';
                marker.style.transform = 'rotate(180deg) scale(1.2)';
            } else {
                marker.classList.remove('active');
                marker.style.background = 'rgba(255, 255, 255, 0.15)';
                marker.style.transform = 'rotate(180deg)';
            }
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlidePosition();
    }

    function nextSlide() {
        if (currentIndex < slideCount - 1) {
            currentIndex++;
            updateSlidePosition();
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
        }
    }

    // Event listeners for navigation buttons
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);

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

    // Add touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            nextSlide();
        }
        if (touchStartX - touchEndX < -50) {
            prevSlide();
        }
    });

    // Initialize position
    updateSlidePosition();

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