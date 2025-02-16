export function createFloatingNames() {
    const container = document.querySelector('.floating-names');
    const names = 15; // Reduced number of floating elements
    
    for (let i = 0; i < names; i++) {
        const name = document.createElement('div');
        name.className = 'floating-name';
        name.textContent = 'Coming Soon...';
        
        // Random initial position
        name.style.left = `${Math.random() * 100}vw`;
        name.style.top = `${Math.random() * 100}vh`;
        
        // Random animation timing
        const duration = 15 + Math.random() * 20;
        const delay = Math.random() * -20;
        name.style.animationDuration = `${duration}s`;
        name.style.animationDelay = `${delay}s`;
        
        // Random rotation
        const rotation = Math.random() * 360;
        name.style.transform = `rotate(${rotation}deg)`;
        
        // Add back random size variation
        const size = 40 + Math.random() * 40; // Will give sizes between 40px and 80px
        name.style.fontSize = `${size}px`;
        
        container.appendChild(name);
    }
} 