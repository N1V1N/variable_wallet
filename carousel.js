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
                marker.style.transform = 'scale(1.2)';
                marker.style.borderBottomColor = 'rgba(0, 0, 0, 0.8)';
            } else {
                marker.style.transform = 'scale(1)';
                marker.style.borderBottomColor = 'rgba(0, 0, 0, 0.5)';
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

    // Initialize position
    updateSlidePosition();
}