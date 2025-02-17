// Single worker to handle all computations
const worker = new Worker(URL.createObjectURL(new Blob([`
    let lastFrameTime = 0;
    const FRAME_BUDGET = 16.67;

    onmessage = function(e) {
        const now = performance.now();
        if (now - lastFrameTime < FRAME_BUDGET) {
            return;
        }
        lastFrameTime = now;
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