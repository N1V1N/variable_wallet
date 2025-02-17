// Single worker to handle all computations with stricter timing
const worker = new Worker(URL.createObjectURL(new Blob([`
    let lastFrameTime = 0;
    const FRAME_BUDGET = 33.33; // 30fps lock
    let busy = false;

    function simulateWork() {
        const start = performance.now();
        while (performance.now() - start < 5) {
            // Artificial work to keep thread busy
        }
    }

    onmessage = function(e) {
        if (busy) return;
        
        const now = performance.now();
        if (now - lastFrameTime < FRAME_BUDGET) {
            return;
        }

        busy = true;
        simulateWork();
        lastFrameTime = now;
        busy = false;
        
        postMessage({ type: 'frame', timestamp: now });
    };
`], { type: 'text/javascript' })));

// Export the worker controller
export const CoreLimiter = {
    requestFrame(callback) {
        worker.onmessage = (e) => {
            if (e.data.type === 'frame') {
                callback(e.data.timestamp);
            }
        };
        worker.postMessage({ type: 'requestFrame' });
    },

    cleanup() {
        worker.terminate();
    }
};

// Force initialization
console.log('Core limiter initialized');
worker.postMessage({ type: 'init' }); 