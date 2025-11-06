// main.js

// 1. SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue sky color

// 2. CAMERA SETUP (Perspective camera mimics human eye)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10); // Move camera back and up
camera.lookAt(0, 0, 0); // Point camera towards the center of the scene

// 3. RENDERER SETUP
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add the canvas to the HTML

// 4. LIGHTING (Essential to see anything)
const ambientLight = new THREE.AmbientLight(0x404040, 5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5); // Light coming from one direction
scene.add(directionalLight);

// 5. ANIMATION/RENDER LOOP
function animate() {
    requestAnimationFrame(animate); // Create a continuous loop
    
    // *** GAME LOGIC GOES HERE IN LATER STEPS ***

    renderer.render(scene, camera);
}

// Handle resizing the window
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

animate(); // Start the game loop!
