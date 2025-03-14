import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { COLORS, BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH } from './constants.js';
import { BoardManager } from './boardManager.js';
import { DigitManager } from './digitManager.js';

class OctagonalDigitsBoardApplication {
  constructor() {
    // Initialize core components
    this.initializeRenderer();
    this.initializeScene();
    this.initializeCamera();
    this.initializeLights();
    this.initializeControls();
    
    // Create board and digits
    this.boardManager = new BoardManager(this.scene);
    this.boardManager.createBoard();
    
    this.digitManager = new DigitManager(this.scene);
    this.digitManager.createDigits();
    
    // Place digits according to the image
    this.placePredefinedDigits();
    
    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xf5f5f5);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }
  
  initializeScene() {
    this.scene = new THREE.Scene();
    
    // Add a subtle environment map for reflections
    const envLight = new THREE.HemisphereLight(0xffffff, 0x808080, 0.6);
    this.scene.add(envLight);
  }
  
  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.set(0, 25, 30);
    this.camera.lookAt(0, 0, 0);
  }
  
  initializeLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light (with shadows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 15);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    
    this.scene.add(directionalLight);
    
    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-15, 10, -15);
    this.scene.add(fillLight);
  }
  
  initializeControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit to slightly above ground level
  }
  
  placePredefinedDigits() {
    // Define digit placements based on the image
    const placements = [
      { value: 6, row: 0, col: 0 },
      { value: 5, row: 0, col: 1 },
      { value: 5, row: 0, col: 2 },
      { value: 6, row: 0, col: 3 },
      
      { value: 7, row: 1, col: 0 },
      { value: 0, row: 1, col: 2 },
      { value: 0, row: 1, col: 3 },
      
      { value: 8, row: 2, col: 0 },
      { value: 0, row: 2, col: 1 },
      { value: 9, row: 2, col: 3 },
      
      { value: 8, row: 3, col: 0 },
      { value: 8, row: 3, col: 1 },
      { value: 9, row: 3, col: 2 },
      { value: 3, row: 3, col: 3 }
    ];
    
    // Place each digit
    placements.forEach(placement => {
      const { value, row, col } = placement;
      
      // Select the digit (this would update appearance)
      const selectedDigit = this.digitManager.selectDigit(value);
      
      // Get cell position
      const position = this.boardManager.getCellPosition(row, col);
      
      if (selectedDigit && position) {
        // Place the digit
        this.digitManager.placeDigit(selectedDigit, position);
      }
    });
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Create and initialize application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OctagonalDigitsBoardApplication();
});

// For use with module bundlers or ES modules
export default OctagonalDigitsBoardApplication;
