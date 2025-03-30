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
        'images/variable_wallet_0.png',
        'images/variable_wallet_1.png',
        'images/variable_wallet_2.png',
        'images/variable_wallet_3.png',
        'images/variable_wallet_4.png'
    ];
    
    // Alternate between first two images on page load
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        const img = heroImage.querySelector('img');
        
        // Use a more explicit random selection between 0 and 1
        // Math.random() gives a value between 0 and 1
        // Math.floor(Math.random() * 2) will give either 0 or 1
        let currentImageIndex = Math.floor(Math.random() * 2); // Will be either 0 or 1
        
        if (img) {
            // Set the initial image to either variable_wallet_0 or variable_wallet_1
            // Add a cache-busting parameter to ensure the image is not cached
            img.src = imagePaths[currentImageIndex] + '?t=' + new Date().getTime();
        }
        
        // Handle image cycling on click
        heroImage.addEventListener('click', function() {
            // Move to next image
            currentImageIndex = (currentImageIndex + 1) % imagePaths.length;
            
            // Update image source
            if (img) {
                // Add a cache-busting query parameter
                img.src = imagePaths[currentImageIndex] + '?t=' + new Date().getTime();
            }
        });

        // Bounce animation that repeats every 9 seconds on all devices
        // Function to handle the bounce animation
        const doBounce = () => {
            heroImage.classList.add('subtle-bounce-animation');
            
            // Remove the class after the animation completes
            setTimeout(() => {
                heroImage.classList.remove('subtle-bounce-animation');
            }, 1300);
        };
        
        // Initial animation after 1.33 seconds
        setTimeout(() => {
            // Do the initial bounce
            doBounce();
            
            // Set up interval to repeat the animation every 9 seconds
            setInterval(doBounce, 9000);
        }, 1330);
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
