// Disable browser's automatic scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // Always scroll to top on page load/refresh (with a slight delay to ensure it works)
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });
    }, 0);
    
    // Reset any hash in the URL without causing a page jump
    if (window.location.hash) {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }

    // Image paths in order - Only use the numbered PNG files
    const imagePaths = [
        'images/variable_wallet_1.png',
        'images/variable_wallet_2.png',
        'images/variable_wallet_3.png',
        'images/variable_wallet_4.png',
        'images/variable_wallet_5.png',
        'images/variable_wallet_6.png',
        'images/variable_wallet_7.png'
    ];
    
    // Preload all images at the start for instant response
    const preloadAllImages = () => {
        imagePaths.forEach(path => {
            const img = new Image();
            img.src = path + '?t=' + Date.now();
        });
    };
    
    // Start preloading all images immediately
    preloadAllImages();
    
    // Always bouncing animation, always start with variable_wallet_1
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        const img = heroImage.querySelector('img');
        
        // Always start with variable_wallet_1 (index 0)
        let currentImageIndex = 0;
        
        if (img) {
            // Always set the initial image to variable_wallet_1
            // Add a cache-busting parameter to ensure the image is not cached
            img.src = imagePaths[currentImageIndex] + '?t=' + new Date().getTime();
        }
        
        // Start with continuous bounce animation
        heroImage.classList.add('subtle-bounce-animation');
        
        // Get navigation elements
        const navLeft = heroImage.querySelector('.nav-left');
        const navRight = heroImage.querySelector('.nav-right');
        
        // Pause animation when scrolling away from the hero section and resume when scrolling back
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element is in view - enable animation
                    heroImage.classList.add('subtle-bounce-animation');
                } else {
                    // Element is out of view - disable animation to save resources
                    heroImage.classList.remove('subtle-bounce-animation');
                }
                // Always keep pointer events enabled for immediate response when user returns to view
                navLeft.style.pointerEvents = 'auto';
                navRight.style.pointerEvents = 'auto';
            });
        }, { threshold: 0.1 }); // Trigger when at least 10% of the element is visible
        
        // Start observing the hero image
        observer.observe(heroImage);
        
        // Track if an image update is in progress
        let isUpdating = false;
        
        // Function to update image with improved reliability
        const updateImage = (newIndex) => {
            // Prevent multiple rapid clicks from causing issues
            if (isUpdating) return;
            
            isUpdating = true;
            currentImageIndex = newIndex;
            
            // Show immediate feedback by updating the image right away
            img.src = imagePaths[currentImageIndex] + '?t=' + Date.now();
            
            // Reset the updating flag after a short delay to prevent double triggers
            setTimeout(() => {
                isUpdating = false;
            }, 300); // Add a small delay to prevent multiple rapid updates
        };
        
        // Handle left navigation click - go to previous image
        navLeft.addEventListener('click', function(event) {
            // Stop event propagation to prevent the heroImage click handler from firing
            event.stopPropagation();
            // Add imagePaths.length and subtract 1, then mod by length to get previous index
            const newIndex = (currentImageIndex + imagePaths.length - 1) % imagePaths.length;
            updateImage(newIndex);
        });
        
        // Handle right navigation click - go to next image
        navRight.addEventListener('click', function(event) {
            // Stop event propagation to prevent the heroImage click handler from firing
            event.stopPropagation();
            // Go to next image
            const newIndex = (currentImageIndex + 1) % imagePaths.length;
            updateImage(newIndex);
        });
        
        // Add better touch handling that doesn't block scrolling
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;
        
        // Add touch events to the navigation elements
        navLeft.addEventListener('touchstart', function(event) {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });
        
        navLeft.addEventListener('touchmove', function() {
            touchMoved = true;
        }, { passive: true });
        
        navLeft.addEventListener('touchend', function(event) {
            if (!touchMoved) {
                // It was a tap, not a scroll attempt
                const newIndex = (currentImageIndex + imagePaths.length - 1) % imagePaths.length;
                updateImage(newIndex);
            }
        }, { passive: true });
        
        navRight.addEventListener('touchstart', function(event) {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });
        
        navRight.addEventListener('touchmove', function() {
            touchMoved = true;
        }, { passive: true });
        
        navRight.addEventListener('touchend', function(event) {
            if (!touchMoved) {
                // It was a tap, not a scroll attempt
                const newIndex = (currentImageIndex + 1) % imagePaths.length;
                updateImage(newIndex);
            }
        }, { passive: true });
        
        // Keep the original click handler for backward compatibility
        // but make it secondary to the new navigation
        heroImage.addEventListener('click', function(event) {
            // Skip if the click was on a navigation element
            if (event.target === navLeft || event.target === navRight) {
                return;
            }
            
            // Get the click position relative to the image
            const rect = heroImage.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const imageWidth = rect.width;
            
            // Determine if click was on left or right side
            const isLeftSide = clickX < imageWidth / 2;
            
            let newIndex;
            if (isLeftSide) {
                // Left side click - go to previous image
                newIndex = (currentImageIndex + imagePaths.length - 1) % imagePaths.length;
            } else {
                // Right side click - go to next image
                newIndex = (currentImageIndex + 1) % imagePaths.length;
            }
            
            updateImage(newIndex);
        });
    }

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Home link scroll to top
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scroll for other navigation links
    document.querySelectorAll('a[href^="#"]:not(#homeLink)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle waitlist form submission
    const waitlistForm = document.getElementById('waitlistForm');
    const formMessage = document.getElementById('formMessage');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = waitlistForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            formMessage.textContent = 'Submitting...';
            
            fetch(waitlistForm.action, {
                method: 'POST',
                body: new FormData(waitlistForm),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formMessage.textContent = 'Thank you for joining our waitlist! We\'ll be in touch soon.';
                    formMessage.className = 'form-message success';
                    waitlistForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            })
            .catch(error => {
                formMessage.textContent = 'Sorry, there was an error. Please try again.';
                formMessage.className = 'form-message error';
            })
            .finally(() => {
                submitBtn.disabled = false;
            });
        });
    }
});
