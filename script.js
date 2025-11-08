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
                // Set the source to the first slideshow image
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
                if (imagePaths.length <= 1) return;
                
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : imagePaths.length - 1;
                updateImage(newIndex);
            };
            
            // Simple function to go to next image
            const goToNext = () => {
                if (imagePaths.length <= 1) return;
                
                const newIndex = currentImageIndex < imagePaths.length - 1 ? currentImageIndex + 1 : 0;
                updateImage(newIndex);
            };
            
            // Function to update image
            const updateImage = (newIndex) => {
                if (isUpdating) return;
                isUpdating = true;
                
                const img = heroImage.querySelector('.product-image');
                img.src = imagePaths[newIndex];
                
                // Update current index
                currentImageIndex = newIndex;
                
                // Reset updating flag after a small delay to prevent rapid clicks
                setTimeout(() => {
                    isUpdating = false;
                }, 50);
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

    // Create Your Own! Product Selector - NEW CUSTOM DROPDOWN SYSTEM
    const modelDropdown = document.getElementById('model-dropdown');
    const modelOptions = document.getElementById('model-options');
    const modelSelected = document.getElementById('model-selected');
    const finishDropdown = document.getElementById('finish-dropdown');
    const finishOptions = document.getElementById('finish-options');
    const finishSelected = document.getElementById('finish-selected');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const cartItemsList = document.getElementById('cartItemsList');
    const totalPriceDisplay = document.getElementById('totalPrice');
    const cartCounter = document.getElementById('cart-counter');
    
    // Global cart items array - accessible to all functions
    let cartItems = [];
    
    if (addToCartBtn) {
        const PRICE_PER_ITEM = 33;
        let selectedModel = null; // No initial selection
        let selectedFinish = null; // No initial selection
        
        // Initially disable finish dropdown until model is selected
        finishDropdown.classList.add('disabled');
        
        // Define finishes for each model
        const modelFinishes = {
            mk1: [
                // { value: 'machined', text: 'Machined Finish' },
                { value: 'red', text: 'Red' },
                { value: 'gunmetal', text: 'Gunmetal' },
                { value: 'purple', text: 'Purple' },
                { value: 'gold', text: 'Gold' },
                { value: 'teal', text: 'Teal' }
            ],
            mk2: [
                // { value: 'machined', text: 'Machined Finish' },
                { value: 'black', text: 'Black' }
            ]
        };
        
        // Define disclaimer text for each model
        const modelDisclaimers = {
            mk1: '(MK I: Holds up to 2 standard size cards)',
            mk2: '(MK II: Holds up to 3 standard size cards, or 5 bills)'
        };
        
        // Model dropdown functionality
        modelDropdown.addEventListener('click', function() {
            this.classList.toggle('active');
            modelOptions.classList.toggle('show');
            finishOptions.classList.remove('show');
            finishDropdown.classList.remove('active');
        });
        
        // Finish dropdown functionality
        finishDropdown.addEventListener('click', function() {
            // Prevent opening if no model is selected (lock mode)
            if (!selectedModel) {
                return;
            }
            
            this.classList.toggle('active');
            finishOptions.classList.toggle('show');
            modelOptions.classList.remove('show');
            modelDropdown.classList.remove('active');
        });
        
        // Model option selection
        document.querySelectorAll('#model-options .dropdown-option').forEach(option => {
            option.addEventListener('click', function() {
                selectedModel = this.dataset.value;
                modelSelected.innerHTML = this.innerHTML;
                modelSelected.classList.remove('unselected');
                modelDropdown.classList.remove('active');
                modelOptions.classList.remove('show');
                
                // Enable finish dropdown now that model is selected
                finishDropdown.classList.remove('disabled');
                
                // Update finish options
                updateFinishOptions();
            });
        });
        
        function updateFinishOptions() {
            const finishes = modelFinishes[selectedModel];
            finishOptions.innerHTML = '';
            
            finishes.forEach(finish => {
                const option = document.createElement('div');
                option.className = 'dropdown-option';
                option.dataset.value = finish.value;
                option.textContent = finish.text;
                finishOptions.appendChild(option);
            });
            
            // Reset finish selection to unselected state
            if (finishes.length > 0) {
                selectedFinish = null; // No selection until user clicks
                finishSelected.textContent = 'Select Color';
                finishSelected.classList.add('unselected');
            }
            
            // Add click handlers to new finish options
            document.querySelectorAll('#finish-options .dropdown-option').forEach(option => {
                option.addEventListener('click', function() {
                    selectedFinish = this.dataset.value;
                    finishSelected.textContent = this.textContent;
                    finishSelected.classList.remove('unselected');
                    finishDropdown.classList.remove('active');
                    finishOptions.classList.remove('show');
                });
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!modelDropdown.contains(e.target) && !modelOptions.contains(e.target)) {
                modelDropdown.classList.remove('active');
                modelOptions.classList.remove('show');
            }
            if (!finishDropdown.contains(e.target) && !finishOptions.contains(e.target)) {
                finishDropdown.classList.remove('active');
                finishOptions.classList.remove('show');
            }
        });
        
        // Add to cart button click
        addToCartBtn.addEventListener('click', function() {
            const product = selectedModel; // Use the selected model from dropdown
            const finish = selectedFinish;
            
            // VALIDATION: Check if model and finish are selected
            if (!product) {
                alert('Please select your wallet model');
                return;
            }
            
            if (!finish) {
                alert('Please select a finish color');
                return;
            }
            
            // VALIDATION: Check 9-piece maximum limit (silent)
            const currentTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            if (currentTotal >= 9) {
                return; // Silently prevent adding more
            }
            
            const quantity = 1; // Always add 1 piece at a time
            
            // Add the item
            const displayName = product === 'mk2' ? 'MK II' : 'MK I';
            
            const cartItem = {
                product: displayName,
                finish: finish.charAt(0).toUpperCase() + finish.slice(1),
                quantity: 1,
                price: PRICE_PER_ITEM
            };
            
            cartItems.push(cartItem);
            updateCartDisplay();
        });
        
        // Update cart display
        function updateCartDisplay() {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
            
            // Update price display
            totalPriceDisplay.textContent = totalPrice;
            
            // Update cart counter
            cartCounter.textContent = `(${totalItems})`;
            
            // Update cart items list
            cartItemsList.innerHTML = '';
            
            // Show/hide startup note based on cart contents
            const startupNote = document.querySelector('.startup-note');
            if (startupNote) {
                startupNote.style.display = cartItems.length === 0 ? 'none' : 'block';
            }
            
            if (cartItems.length === 0) {
                cartItemsList.innerHTML = '<li class="cart-empty">Add Pieces!</li>';
            } else {
                // Store original indices for proper removal, then sort
                const itemsWithIndices = cartItems.map((item, originalIndex) => ({
                    item,
                    originalIndex
                }));
                
                // Sort by product type: MK I first, then MK II
                const sortedItemsWithIndices = itemsWithIndices.sort((a, b) => {
                    if (a.item.product === 'MK I' && b.item.product === 'MK II') return -1;
                    if (a.item.product === 'MK II' && b.item.product === 'MK I') return 1;
                    return 0;
                });
                
                sortedItemsWithIndices.forEach(({ item, originalIndex }) => {
                    const li = document.createElement('li');
                    li.className = 'cart-item';
                    
                    // Convert "Machined" to "Shiny" for cart display only
                    const displayFinish = item.finish === 'Machined' ? 'Shiny' : item.finish;
                    
                    // Create item text span
                    const itemText = document.createElement('span');
                    itemText.textContent = `${item.product} - ${displayFinish} - $${item.price}`;
                    
                    // Create remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-item-btn';
                    removeBtn.textContent = '×';
                    
                    // Use the original index for proper removal
                    removeBtn.addEventListener('click', function() {
                        removeCartItem(originalIndex);
                    });
                    
                    li.appendChild(itemText);
                    li.appendChild(removeBtn);
                    cartItemsList.appendChild(li);
                });
            }
            
            // Re-render PayPal button when cart changes
            if (typeof renderPayPalButton === 'function') {
                renderPayPalButton();
            }
        }
        
        // Remove individual cart item
        function removeCartItem(index) {
            cartItems.splice(index, 1);
            updateCartDisplay();
        }
        
        // Clear cart
        function clearCart() {
            cartItems = [];
            updateCartDisplay();
            renderPayPalButton(); // Re-render button to disable it
        }
        
        // PayPal Integration
        let isRenderingPayPal = false; // Flag to prevent simultaneous renders
        
        // US State Tax Rates (2024) - Update annually
        const stateTaxRates = {
            'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
            'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
            'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
            'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
            'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
            'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
            'NM': 0.05125, 'NY': 0.04, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
            'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
            'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
            'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
            'DC': 0.06
        };
        
        function renderPayPalButton() {
            const paypalContainer = document.getElementById('paypal-button-container');
            
            // Prevent multiple simultaneous renders
            if (isRenderingPayPal) {
                console.log('PayPal button already rendering, skipping...');
                return;
            }
            
            // Clear existing button
            paypalContainer.innerHTML = '';
            
            // Only render button if PayPal SDK is loaded
            if (typeof paypal === 'undefined') {
                console.error('PayPal SDK not loaded');
                paypalContainer.innerHTML = '<p style="color: #ff6b6b; font-size: 0.8rem; margin-top: 1rem;">PayPal SDK not loaded. Please add your Client ID.</p>';
                isRenderingPayPal = false; // Reset flag
                return;
            }
            
            // Only enable button if cart has items
            if (cartItems.length === 0) {
                console.log('Cart is empty, not rendering PayPal button');
                isRenderingPayPal = false; // Reset flag
                return; // Don't show button when cart is empty
            }
            
            console.log('Rendering PayPal button with cart items:', cartItems);
            isRenderingPayPal = true; // Set flag
            
            // Define the order of funding sources (Venmo first, Apple Pay second!)
            const fundingSources = [
                paypal.FUNDING.VENMO,      // 1st - Mobile-friendly
                paypal.FUNDING.APPLEPAY,   // 2nd - Apple users
                paypal.FUNDING.PAYPAL,     // 3rd - Traditional
                paypal.FUNDING.PAYLATER,   // 4th - Buy now, pay later
                paypal.FUNDING.CARD        // 5th - Credit/Debit cards
            ];
            
            // Render buttons for each funding source in order
            fundingSources.forEach(fundingSource => {
                // Check if this funding source is eligible
                if (paypal.isFundingEligible(fundingSource)) {
                    paypal.Buttons({
                        fundingSource: fundingSource,
                        
                        // Style configuration for buttons
                        style: {
                            layout: 'vertical',  // Stack buttons vertically
                            color: fundingSource === paypal.FUNDING.PAYPAL ? 'gold' : 
                                   fundingSource === paypal.FUNDING.CARD ? 'black' : 'blue',
                            shape: 'rect',
                            height: 45
                        },
                
                // Handle button click
                onClick: function(data, actions) {
                    // Validate cart before allowing click
                    if (!cartItems || cartItems.length === 0) {
                        alert('Your cart is empty. Add pieces to checkout.');
                        return actions.reject();
                    }
                    return actions.resolve();
                },
                
                // Set up the transaction
                createOrder: function(data, actions) {
                    try {
                        // Validate cart before creating order
                        if (!cartItems || cartItems.length === 0) {
                            throw new Error('Cart is empty');
                        }
                        
                        // Build line items from cart
                        const items = cartItems.map(item => {
                            // Convert "Machined" to "Shiny" for display
                            const displayFinish = item.finish === 'Machined' ? 'Shiny' : item.finish;
                            
                            // Generate unique SKU: MODEL-MATERIAL-COLOR
                            const modelCode = item.product === 'MK II' ? 'MKII' : 'MKI';
                            const materialCode = 'AL'; // Currently all Aluminum (will expand to TI, DA later)
                            const colorCode = displayFinish.toUpperCase().replace(/\s+/g, '');
                            const sku = `${modelCode}-${materialCode}-${colorCode}`;
                            
                            return {
                                name: `${item.product} - ${displayFinish}`,
                                description: `Variable Wallet ${item.product} in ${displayFinish}`,
                                sku: sku, // Unique product identifier (e.g., MKI-AL-RED, MKII-AL-GOLD)
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: item.price.toFixed(2)
                                },
                                quantity: item.quantity.toString()
                            };
                        });
                        
                        const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
                        const shipping = 0.01; // $0.01 to show shipping line in PayPal
                        // Default tax estimate (2.9% - CO rate) for Venmo users who skip onShippingChange
                        // Will be updated to actual state tax if onShippingChange fires
                        const defaultTaxRate = 0.029; 
                        const tax = subtotal * defaultTaxRate;
                        const totalAmount = subtotal + shipping + tax;
                        
                        // Validate total
                        if (subtotal <= 0) {
                            throw new Error('Invalid order total');
                        }
                        
                        const orderPayload = {
                            intent: 'CAPTURE', // CRITICAL: Mark as immediate sale/capture, not authorization
                            purchase_units: [{
                                description: 'Variable Wallet Order',
                                reference_id: 'default',
                                soft_descriptor: 'VARIABLE WALLET', // Shows on customer's card statement
                                amount: {
                                    currency_code: 'USD',
                                    value: totalAmount.toFixed(2),
                                    breakdown: {
                                        item_total: {
                                            currency_code: 'USD',
                                            value: subtotal.toFixed(2)
                                        },
                                        shipping: {
                                            currency_code: 'USD',
                                            value: shipping.toFixed(2)
                                        },
                                        tax_total: {
                                            currency_code: 'USD',
                                            value: tax.toFixed(2)
                                        }
                                    }
                                },
                                items: items,
                                payee: {
                                    merchant_id: undefined
                                }
                            }],
                            application_context: {
                                brand_name: 'Variable Wallet',
                                shipping_preference: 'GET_FROM_FILE' // Request shipping address from PayPal
                            }
                        };
                        
                        return actions.order.create(orderPayload);
                    } catch (error) {
                        console.error('Error creating order:', error);
                        alert('Unable to process order. Please try again.');
                        throw error;
                    }
                },
                
                // Update tax when shipping address changes
                onShippingChange: function(data, actions) {
                    const shippingAddress = data.shipping_address;
                    const countryCode = shippingAddress.country_code;
                    const stateCode = shippingAddress.state;
                    
                    console.log('Shipping address changed:', shippingAddress);
                    console.log('Country code:', countryCode);
                    console.log('State code:', stateCode);
                    
                    // CRITICAL: Reject non-US addresses
                    if (countryCode !== 'US') {
                        console.error('International shipping attempted:', countryCode);
                        return actions.reject('We currently only ship to addresses within the United States. Please use a US shipping address.');
                    }
                    
                    // Calculate tax based on state
                    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
                    const taxRate = stateTaxRates[stateCode] || 0; // Default to 0 if state not found
                    const tax = subtotal * taxRate;
                    const shipping = 0.01; // $0.01 to show shipping line in PayPal
                    const total = subtotal + tax + shipping;
                    
                    console.log(`Tax calculation: Subtotal: $${subtotal.toFixed(2)}, Rate: ${(taxRate * 100).toFixed(2)}%, Tax: $${tax.toFixed(2)}, Total: $${total.toFixed(2)}`);
                    
                    // Update the order with new tax amount
                    return actions.order.patch([{
                        op: 'replace',
                        path: '/purchase_units/@reference_id==\'default\'/amount',
                        value: {
                            currency_code: 'USD',
                            value: total.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: subtotal.toFixed(2)
                                },
                                shipping: {
                                    currency_code: 'USD',
                                    value: shipping.toFixed(2)
                                },
                                tax_total: {
                                    currency_code: 'USD',
                                    value: tax.toFixed(2)
                                }
                            }
                        }
                    }]).then(function() {
                        console.log('✓ Tax successfully updated to $' + tax.toFixed(2));
                    }).catch(function(err) {
                        console.error('✗ FAILED to update tax:', err);
                        // Don't reject, but log the error
                    });
                },
                
                // Finalize the transaction
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        // Log complete order details for your records
                        console.log('=== ORDER COMPLETED SUCCESSFULLY ===');
                        console.log('Order ID:', details.id);
                        console.log('Transaction ID:', details.purchase_units[0].payments.captures[0].id);
                        console.log('Payer Name:', details.payer.name.given_name + ' ' + details.payer.name.surname);
                        console.log('Payer Email:', details.payer.email_address);
                        console.log('Shipping Address:', JSON.stringify(details.purchase_units[0].shipping, null, 2));
                        console.log('Items Purchased:', JSON.stringify(cartItems, null, 2));
                        console.log('Subtotal:', details.purchase_units[0].amount.breakdown.item_total.value);
                        console.log('Tax:', details.purchase_units[0].amount.breakdown.tax_total?.value || '0.00');
                        console.log('Shipping:', details.purchase_units[0].amount.breakdown.shipping?.value || '0.00');
                        console.log('Total Amount:', details.purchase_units[0].amount.value);
                        console.log('Payment Status:', details.status);
                        console.log('Full Details:', JSON.stringify(details, null, 2));
                        console.log('====================================');
                        
                        // CRITICAL: Verify tax was collected
                        const taxCollected = parseFloat(details.purchase_units[0].amount.breakdown.tax_total?.value || 0);
                        const totalAmount = parseFloat(details.purchase_units[0].amount.value);
                        
                        if (taxCollected === 0 && totalAmount > 0) {
                            console.warn('⚠️ WARNING: No tax was collected on this order!');
                        }
                        
                        // IMPORTANT: In production, send this to your server
                        // Example: fetch('/api/orders', { method: 'POST', body: JSON.stringify(details) })
                        
                        // Clear the cart after successful payment
                        clearCart();
                        
                        // Show thank you modal after a short delay to catch any errors
                        setTimeout(() => {
                            const orderId = details.id;
                            showThankYouModal(orderId);
                        }, 500);
                        
                        // TODO: Add your post-purchase logic here:
                        // - Send order to your server/database
                        // - Update inventory
                    }).catch(function(error) {
                        console.error('🚨 CAPTURE FAILED!');
                        console.error('Error capturing order:', error);
                        console.error('Error name:', error.name);
                        console.error('Error message:', error.message);
                        console.error('Error stack:', error.stack);
                        console.error('Full error object:', JSON.stringify(error, null, 2));
                        console.error('Order ID that failed:', data.orderID);
                        
                        // Show detailed error to user
                        let errorMsg = 'Payment could not be processed.\n\n';
                        errorMsg += 'Order ID: ' + data.orderID + '\n';
                        errorMsg += 'Error: ' + (error.message || error.toString()) + '\n\n';
                        errorMsg += 'Please check your PayPal account or contact support.';
                        
                        alert(errorMsg);
                    });
                },
                
                // Handle user cancellation
                onCancel: function(data) {
                    console.log('Payment cancelled by user:', data);
                    // Don't show alert for cancel - user intentionally closed it
                    // Cart remains intact so they can try again
                    // Re-render buttons to reset loading state
                    isRenderingPayPal = false; // Reset flag before re-render
                    setTimeout(() => {
                        renderPayPalButton();
                    }, 100);
                },
                
                // Handle errors
                onError: function(err) {
                    console.error('PayPal Checkout Error:', err);
                    console.error('Error details:', JSON.stringify(err, null, 2));
                    alert('An error occurred during checkout. Please try again or contact support if the problem persists.');
                    // Re-render buttons to reset from error state
                    isRenderingPayPal = false; // Reset flag before re-render
                    setTimeout(() => {
                        renderPayPalButton();
                    }, 100);
                }
                    }).render('#paypal-button-container').then(function() {
                        console.log(`${fundingSource} button rendered successfully`);
                    }).catch(function(err) {
                        console.error(`Failed to render ${fundingSource} button:`, err);
                    });
                }
            });
            
            // Reset flag after all buttons are rendered
            isRenderingPayPal = false;
        }
        
        // Initialize cart display
        updateCartDisplay();
        
        // Initialize PayPal button after a short delay to ensure SDK is loaded
        setTimeout(() => {
            if (typeof paypal !== 'undefined') {
                renderPayPalButton();
            } else {
                console.warn('PayPal SDK not loaded yet, will retry...');
                // Retry after longer delay
                setTimeout(renderPayPalButton, 1000);
            }
        }, 100);
    }
    
    // Thank You Modal Functions
    window.showThankYouModal = function(orderId) {
        const modal = document.getElementById('thankYouModal');
        const orderIdSpan = document.getElementById('modalOrderId');
        orderIdSpan.textContent = orderId;
        modal.classList.add('show');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    };
    
    window.closeThankYouModal = function() {
        const modal = document.getElementById('thankYouModal');
        modal.classList.remove('show');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    };
    
    // Close modal when clicking outside the content
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('thankYouModal');
        if (event.target === modal) {
            closeThankYouModal();
        }
    });

});
