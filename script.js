document.addEventListener('DOMContentLoaded', () => {
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

    // Waitlist form handling
    const waitlistForm = document.getElementById('waitlistForm');
    const formMessage = document.getElementById('formMessage');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = waitlistForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            formMessage.textContent = '';
            
            try {
                // Get form data
                const formData = new FormData(waitlistForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const message = formData.get('message') || '';

                // Get the token from your server or environment
                const token = await fetch('/.netlify/functions/get-github-token').then(r => r.text());

                // Trigger GitHub Actions workflow
                const response = await fetch('https://api.github.com/repos/N1V1N/variable_wallet/actions/workflows/waitlist.yml/dispatches', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ref: 'main',
                        inputs: {
                            name: name,
                            email: email,
                            message: message
                        }
                    })
                });

                if (response.ok) {
                    formMessage.textContent = 'Thank you for joining our waitlist! Your submission has been saved.';
                    formMessage.className = 'form-message success';
                    waitlistForm.reset();
                } else {
                    throw new Error('Failed to save your submission');
                }
            } catch (error) {
                console.error('Error:', error);
                formMessage.textContent = 'There was an error saving your submission. Please try again later.';
                formMessage.className = 'form-message error';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
});
