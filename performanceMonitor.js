class PerformanceMonitor {
    constructor(threshold = 70) { // 70% threshold
        this.threshold = threshold;
        this.warningShown = false;
        this.monitorInterval = null;
        this.overlay = null;
        
        // Add key listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === '4') {
                this.showWarning();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === '4') {
                this.hideWarning();
            }
        });
    }

    start() {
        this.monitorInterval = setInterval(() => this.checkPerformance(), 1000);
    }

    async checkPerformance() {
        if ('performance' in window && 'memory' in window.performance) {
            const memory = performance.memory;
            const usedHeap = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

            if (usedHeap > this.threshold && !this.warningShown) {
                this.showWarning();
            }
        }
    }

    showWarning() {
        if (this.overlay) return; // Prevent multiple overlays
        
        this.overlay = document.createElement('div');
        this.overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #1a1a1c;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: 'Rajdhani', sans-serif;
            ">
                <h1 style="
                    font-size: 15em;
                    margin: 0;
                    font-weight: 800;
                    color: #1a1a1c;
                    text-shadow: 
                        0 2px 8px rgba(0,0,0,0.6),
                        0 4px 16px rgba(0,0,0,0.4);
                    letter-spacing: 0.1em;
                ">404</h1>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    hideWarning() {
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }
    }

    stop() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
    }
}

// Create and export a single instance
export const monitor = new PerformanceMonitor(70); 