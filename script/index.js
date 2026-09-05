// Simple parallax effect for background grid based on mouse movement
document.addEventListener('mousemove', (e) => {
    const grid = document.querySelector('.grid-bg');
    if (grid) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        grid.style.transform = `perspective(500px) rotateX(60deg) translate(${x}px, ${y}px)`;
    }
});
