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

// Function to create the detailed basketball hoop model
function createBasketballHoop() {
    const hoopGroup = new THREE.Group();
    const rimY = 3.05; // Standard rim height in meters
    const backboardWidth = 1.83;  // 72 inches
    const backboardHeight = 1.07; // 42 inches
    const backboardThickness = 0.02; 
    
    // --- 1. Backboard (72" x 42" clear acrylic) ---
    const backboardGeometry = new THREE.BoxGeometry(backboardWidth, backboardHeight, backboardThickness);
    const backboardMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7,
        side: THREE.DoubleSide // Ensure it's visible from both sides
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, 3.95, -2); 
    backboard.receiveShadow = true;
    hoopGroup.add(backboard);

    // --- 2. Target Box Outline (24"x18") ---
    const targetBoxW = 0.61; // 24 inches
    const targetBoxH = 0.46; // 18 inches
    
    // Define the 8 corners of the box for the line segments
    const points = [
        // Top edge
        new THREE.Vector3( -targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        
        // Right edge
        new THREE.Vector3(  targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        
        // Bottom edge
        new THREE.Vector3(  targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3( -targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        
        // Left edge
        new THREE.Vector3( -targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3( -targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 )
    ];
    
    const targetGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const targetMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const targetBox = new THREE.LineSegments(targetGeometry, targetMaterial);
    
    // Position the target box on the backboard, adjusted so the bottom is 0.15m above the rim height
    const targetCenterY = rimY + 0.15 + (targetBoxH / 2); 
    targetBox.position.set(backboard.position.x, targetCenterY, backboard.position.z + backboardThickness / 2);

    hoopGroup.add(targetBox);

    // --- 3. Thick Bottom Padding (Safety Red) ---
    const paddingHeight = 0.1; 
    const paddingDepth = backboardThickness * 3; // Make it visibly thick
    
    const paddingGeometry = new THREE.BoxGeometry(backboardWidth, paddingHeight, paddingDepth);
    const paddingMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 }); // Safety Red
    const padding = new THREE.Mesh(paddingGeometry, paddingMaterial);
    
    // Position the padding at the very bottom of the backboard
    const paddingY = backboard.position.y - (backboardHeight / 2) + (paddingHeight / 2);
    padding.position.set(backboard.position.x, paddingY, backboard.position.z);
    
    hoopGroup.add(padding);

    // --- 4. Rim (18" internal diameter) ---
    const rimRadius = 0.457 / 2; 
    const tubeDiameter = 0.02;  
    
    const rimGeometry = new THREE.TorusGeometry(rimRadius, tubeDiameter, 16, 100);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red material
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    
    rim.rotation.x = Math.PI / 2; 
    const rimZ = backboard.position.z + (backboardThickness / 2) + 0.45; 
    rim.position.set(0, rimY, rimZ); 
    
    hoopGroup.add(rim);

    // --- 5. Net (Placeholder) ---
    // You would create your net mesh here and add it to hoopGroup.

    // --- 6. (Optional) Floor Plane for reference ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x228b22 }) // Green court color
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    hoopGroup.add(floor);
    
    return hoopGroup; // Corrected: function returns here
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
