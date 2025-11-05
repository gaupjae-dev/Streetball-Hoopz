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

// Position the camera to look at the hoop (adjusted to be further back for a guaranteed view)
camera.position.set(0, 5, 15); // x, y, z

// Add Lighting (Crucial for seeing materials with shading)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5); // Light coming from above and to the right
directionalLight.castShadow = true; 
scene.add(directionalLight);


// -------------------------------------------------------
// 2. Hoop Creation Function (The detailed model)
// -------------------------------------------------------

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
        side: THREE.DoubleSide
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, 3.95, -2); 
    backboard.receiveShadow = true;
    hoopGroup.add(backboard);

    // --- 2. Target Box Outline (24"x18") ---
    const targetBoxW = 0.61; // 24 inches
    const targetBoxH = 0.46; // 18 inches
    const points = [
        new THREE.Vector3( -targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3(  targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3( -targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3( -targetBoxW/2, -targetBoxH/2, backboardThickness/2 + 0.001 ),
        new THREE.Vector3( -targetBoxW/2,  targetBoxH/2, backboardThickness/2 + 0.001 )
    ];
    const targetGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const targetMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const targetBox = new THREE.LineSegments(targetGeometry, targetMaterial);
    const targetCenterY = rimY + 0.15 + (targetBoxH / 2); 
    targetBox.position.set(backboard.position.x, targetCenterY, backboard.position.z + backboardThickness / 2);
    hoopGroup.add(targetBox);

    // --- 3. Thick Bottom Padding (Safety Red) ---
    const paddingHeight = 0.1; 
    const paddingDepth = backboardThickness * 3;
    const paddingGeometry = new THREE.BoxGeometry(backboardWidth, paddingHeight, paddingDepth);
    const paddingMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
    const padding = new THREE.Mesh(paddingGeometry, paddingMaterial);
    const paddingY = backboard.position.y - (backboardHeight / 2) + (paddingHeight / 2);
    padding.position.set(backboard.position.x, paddingY, backboard.position.z);
    hoopGroup.add(padding);

    // --- 4. Rim (18" internal diameter) ---
    const rimRadius = 0.457 / 2; 
    const tubeDiameter = 0.02;  
    const rimGeometry = new THREE.TorusGeometry(rimRadius, tubeDiameter, 16, 100);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2; 
    const rimZ = backboard.position.z + (backboardThickness / 2) + 0.45; 
    rim.position.set(0, rimY, rimZ); 
    hoopGroup.add(rim);

    // --- 5. NET IMPLEMENTATION ---
    const netHeight = 0.45;
    const netTopRadius = rimRadius - 0.05;
    const netBottomRadius = 0.0;
    
    // Create the conical geometry
    const netGeometry = new THREE.CylinderGeometry(netTopRadius, netBottomRadius, netHeight, 32, 1, true); 
    
    // Use a wireframe material for a net effect
    const netMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    const net = new THREE.Mesh(netGeometry, netMaterial);
    
    // Position the net right under the rim
    net.position.set(rim.position.x, rimY - (netHeight / 2), rim.position.z);
    
    hoopGroup.add(net);
    
    // --- 6. Floor Plane for reference ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x228b22 }) // Green court color
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    hoopGroup.add(floor);
    
    return hoopGroup; // Correct closing and return statement
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
    
    // Game logic goes here (if any)
    
    renderer.render(scene, camera);
}

// Start the game loop
animate();
