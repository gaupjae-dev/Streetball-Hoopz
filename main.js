// main.js (Revised)

// 1. SCENE SETUP (THREE.js)
const scene = new THREE.Scene();
// ... (Camera, Renderer, and Lighting setup remains the same)

// *** NEW: PHYSICS SETUP (CANNON-es) ***
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0) // Standard Earth gravity (m/s^2)
});

// Store references for the ball and its physics body
let basketballMesh;
let basketballBody; 

// --- MESH CREATION FUNCTIONS ---

function createCourt() {
    // ... (Three.js court mesh creation remains the same)
    
    // NEW: Create a static physics body for the court (Plane)
    const courtShape = new CANNON.Plane();
    // Mass 0 makes it static (unmovable)
    const courtBody = new CANNON.Body({ mass: 0, shape: courtShape });
    
    // Rotate 90 degrees around the X-axis to make it horizontal (Cannon uses Quaternions)
    courtBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    
    world.addBody(courtBody);
}

function createBall() {
    // ... (Three.js ball mesh creation remains the same)
    
    // Store reference to the mesh
    basketballMesh = ball;

    // NEW: Create a physics body for the ball (Sphere)
    const radius = 0.5; // Must match the Three.js SphereGeometry radius
    const ballShape = new CANNON.Sphere(radius);
    
    // Mass > 0 makes it dynamic (affected by forces/gravity)
    basketballBody = new CANNON.Body({ 
        mass: 5, 
        shape: ballShape, 
        position: new CANNON.Vec3(0, 5, 0) // Start position
    });
    
    world.addBody(basketballBody);
}

// ... (Call createCourt() and createBall())

// --- ANIMATION/RENDER LOOP (Updated) ---
const timeStep = 1 / 60; // Fixed timestep for physics simulation

function animate() {
    requestAnimationFrame(animate); 
    
    // 1. ADVANCE PHYSICS SIMULATION
    world.step(timeStep);

    // 2. SYNCHRONIZE THREE.js MESH WITH CANNON.js BODY
    if (basketballMesh && basketballBody) {
        // Copy the position from the physics body to the graphical mesh
        basketballMesh.position.copy(basketballBody.position);
        
        // Copy the rotation (quaternion) from the body to the mesh
        basketballMesh.quaternion.copy(basketballBody.quaternion);
    }
    
    renderer.render(scene, camera);
}

// ... (Resize listener and animate() call remain the same)
