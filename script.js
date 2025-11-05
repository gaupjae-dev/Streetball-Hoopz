// Function to create the basic basketball hoop
function createBasketballHoop() {
    // A group to hold all parts of the hoop so they can be moved/rotated as one
    const hoopGroup = new THREE.Group();
    
    // --- 1. Backboard (72" x 42" clear acrylic) ---
    const backboardWidth = 1.83;  // ~72 inches
    const backboardHeight = 1.07; // ~42 inches
    const backboardThickness = 0.02; // Thin
    
    const backboardGeometry = new THREE.BoxGeometry(backboardWidth, backboardHeight, backboardThickness);
    // Use a transparent material for "clear acrylic"
    const backboardMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7 
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    
    // Position the backboard at a standard height (e.g., center at 3.95m up if rim is at 3.05m)
    backboard.position.set(0, 3.95, -2); 
    hoopGroup.add(backboard);
    
    // --- 2. Rim (18" internal diameter) ---
    const rimRadius = 0.457 / 2; // Half of 18 inches
    const tubeDiameter = 0.02;    // Thickness of the metal tube
    
    const rimGeometry = new THREE.TorusGeometry(rimRadius, tubeDiameter, 16, 100);
    // Red material for the "heavy-duty, painted Spring Hinge"
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); 
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    
    // Rotate 90 degrees to face forward and position relative to the backboard
    rim.rotation.x = Math.PI / 2; 
    rim.position.set(0, backboard.position.y - (backboardHeight / 2) + 0.1, backboard.position.z + (backboardThickness / 2) + 0.45); 
    
    hoopGroup.add(rim);

    // --- 3. Net (Tapered Cone Geometry - simplified) ---
    // A simplified net shape using a cone open at the top and bottom
    const netRadiusTop = rimRadius + tubeDiameter; 
    const netRadiusBottom = 0.3; 
    const netHeight = 0.45;
    
    const netGeometry = new THREE.ConeGeometry(netRadiusBottom, netHeight, 32, 1, true); // true = open ended
    // White/off-white material
    const netMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xf5f5f5, 
        wireframe: true // Makes it look like a mesh net
    }); 
    const net = new THREE.Mesh(netGeometry, netMaterial);
    
    // Position it below the rim and rotate to hang down
    net.rotation.x = Math.PI; 
    net.position.copy(rim.position);
    net.position.y -= (netHeight / 2);
    
    hoopGroup.add(net);
    
    // --- (Optional) Adding the support pole and padding for a complete look ---
    // A cylinder for the pole (placed far back to follow the blueprint style)
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 7, 32),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    pole.position.set(0, 3.5, backboard.position.z - 5);
    hoopGroup.add(pole);
    
    // Connective bar (simplified box)
    const connector = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 3),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    connector.position.set(0, backboard.position.y, backboard.position.z - 1.5);
    connector.rotation.x = Math.PI / 4; // Angle the support
    hoopGroup.add(connector);
    
    // Don't forget to return the whole structure!
    return hoopGroup;
}

// Example usage (assuming you have a scene object in your game):
// const basketballHoop = createBasketballHoop();
// scene.add(basketballHoop);
