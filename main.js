import { initializeCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Add CPU usage management at the start
    const manageCPUUsage = () => {
        try {
            if ('scheduler' in navigator) {
                navigator.scheduler.setNormalPriority();
            }
            
            if ('scheduling' in navigator) {
                navigator.scheduling.setCPULimit({
                    maxUtilization: 0.33,
                    duration: 'auto'
                }).catch(error => {
                    // Silently handle the error - no need to log it
                    return false;
                });
            }
            return true;
        } catch (error) {
            // Silently handle the error - no need to log it
            return false;
        }
    };

    // Add CPU management dialog function at the top level so it can be reused
    const createCPUDialog = (resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
            padding: 25px;
            z-index: 10000;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            min-width: 280px;
            backdrop-filter: blur(5px);
        `;
        
        dialog.innerHTML = `
            <p style="margin-bottom: 4px; font-size: 1.1em; text-transform: uppercase; letter-spacing: 2px;">
                Reduce CPU Usage?
            </p>
            <p style="
                margin-bottom: 20px; 
                font-size: 0.7em; 
                color: rgba(255, 255, 255, 0.4); 
                letter-spacing: 1px;
                margin-top: -2px;
            ">
                
            </p>
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <button id="yesBtn" style="
                    padding: 8px 20px;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.9);
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-family: 'Courier New', monospace;
                ">Yes</button>
                <button id="noBtn" style="
                    padding: 8px 20px;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.9);
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-family: 'Courier New', monospace;
                ">No</button>
            </div>
            <label style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 0.8em;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                letter-spacing: 1px;
            ">
                <input type="checkbox" id="dontShowAgain" style="
                    cursor: pointer;
                    accent-color: #fff;
                ">
                DON'T SHOW AGAIN
            </label>
        `;

        // Add hover effects
        const addButtonHoverEffects = () => {
            const yesBtn = document.getElementById('yesBtn');
            const noBtn = document.getElementById('noBtn');
            
            yesBtn.onmouseover = () => {
                yesBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                yesBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
            };
            yesBtn.onmouseout = () => {
                yesBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                yesBtn.style.boxShadow = 'none';
            };
            
            noBtn.onmouseover = () => {
                noBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                noBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
            };
            noBtn.onmouseout = () => {
                noBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                noBtn.style.boxShadow = 'none';
            };
        };

        document.body.appendChild(dialog);
        addButtonHoverEffects();

        const handleChoice = (accepted) => {
            const dontShowAgain = document.getElementById('dontShowAgain').checked;
            
            if (accepted) {
                manageCPUUsage();
                animationToggle.checked = false;
            } else {
                animationToggle.checked = true;
            }
            
            if (dontShowAgain) {
                localStorage.setItem('cpuManagementPreference', 'permanent');
            }
            
            animationToggle.dispatchEvent(new Event('change'));
            dialog.remove();
            resolve();
        };

        document.getElementById('yesBtn').addEventListener('click', () => handleChoice(true));
        document.getElementById('noBtn').addEventListener('click', () => handleChoice(false));

        return dialog;
    };

    // Add a subtle link to reopen the dialog
    const createReopenLink = () => {
        // Only create link for non-mobile devices with multiple cores
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            && navigator.hardwareConcurrency > 1) {
            
            const link = document.createElement('a');
            link.innerHTML = 'cpu settings';
            link.style.cssText = `
                position: fixed;
                bottom: 45px;
                right: 20px;
                font-size: 0.65em;
                color: rgba(255, 255, 255, 0.2);
                text-decoration: none;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                letter-spacing: 1.5px;
                transition: color 0.3s ease;
                text-transform: uppercase;
            `;
            
            link.onmouseover = () => {
                link.style.color = 'rgba(255, 255, 255, 0.4)';
            };
            
            link.onmouseout = () => {
                link.style.color = 'rgba(255, 255, 255, 0.2)';
            };
            
            link.onclick = () => {
                // Remove any existing dialog first
                const existingDialog = document.querySelector('.cpu-dialog');
                if (existingDialog) existingDialog.remove();
                
                // Create and show new dialog with a dummy resolve function
                const dialog = createCPUDialog(() => {});  // Empty function as resolve
                document.body.appendChild(dialog);
            };
            
            document.body.appendChild(link);
        }
    };

    // Add scroll down text
    const createScrollText = () => {
        // Only show on non-mobile devices
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const text = document.createElement('div');
            text.innerHTML = 'scroll down!';
            text.style.cssText = `
                position: fixed;
                bottom: 45px;
                left: 20px;
                font-size: 0.65em;
                color: rgba(255, 255, 255, 0.2);
                font-family: 'Courier New', monospace;
                letter-spacing: 1.5px;
                text-transform: uppercase;
            `;
            
            document.body.appendChild(text);
        }
    };

    // Loading screen handler
    window.addEventListener('load', () => {
        const getCPUPreference = () => {
            return new Promise((resolve) => {
                // Only show CPU dialog on non-mobile devices with multiple cores
                if (navigator.hardwareConcurrency > 1 && 
                    localStorage.getItem('cpuManagementPreference') !== 'permanent' &&
                    !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    const dialog = createCPUDialog(resolve);
                    document.body.appendChild(dialog);
                } else {
                    resolve();
                }
            });
        };

        // Show dialog immediately while loading
        getCPUPreference().then(() => {
            createReopenLink(); // Add the reopen link after initial load
            createScrollText(); // Add the scroll down text
            // Only hide loading screen after user has made their choice
            setTimeout(() => {
                document.getElementById('loading-screen').style.opacity = '0';
                document.getElementById('main-content').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                }, 500);
            }, 1500);
        });
    });

    // Initialize carousel
    initializeCarousel(3);

    // Model viewer interaction setup and logging
    document.querySelectorAll('model-viewer').forEach((viewer, index) => {
        // Click rotation handler
        viewer.addEventListener('click', (event) => {
            if (event.button === 0) { // Left click only
                const currentRotation = viewer.getCameraOrbit();
                const targetRotation = {
                    theta: currentRotation.theta + Math.PI,
                    phi: currentRotation.phi,
                    radius: currentRotation.radius
                };
                viewer.cameraOrbit = `${targetRotation.theta}rad ${targetRotation.phi}rad ${targetRotation.radius}m`;
            }
        });

        // Loading and error handlers
        viewer.addEventListener('error', (error) => {
            console.warn(`Model Viewer ${index} error:`, error);
            // Don't try to dismiss or reset - just log the error
        });
        
        viewer.addEventListener('load', () => {
            console.log(`Model ${index} loaded successfully`);
            viewer.style.opacity = '1';  // Ensure model is visible when loaded
        });

        viewer.addEventListener('loading', event => {
            if (event.detail) {
                const progress = Math.round(event.detail.totalProgress * 100);
                console.log(`Model ${index} loading progress: ${progress}%`);
            }
        });

        // Ensure model is visible
        viewer.style.opacity = '1';
        viewer.style.visibility = 'visible';
    });

    // Add this after your existing code
    document.getElementById('toggleMobilePreview').addEventListener('click', () => {
        const mobileFrame = document.getElementById('mobile-frame');
        const mainContent = document.getElementById('main-content');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (mobileFrame.classList.contains('hidden')) {
            // Show mobile preview
            mobileFrame.classList.remove('hidden');
            const mobileContent = mainContent.cloneNode(true);
            mobileFrame.querySelector('.mobile-frame-content').innerHTML = '';
            mobileFrame.querySelector('.mobile-frame-content').appendChild(mobileContent);
        } else {
            // Hide mobile preview
            mobileFrame.classList.add('hidden');
        }
    });

    // Add after your existing code
    function createMatrixEffect() {
        const title = document.querySelector('.title');
        const chars = '0123456789ABCDEF';
        const numChars = 10;

        for (let i = 0; i < numChars; i++) {
            const char = document.createElement('span');
            char.className = 'matrix-char';
            char.style.left = `${Math.random() * 100}%`;
            char.style.top = `${Math.random() * 100}%`;
            char.style.animationDelay = `${Math.random() * 4}s`;
            
            setInterval(() => {
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
            }, 200);

            title.appendChild(char);
        }
    }

    createMatrixEffect();

    // Add this to your existing DOMContentLoaded event listener
    const animationToggle = document.getElementById('animationToggle');
    
    animationToggle.addEventListener('change', () => {
        const viewers = document.querySelectorAll('model-viewer');
        viewers.forEach(viewer => {
            if (animationToggle.checked) {
                // Re-enable all animations and interactions
                if (viewer.closest('.carousel-slide.current')) {
                    viewer.setAttribute('auto-rotate', '');
                    viewer.setAttribute('camera-controls', '');
                    viewer.setAttribute('interaction-prompt', 'auto');
                    viewer.style.pointerEvents = 'auto';
                }
            } else {
                // Disable all animations and interactions
                viewer.removeAttribute('auto-rotate');
                viewer.removeAttribute('camera-controls');
                viewer.setAttribute('interaction-prompt', 'none');
                viewer.style.pointerEvents = 'none';
                // Set a cool fixed position
                viewer.setAttribute('camera-orbit', '45deg 55deg 100%');
                viewer.setAttribute('camera-target', '0m 0m 0m');
                viewer.setAttribute('field-of-view', '30deg');
            }
        });

        // Also toggle the matrix effect and scan line
        const title = document.querySelector('.title');
        const body = document.querySelector('body');
        if (!animationToggle.checked) {
            // Pause all CSS animations
            document.body.style.setProperty('--animation-state', 'paused');
            title.querySelectorAll('.matrix-char').forEach(char => {
                char.style.animationPlayState = 'paused';
            });
            body.style.setProperty('animation-play-state', 'paused');
        } else {
            // Resume all CSS animations
            document.body.style.setProperty('--animation-state', 'running');
            title.querySelectorAll('.matrix-char').forEach(char => {
                char.style.animationPlayState = 'running';
            });
            body.style.setProperty('animation-play-state', 'running');
        }
    });
}); 