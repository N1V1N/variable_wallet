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

    // Initialize simple triangle indicators when the page is fully loaded
    window.addEventListener('load', () => {
        const leftIndicator = document.getElementById('left-indicator');
        const rightIndicator = document.getElementById('right-indicator');
        
        if (leftIndicator && rightIndicator) {
            // Add the fade animation class after a short delay
            setTimeout(() => {
                leftIndicator.classList.add('indicator-fade');
                rightIndicator.classList.add('indicator-fade');
            }, 300);
        }
    });

    // Image paths - Automatically finds all numbered PNG files in the images folder
    const imagePaths = [];
    
    // Function to check if an image exists
    const checkImageExists = (path) => {
        const img = new Image();
        img.src = path;
        return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        });
    };
    
    // Preload all images at the start for instant response
    const preloadAllImages = async () => {
        // Create an array to track loaded images
        const preloadedImages = [];
        
        // Try to find all numbered images that exist
        let foundImages = true;
        let i = 1;
        
        while (foundImages && i <= 100) { // Try up to 100 images
            const path = `images/variable_wallet_${i}.png`;
            foundImages = await checkImageExists(path);
            
            if (foundImages) {
                imagePaths.push(path);
                i++;
            } else {
                // If we didn't find the current image, check if we have at least one image
                if (imagePaths.length > 0) {
                    // Sort paths numerically to ensure proper order
                    imagePaths.sort((a, b) => {
                        const numA = parseInt(a.match(/\d+/)[0]);
                        const numB = parseInt(b.match(/\d+/)[0]);
                        return numA - numB;
                    });
                    
                    break; // We found some images, stop looking
                } else {
                    // If no images found yet, try the next number
                    i++;
                }
            }
        }
        
        // Preload all images for instant response
        for (const path of imagePaths) {
            const img = new Image();
            img.src = path;
            preloadedImages.push(img);
        }
        
        return preloadedImages;
    };
    
    // Start preloading all images immediately and store references
    let preloadedImages = [];
    preloadAllImages().then(result => {
        preloadedImages = result;
        
        // Initialize the slideshow
        const heroImage = document.getElementById('hero-image');
        if (heroImage) {
            const img = heroImage.querySelector('.product-image');
            
            // Select a random image from all available images
            const randomIndex = Math.floor(Math.random() * imagePaths.length);
            let currentImageIndex = randomIndex;
            let isUpdating = false;
            
            // Show the initial image
            if (img && imagePaths.length > 0) {
                img.src = imagePaths[currentImageIndex];
                
                // Show navigation arrows after image loads
                const navLeft = heroImage.querySelector('.nav-left');
                const navRight = heroImage.querySelector('.nav-right');
                
                // Disable navigation if only one image
                if (imagePaths.length === 1) {
                    navLeft.style.display = 'none';
                    navRight.style.display = 'none';
                }
                
                // Add subtle bounce animation to the hero image
                heroImage.classList.add('subtle-bounce-animation');
            }
            
            // Simple function to go to previous image
            const goToPrevious = () => {
                if (isUpdating || imagePaths.length <= 1) return;
                isUpdating = true;
                
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : imagePaths.length - 1;
                updateImage(newIndex);
            };
            
            // Simple function to go to next image
            const goToNext = () => {
                if (isUpdating || imagePaths.length <= 1) return;
                isUpdating = true;
                
                const newIndex = currentImageIndex < imagePaths.length - 1 ? currentImageIndex + 1 : 0;
                updateImage(newIndex);
            };
            
            // Function to update image
            const updateImage = (newIndex) => {
                currentImageIndex = newIndex;
                
                // Create a new image object to preload
                const nextImage = new Image();
                nextImage.onload = function() {
                    // Update the image source only after successful preload
                    img.src = this.src;
                    
                    // Reset the updating flag after a short delay
                    setTimeout(() => {
                        isUpdating = false;
                    }, 300);
                };
                
                nextImage.onerror = function() {
                    console.error('Failed to load image at index ' + newIndex);
                    isUpdating = false;
                };
                
                // Start loading the new image
                nextImage.src = imagePaths[currentImageIndex];
            };
            
            // Handle clicks on the hero image
            heroImage.addEventListener('click', function(event) {
                // Get click position
                const rect = heroImage.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const isLeftSide = clickX < rect.width / 2;
                
                // Navigate based on which side was clicked
                if (isLeftSide) {
                    goToPrevious();
                } else {
                    goToNext();
                }
            });
            
            // Handle touch events for mobile
            if (window.innerWidth <= 768) {
                let touchStartX = 0;
                let touchEndX = 0;
                let touchStartTime = 0;
                
                heroImage.addEventListener('touchstart', function(event) {
                    touchStartX = event.touches[0].clientX;
                    touchStartTime = new Date().getTime();
                }, { passive: true });
                
                heroImage.addEventListener('touchend', function(event) {
                    touchEndX = event.changedTouches[0].clientX;
                    const touchEndTime = new Date().getTime();
                    const touchDuration = touchEndTime - touchStartTime;
                    
                    // Determine if it was a swipe or a tap
                    const touchDistance = touchEndX - touchStartX;
                    
                    // If it's a quick touch with minimal movement, treat as a tap
                    if (touchDuration < 300 && Math.abs(touchDistance) < 30) {
                        // Get tap position
                        const rect = heroImage.getBoundingClientRect();
                        const tapX = event.changedTouches[0].clientX - rect.left;
                        const isLeftSide = tapX < rect.width / 2;
                        
                        // Navigate based on which side was tapped
                        if (isLeftSide) {
                            goToPrevious();
                        } else {
                            goToNext();
                        }
                    } 
                    // If it's a swipe, navigate based on swipe direction
                    else if (Math.abs(touchDistance) > 50) {
                        if (touchDistance > 0) {
                            // Swipe right - go to previous
                            goToPrevious();
                        } else {
                            // Swipe left - go to next
                            goToNext();
                        }
                    }
                }, { passive: true });
            }
            
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
        }
    });

});
