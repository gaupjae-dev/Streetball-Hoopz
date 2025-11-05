// Ensure you have loaded the Three.js library via a script tag in your index.html
// Example: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

// -------------------------------------------------------
// 1. Scene, Camera, Renderer, and Lighting Setup
// -------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x336699); // A blue sky background

// Set up Camera (Field of View, Aspect Ratio, Near/Far Clipping)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Set up Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true }); 
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer's canvas to the HTML body
document.body.appendChild(renderer.domElement); 

// Position the camera to look at the hoop
camera.position.set(0, 3, 8); // x, y, z

// Add Lighting (Crucial for seeing materials with shading)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5); // Light coming from above and to the right
directionalLight.castShadow = true; // Enable shadows (requires further setup)
scene.add(directionalLight);


// -------------------------------------------------------
// 2. Hoop Creation Function (The detailed model)
// -------------------------------------------------------

function createBasketballHoop() {
    // A group to hold all parts of the hoop so they can be moved/rotated as one
    const hoopGroup = new THREE.Group();
    
    // --- Backboard (72" x 42" clear acrylic) ---
    const backboardWidth = 1.83;  // ~72 inches
    const backboardHeight = 1.07; // ~42 inches
    const backboardThickness = 0.02; // Thin
    
    const backboardGeometry = new THREE.BoxGeometry(backboardWidth, backboardHeight, backboardThickness);
    const backboardMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7 
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    
    // Position the backboard (center at 3.95m up)
    backboard.position.set(0, 3.95, -2); 
    hoopGroup.add(backboard);
    
    // --- Rim (18" internal diameter) ---
    const rimRadius = 0.457 / 2; // Half of 18 inches
    const tubeDiameter = 0.02;    // Thickness of the metal tube
    
    const rimGeometry = new THREE.TorusGeometry(rimRadius, tubeDiameter, 16, 100);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red material
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    
    // Rotate 90 degrees to face forward
    rim.rotation.x = Math.PI / 2; 
    
    // Position relative to the backboard for the standard 10ft (3.05m) height
    const rimY = 3.05; 
    const rimZ = backboard.position.z + (backboardThickness / 2) + 0.45; // Extend forward
    rim.position.set(0, rimY, rimZ); 
    
    hoopGroup.add(rim);

    // --- Net (Simplified Cone - wireframe for net effect) ---
    const netRadiusBottom = 0.3; 
    const netHeight = 0.45;
    
    // Open-ended cone for the net structure
    const netGeometry = new THREE.ConeGeometry(netRadiusBottom, netHeight, 32, 1, true); 
    const netMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xf5f5f5, 
        wireframe: true // Makes it look like a mesh net
    }); 
    const net = new THREE.Mesh(netGeometry, netMaterial);
    
    // Position it below the rim
    net.rotation.x = Math.PI; // Rotate to hang down
    net.position.copy(rim.position);
    net.position.y -= (netHeight / 2);
    
    hoopGroup.add(net);
    
    // --- (Optional) Floor Plane for reference ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x228b22 }) // Green court color
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    hoopGroup.add(floor);
    
    return hoopGroup;
}


// -------------------------------------------------------
// 3. Integration and Game Loop
// -------------------------------------------------------

const basketballHoop = createBasketballHoop();
scene.add(basketballHoop);

// Handle window resizing (important for responsive 3D)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// The main game loop
function animate() {
    requestAnimationFrame(animate);

    // This is where you would put game logic like ball movement, physics, and scoring checks
    
    renderer.render(scene, camera);
}

// Start the game loop
animate();
