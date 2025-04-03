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
                    break; // We found some images, stop looking
                } else {
                    // If no images found yet, try the next number
                    i++;
                }
            }
        }
        
        // Preload each image and store the Image object
        for (const path of imagePaths) {
            const img = new Image();
            img.onload = function() { 
                console.log('Preloaded: ' + path);
            };
            img.onerror = function() { 
                console.error('Failed to preload: ' + path);
                // Remove failed image from array
                const index = imagePaths.indexOf(path);
                if (index > -1) {
                    imagePaths.splice(index, 1);
                }
            };
            img.src = path + '?t=' + Date.now();
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
            const img = heroImage.querySelector('img');
            
            // Get a random image index from all available images
            const randomIndex = Math.floor(Math.random() * imagePaths.length);
            let currentImageIndex = randomIndex;
            
            // Hide the hero image container until the image is loaded
            heroImage.style.opacity = '0';
            heroImage.style.transition = 'opacity 0.3s ease-in-out';
            
            if (img) {
                // Create a new image object for preloading
                const selectedImage = new Image();
                selectedImage.onload = function() {
                    img.src = this.src;
                    heroImage.style.opacity = '1';
                    heroImage.classList.add('subtle-bounce-animation');
                    
                    // Start loading all other images sequentially in the background
                    const remainingImages = [...imagePaths];
                    remainingImages.splice(currentImageIndex, 1); // Remove the initial image
                    
                    // Load remaining images sequentially
                    const loadSequentially = async (paths) => {
                        for (const path of paths) {
                            const img = new Image();
                            img.onload = () => {
                                console.log('Sequentially loaded: ' + path);
                            };
                            img.onerror = () => {
                                console.error('Failed to load sequentially: ' + path);
                                const index = imagePaths.indexOf(path);
                                if (index > -1) {
                                    imagePaths.splice(index, 1);
                                }
                            };
                            img.src = path + '?t=' + Date.now();
                        }
                    };
                    
                    loadSequentially(remainingImages);
                };
                selectedImage.onerror = function() {
                    console.error('Failed to load initial image');
                    // If only one image, just use it without trying next
                    if (imagePaths.length === 1) {
                        img.src = imagePaths[0] + '?t=' + Date.now();
                        heroImage.style.opacity = '1';
                        heroImage.classList.add('subtle-bounce-animation');
                    } else {
                        // Try the next image if multiple images
                        const nextIndex = (currentImageIndex + 1) % imagePaths.length;
                        selectedImage.src = imagePaths[nextIndex] + '?t=' + Date.now();
                    }
                };
                selectedImage.src = imagePaths[currentImageIndex] + '?t=' + Date.now();
                
                // Show the initial image immediately
                img.src = imagePaths[currentImageIndex] + '?t=' + Date.now();
                heroImage.style.opacity = '1';
                heroImage.classList.add('subtle-bounce-animation');
            }
            
            // Get navigation elements
            const navLeft = heroImage.querySelector('.nav-left');
            const navRight = heroImage.querySelector('.nav-right');
            
            // Disable navigation if only one image
            if (imagePaths.length === 1) {
                navLeft.style.display = 'none';
                navRight.style.display = 'none';
            }
            
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
                
                // Create a new image object to preload the next image
                const nextImage = new Image();
                nextImage.onload = function() {
                    // Update the image source only after successful preload
                    img.src = this.src;
                    
                    // Reset the updating flag after a short delay to prevent double triggers
                    setTimeout(() => {
                        isUpdating = false;
                    }, 300); // Add a small delay to prevent multiple rapid updates
                };
                
                nextImage.onerror = function() {
                    console.error('Failed to load image at index ' + newIndex);
                    // If loading fails, just keep the current image
                    isUpdating = false;
                };
                
                // Start loading the new image
                nextImage.src = imagePaths[currentImageIndex] + '?t=' + Date.now();
            };
            
            // Handle left navigation click - go to previous image
            navLeft.addEventListener('click', function(event) {
                event.stopPropagation();
                if (imagePaths.length > 1) {
                    const newIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
                    updateImage(newIndex);
                }
            });
            
            // Handle right navigation click - go to next image
            navRight.addEventListener('click', function(event) {
                event.stopPropagation();
                if (imagePaths.length > 1) {
                    const newIndex = (currentImageIndex + 1) % imagePaths.length;
                    updateImage(newIndex);
                }
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
                    if (imagePaths.length > 1) {
                        const newIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
                        updateImage(newIndex);
                    }
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
                    if (imagePaths.length > 1) {
                        const newIndex = (currentImageIndex + 1) % imagePaths.length;
                        updateImage(newIndex);
                    }
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
                    newIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
                } else {
                    // Right side click - go to next image
                    newIndex = (currentImageIndex + 1) % imagePaths.length;
                }
                
                updateImage(newIndex);
            });
            
            // Add swipe gesture detection for mobile
            if (window.innerWidth <= 768) {
                let touchStartX = 0;
                let touchEndX = 0;
                let isSwiping = false;

                heroImage.addEventListener('touchstart', function(event) {
                    touchStartX = event.touches[0].clientX;
                    isSwiping = true;
                }, { passive: true });

                heroImage.addEventListener('touchmove', function(event) {
                    if (isSwiping) {
                        touchEndX = event.touches[0].clientX;
                    }
                }, { passive: true });

                heroImage.addEventListener('touchend', function(event) {
                    if (isSwiping && imagePaths.length > 1) {
                        const swipeThreshold = 50; // Minimum distance to be considered a swipe
                        const swipeDistance = touchEndX - touchStartX;

                        if (Math.abs(swipeDistance) > swipeThreshold) {
                            // Prevent click event if it was a swipe
                            event.preventDefault();
                            
                            if (swipeDistance > 0) {
                                // Swipe right - go to previous image
                                const newIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
                                updateImage(newIndex);
                            } else {
                                // Swipe left - go to next image
                                const newIndex = (currentImageIndex + 1) % imagePaths.length;
                                updateImage(newIndex);
                            }
                        }
                    }
                    isSwiping = false;
                }, { passive: false });
            }
            
            // Add fade-in/fade-out animation for mobile arrows
            if (window.innerWidth <= 768) {
                const navLeft = document.querySelector('.nav-left');
                const navRight = document.querySelector('.nav-right');
                
                if (navLeft && navRight) {
                    // Add fade-in animation class after a short delay
                    setTimeout(() => {
                        navLeft.classList.add('fade-in-out');
                        navRight.classList.add('fade-in-out');
                    }, 500); // 500ms delay for a subtle effect
                }
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
        }
    });

});
