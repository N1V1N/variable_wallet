export function initializeCarousel(startIndex = 0) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const navContainer = document.querySelector('.carousel-navigation');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    
    if (!track || !slides.length) {
        console.error('Carousel elements not found');
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
            const inner1 = marker.children[0];
            const inner2 = marker.children[1];
            if (index === currentIndex) {
                inner1.style.transform = 'rotate(45deg) scale(1.2)';
                inner2.style.transform = 'rotate(45deg) scale(1.3)';
                inner1.style.background = 'rgba(255, 255, 255, 0.2)';
                inner2.style.background = 'rgba(255, 255, 255, 0.3)';
            } else {
                inner1.style.transform = 'rotate(45deg) scale(1)';
                inner2.style.transform = 'rotate(45deg) scale(1)';
                inner1.style.background = 'rgba(255, 255, 255, 0.1)';
                inner2.style.background = 'rgba(255, 255, 255, 0.2)';
            }
        });
    }

    // Navigation functions
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

    // Event listeners
    prevButton?.addEventListener('click', prevSlide);
    nextButton?.addEventListener('click', nextSlide);

    // Initialize position
    updateSlidePosition();
} 