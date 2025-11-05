// =================================================================
// 1. GLOBAL VARIABLES & CONSTANTS
// =================================================================

// Three.js Variables
let scene, camera, renderer, ballMesh, hoopRingMesh, backboardMesh, orbitControls;
let controlsInfo, scoreDisplay, cameraToggle;
let clock = new THREE.Clock();

// Cannon.js Variables
let world, ballBody, courtBody, hoopRingBody, backboardBody;
const timeStep = 1 / 60; // Fixed physics step

// Game State Variables
let isShooting = false;
let isCharged = false;
let shotPower = 0;
let score = 0;
let isMenuOpen = true; // Start with the menu open
let currentCameraMode = 'first-person'; 
let isBallInHand = true;

// Shot Meter Constants
const MAX_POWER = 100;
const SWEET_SPOT_MIN = 40;
const SWEET_SPOT_MAX = 70;

// Element References (Ensure these IDs exist in your index.html)
const shotMeterFill = document.getElementById('shot-meter-fill');
const shotMeterContainer = document.getElementById('shot-meter-container');
const mainMenu = document.getElementById('main-menu');
const quickplayMode = document.getElementById('quickplay-game-mode');
const scoreElement = document.getElementById('score-display');
const sceneContainer = document.getElementById('scene-container');
const playButton = document.getElementById('play-button'); // Assuming you have a Play button ID

// =================================================================
// 2. CORE SETUP FUNCTIONS
// =================================================================

function initScene() {
    // --- Three.js Setup ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background
    
    // Camera Setup (start with first-person perspective)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 5); // Player start position

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneContainer.appendChild(renderer.domElement);

    // Orbit Controls for 'orbital' mode
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enabled = false;
    orbitControls.target.set(0, 2, 0); // Focus on the hoop area
    
    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // --- Cannon.js Setup ---
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    
    createCourt();
    createHoop();
    createBall();
    
    // Start the game loop
    animate();
}

function createCourt() {
    // Three.js Ground Mesh
    const courtGeometry = new THREE.PlaneGeometry(30, 30);
    const courtMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    const courtMesh = new THREE.Mesh(courtGeometry, courtMaterial);
    courtMesh.rotation.x = -Math.PI / 2;
    scene.add(courtMesh);

    // Cannon.js Ground Body
    const courtShape = new CANNON.Plane();
    courtBody = new CANNON.Body({ mass: 0, shape: courtShape });
    courtBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate to lay flat
    world.addBody(courtBody);
}

function createHoop() {
    // Hoop position (adjust Z for distance from player start)
    const hoopPosition = new CANNON.Vec3(0, 3.05, -10); 
    const hoopRadius = 0.45; // Approx standard radius

    // 1. Backboard (Cannon Body)
    const backboardShape = new CANNON.Box(new CANNON.Vec3(1.8 / 2, 1.05 / 2, 0.05 / 2));
    backboardBody = new CANNON.Body({ mass: 0, shape: backboardShape });
    backboardBody.position.set(hoopPosition.x, hoopPosition.y + 0.6, hoopPosition.z - 0.05); // slightly behind the rim
    world.addBody(backboardBody);

    // 2. Hoop Rim (Cannon Body - use a hollow cylinder or torus shape approximation)
    // Cannon.js doesn't have a torus, so we'll use a thin cylinder or a simple ring of bodies.
    // For simplicity, we'll use a slightly thick cylinder that acts as a solid ring.
    const rimShape = new CANNON.Cylinder(hoopRadius, hoopRadius, 0.05, 12);
    hoopRingBody = new CANNON.Body({ mass: 0, shape: rimShape });
    hoopRingBody.position.copy(hoopPosition);
    hoopRingBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate to lay flat
    world.addBody(hoopRingBody);

    // 3. Three.js Meshes (Visuals for the hoop)
    const rimGeometry = new THREE.TorusGeometry(hoopRadius, 0.02, 16, 100);
    const rimMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    hoopRingMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    hoopRingMesh.position.set(hoopPosition.x, hoopPosition.y, hoopPosition.z);
    hoopRingMesh.rotation.x = 0; // Torus is created on XZ plane by default
    scene.add(hoopRingMesh);

    const backboardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.05);
    const backboardMaterial = new THREE.MeshBasicMaterial({ color: 0x00c4ff, transparent: true, opacity: 0.8 });
    backboardMesh = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboardMesh.position.set(backboardBody.position.x, backboardBody.position.y, backboardBody.position.z);
    scene.add(backboardMesh);

    // Simple Pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, hoopPosition.y, 32);
    const poleMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
    poleMesh.position.set(hoopPosition.x, hoopPosition.y / 2, hoopPosition.z);
    scene.add(poleMesh);

    // --- Scoring Zone (Invisible Sensor Body) ---
    // A thin cylinder slightly below the rim to detect successful shots
    const sensorShape = new CANNON.Cylinder(hoopRadius * 0.9, hoopRadius * 0.9, 0.05, 12);
    const sensorBody = new CANNON.Body({ mass: 0, shape: sensorShape, isTrigger: true });
    sensorBody.position.set(hoopPosition.x, hoopPosition.y - 0.1, hoopPosition.z);
    sensorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    sensorBody.scoreCheck = true; // Custom property to identify the sensor
    world.addBody(sensorBody);

    // Collision listener for scoring
    sensorBody.addEventListener('collide', (e) => {
        if (e.body === ballBody && e.target.scoreCheck) {
             // Only score if the ball is moving downwards (a simple check)
             if (ballBody.velocity.y < -0.1) {
                updateScore(1);
             }
        }
    });
}

function createBall() {
    // Three.js Ball Mesh
    const ballRadius = 0.24; // Approx size
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff8c00 });
    ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Cannon.js Ball Body
    const ballShape = new CANNON.Sphere(ballRadius);
    ballBody = new CANNON.Body({ mass: 1, shape: ballShape, material: new CANNON.Material('ballMaterial') });
    
    // Set initial position (In player's hand)
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

// =================================================================
// 3. GAME LOGIC & ANIMATION LOOP (The "animate" function that was freezing)
// =================================================================

function animate() {
    requestAnimationFrame(animate);

    // --- 1. Physics Update (CRITICAL FIX) ---
    world.step(timeStep);

    // --- 2. Mesh-to-Body Sync (CRITICAL FIX) ---
    if (ballMesh && ballBody) {
        ballMesh.position.copy(ballBody.position);
        ballMesh.quaternion.copy(ballBody.quaternion);

        // Keep ball in hand if not thrown
        if (isBallInHand) {
            ballBody.position.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
        }
    }
    
    // --- 3. Shot Meter Update ---
    if (isShooting) {
        shotPower += 2; // Increase power over time
        if (shotPower > MAX_POWER) {
            shotPower = MAX_POWER;
            isCharged = true;
            shotMeterContainer.classList.add('pulse-glow');
        }
        
        const fillPercentage = (shotPower / MAX_POWER) * 100;
        shotMeterFill.style.width = `${fillPercentage}%`;
        shotMeterContainer.style.display = 'block';
    } else {
        shotMeterContainer.style.display = 'none';
        shotMeterContainer.classList.remove('pulse-glow');
    }

    // --- 4. Camera Update ---
    if (currentCameraMode === 'orbital' && orbitControls.enabled) {
        orbitControls.update();
    }
    
    // --- 5. Rendering ---
    renderer.render(scene, camera);
}

// =================================================================
// 4. PLAYER INTERACTION & SHOOTING
// =================================================================

function shootBall() {
    if (!isBallInHand) return;

    // Calculate the shot velocity based on power
    let velocityFactor = shotPower / MAX_POWER;
    velocityFactor = Math.max(0.1, velocityFactor); // Min velocity check

    // Base forward velocity
    const BASE_SPEED = 15; 
    const force = new THREE.Vector3(0, BASE_SPEED * 0.8 * velocityFactor, -BASE_SPEED * velocityFactor);

    // Get the direction of the shot based on the camera's orientation
    const direction = camera.getWorldDirection(new THREE.Vector3());
    
    // Create an impulse vector (force in the direction of the camera)
    const impulse = new CANNON.Vec3(
        direction.x * force.z, 
        direction.y * force.y + 5, // Add a vertical boost
        direction.z * force.z
    );

    // Apply the impulse
    ballBody.applyImpulse(impulse, ballBody.position);
    
    isBallInHand = false;
    isShooting = false;
    isCharged = false;
    shotPower = 0;

    // Set a timeout to automatically reset the ball if it goes out of bounds or slows down
    setTimeout(resetBall, 5000); 
}

// =================================================================
// 5. UI & EVENT HANDLERS
// =================================================================

function toggleCamera() {
    if (currentCameraMode === 'first-person') {
        // Switch to orbital
        currentCameraMode = 'orbital';
        cameraToggle.textContent = 'Camera: Orbital (T)';
        orbitControls.enabled = true;
        
        // Move camera to a better viewing angle for orbital mode
        camera.position.set(10, 5, 10); 
    } else {
        // Switch to first-person
        currentCameraMode = 'first-person';
        cameraToggle.textContent = 'Camera: First Person (T)';
        orbitControls.enabled = false;
        
        // Return camera to a default player view
        camera.position.set(0, 1.8, 5); 
    }
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

function startGame() {
    isMenuOpen = false;
    mainMenu.style.display = 'none';
    quickplayMode.style.display = 'block';
    resetBall();
}

// --- Input Event Listeners ---

document.addEventListener('mousedown', (e) => {
    if (!isMenuOpen && e.button === 0 && isBallInHand) { // Left-click to start charge
        isShooting = true;
        shotPower = 0;
    }
});

document.addEventListener('mouseup', (e) => {
    if (!isMenuOpen && e.button === 0 && isShooting) { // Left-click release to shoot
        shootBall();
    }
});

document.addEventListener('keydown', (e) => {
    if (!isMenuOpen) {
        if (e.key === 't' || e.key === 'T') {
            toggleCamera();
        }
        if (e.key === 'r' || e.key === 'R') {
            resetBall();
        }
    }
});

window.addEventListener('resize', () => {
    // Handle screen resize
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =================================================================
// 6. INITIALIZATION
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    cameraToggle = document.getElementById('camera-toggle');
    scoreElement.textContent = `Score: ${score}`; // Initialize score display

    // Set up menu button listener
    if (playButton) {
        playButton.addEventListener('click', startGame);
    }
    if (cameraToggle) {
        cameraToggle.addEventListener('click', toggleCamera);
    }
    
    // Hide game elements until play is clicked
    if (quickplayMode) {
        quickplayMode.style.display = 'none';
    }

    // Initialize Three.js/Cannon.js only after DOM is loaded
    initScene();
    
    // Hide the shot meter initially
    shotMeterContainer.style.display = 'none';
});
