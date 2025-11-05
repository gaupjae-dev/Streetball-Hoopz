// =================================================================
// GLOBALS & SETUP
// =================================================================
let scene, camera, renderer, ballMesh, ballBody, world;
const timeStep = 1 / 60; // CRITICAL: Fixed physics step

let isShooting = false;
let shotPower = 0;
let isBallInHand = true;

const shotMeterFill = document.getElementById('shot-meter-fill');
const shotMeterContainer = document.getElementById('shot-meter-container');

// =================================================================
// CORE FUNCTIONS
// =================================================================

function initScene() {
    // --- THREE.JS ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 5); // Player starting position
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // --- LIGHTING FIX: Strong Directional Light ---
    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Increased intensity to 5
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // --- CANNON.JS ---
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); 
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    
    // --- CREATE OBJECTS ---
    createCourt();
    createBall(); 
    
    // Start the game loop
    animate();
}

function createCourt() {
    // Three.js Ground Mesh (Visible)
    const courtGeometry = new THREE.PlaneGeometry(30, 30);
    const courtMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    const courtMesh = new THREE.Mesh(courtGeometry, courtMaterial);
    courtMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat
    scene.add(courtMesh);

    // Cannon.js Ground Body (Physics)
    const courtShape = new CANNON.Plane();
    const courtBody = new CANNON.Body({ mass: 0, shape: courtShape });
    courtBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(courtBody);
}

function createBall() {
    const ballRadius = 0.24;
    // Three.js Ball Mesh (Visible)
    ballMesh = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 32, 32), new THREE.MeshPhongMaterial({ color: 0xff8c00 }));
    // Cannon.js Ball Body (Physics)
    ballBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(ballRadius) });
    
    resetBall();
    world.addBody(ballBody);
    scene.add(ballMesh);
}

function resetBall() {
    isBallInHand = true;
    ballBody.position.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);
    ballBody.quaternion.set(0, 0, 0, 1);
}

function shootBall() {
    if (!isBallInHand) return;

    // Simplified shot logic
    const velocityFactor = Math.max(0.1, shotPower / 100);
    const BASE_SPEED = 15; 
    
    const direction = camera.getWorldDirection(new THREE.Vector3());
    const impulse = new CANNON.Vec3(
        direction.x * BASE_SPEED * velocityFactor, 
        direction.y * BASE_SPEED * 0.8 * velocityFactor + 5, // Vertical boost
        direction.z * BASE_SPEED * velocityFactor
    );

    ballBody.applyImpulse(impulse, ballBody.position);
    isBallInHand = false;
    isShooting = false;
    shotPower = 0;
    
    setTimeout(resetBall, 5000); 
}

// =================================================================
// ANIMATION LOOP (The Fix is HERE!)
// =================================================================

function animate() {
    requestAnimationFrame(animate);

    // CRITICAL: Advance the physics world
    if (world) {
        world.step(timeStep); 
    }

    // Sync mesh to body
    if (ballMesh && ballBody) {
        if (isBallInHand) {
            // Keep ball glued to player position
            ballBody.position.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
        }
        ballMesh.position.copy(ballBody.position);
        ballMesh.quaternion.copy(ballBody.quaternion);
    }
    
    // Shot Meter Logic
    if (isShooting) {
        shotPower = Math.min(100, shotPower + 2);
        shotMeterFill.style.width = `${shotPower}%`;
        shotMeterContainer.style.display = 'block';
    } else {
        shotMeterContainer.style.display = 'none';
    }

    renderer.render(scene, camera);
}

// =================================================================
// EVENT LISTENERS
// =================================================================

document.addEventListener('mousedown', (e) => {
    if (e.button === 0 && isBallInHand) {
        isShooting = true;
        shotPower = 0;
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0 && isShooting) {
        shootBall();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetBall();
    }
});

// Start initialization once DOM is ready
document.addEventListener('DOMContentLoaded', initScene);
