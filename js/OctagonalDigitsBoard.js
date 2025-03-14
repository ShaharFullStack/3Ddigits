import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Constants
const COLORS = {
  BOARD: 0x333333,
  BOARD_BORDER: 0x222222,
  YELLOW: 0xf4c542, // For digits 5 and 0
  RED: 0xd13b3b,    // For digits 6 and 1
  GREEN: 0x4caf50,  // For digits 7 and 2
  BLUE: 0x3f51b5,   // For digits 8 and 3
  GREY: 0xaaaaaa,   // For digits 9 and 4
  HIGHLIGHT: 0x4285f4
};

const BOARD_WIDTH = 16;
const BOARD_HEIGHT = 16;
const BOARD_DEPTH = 1;
const CELL_SIZE = 3.5;
const GRID_SIZE = 4; // 4x4 grid

class OctagonalDigitsBoard {
  constructor(container) {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xf5f5f5);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Setup scene
    this.scene = new THREE.Scene();
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.set(0, 25, 30);
    this.camera.lookAt(0, 0, 0);
    
    // Setup lighting
    this.setupLights();
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Create board and digits
    this.createBoard();
    this.createDigits();
    
    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    
    // Adjust shadow properties for better quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    
    this.scene.add(directionalLight);
    
    // Additional fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-20, 20, -20);
    this.scene.add(fillLight);
  }
  
  createBoard() {
    // Create main board (dark background)
    const boardGeometry = new THREE.BoxGeometry(BOARD_WIDTH, BOARD_DEPTH, BOARD_HEIGHT);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.BOARD,
      roughness: 0.8,
      metalness: 0.2
    });
    this.board = new THREE.Mesh(boardGeometry, boardMaterial);
    this.board.receiveShadow = true;
    this.scene.add(this.board);
    
    // Create grid cells (16 square holes)
    this.createGridCells();
    
    // Add border
    const borderGeometry = new THREE.BoxGeometry(
      BOARD_WIDTH + 0.5, 
      BOARD_DEPTH + 0.2, 
      BOARD_HEIGHT + 0.5
    );
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.BOARD_BORDER,
      roughness: 0.7,
      metalness: 0.3
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.y = -0.1; // Slightly below the board
    this.scene.add(border);
  }
  
  createGridCells() {
    const cellSize = CELL_SIZE;
    const gap = 0.5; // Gap between cells
    const depth = 0.6; // Depth of the hole
    
    // Calculate total grid size
    const totalSize = GRID_SIZE * cellSize + (GRID_SIZE - 1) * gap;
    const startOffset = -totalSize / 2 + cellSize / 2;
    
    // Create cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Calculate position
        const x = startOffset + col * (cellSize + gap);
        const z = startOffset + row * (cellSize + gap);
        
        // Create hole (square cutout)
        const holeGeometry = new THREE.BoxGeometry(cellSize, depth, cellSize);
        const holeMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x111111,
          roughness: 0.9,
          metalness: 0.1
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(x, BOARD_DEPTH / 2 - depth / 2, z);
        this.scene.add(hole);
      }
    }
  }
  
  createDigits() {
    // Create and place the digits according to the image
    this.createDigitPlacements([
      { value: 6, row: 0, col: 0, color: COLORS.RED },
      { value: 5, row: 0, col: 1, color: COLORS.GREEN },
      { value: 5, row: 0, col: 2, color: COLORS.YELLOW },
      { value: 6, row: 0, col: 3, color: COLORS.RED },
      
      { value: 7, row: 1, col: 0, color: COLORS.GREEN },
      { value: 0, row: 1, col: 2, color: COLORS.YELLOW },
      { value: 0, row: 1, col: 3, color: COLORS.YELLOW },
      
      { value: 8, row: 2, col: 0, color: COLORS.BLUE },
      { value: 0, row: 2, col: 1, color: COLORS.YELLOW },
      { value: 9, row: 2, col: 3, color: COLORS.GREY },
      
      { value: 8, row: 3, col: 0, color: COLORS.BLUE },
      { value: 8, row: 3, col: 1, color: COLORS.BLUE },
      { value: 9, row: 3, col: 2, color: COLORS.GREY },
      { value: 3, row: 3, col: 3, color: COLORS.BLUE }
    ]);
  }
  
  createDigitPlacements(placements) {
    const cellSize = CELL_SIZE;
    const gap = 0.5;
    const totalSize = GRID_SIZE * cellSize + (GRID_SIZE - 1) * gap;
    const startOffset = -totalSize / 2 + cellSize / 2;
    
    placements.forEach(placement => {
      const { value, row, col, color } = placement;
      
      // Calculate position
      const x = startOffset + col * (cellSize + gap);
      const z = startOffset + row * (cellSize + gap);
      const y = BOARD_DEPTH / 2 + 0.1; // Slightly above the board
      
      // Create the digit
      const digit = this.createOctagonalDigit(value, color);
      digit.position.set(x, y, z);
      
      this.scene.add(digit);
    });
  }
  
  createOctagonalDigit(value, color) {
    const group = new THREE.Group();
    
    // Create octagonal shape for the digit
    const octagonShape = new THREE.Shape();
    const size = 1.6;
    const smallSize = size * 0.4;
    
    // Create octagon points
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      
      if (i === 0) {
        octagonShape.moveTo(x, y);
      } else {
        octagonShape.lineTo(x, y);
      }
    }
    octagonShape.closePath();
    
    // Create inner cutout for the octagon
    const innerShape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const x = Math.cos(angle) * (size - smallSize);
      const y = Math.sin(angle) * (size - smallSize);
      
      if (i === 0) {
        innerShape.moveTo(x, y);
      } else {
        innerShape.lineTo(x, y);
      }
    }
    innerShape.closePath();
    
    octagonShape.holes.push(innerShape);
    
    // Create extrusion settings
    const extrudeSettings = {
      steps: 1,
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    };
    
    // Create geometry and material
    const geometry = new THREE.ExtrudeGeometry(octagonShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0.2
    });
    
    // Create mesh
    const digit = new THREE.Mesh(geometry, material);
    digit.castShadow = true;
    digit.receiveShadow = true;
    
    // Add segments for digit display based on value
    this.addDigitSegments(digit, value, color);
    
    // Add digit to group
    group.add(digit);
    
    // Store value for reference
    group.userData.value = value;
    
    return group;
  }
  
  addDigitSegments(digitMesh, value, color) {
    // Add the appropriate segments based on the digit value
    const segments = this.getSegmentsForDigit(value);
    const segmentWidth = 0.4;
    const segmentHeight = 1.4;
    const segmentDepth = 0.15;
    const darkerColor = new THREE.Color(color).multiplyScalar(0.8);
    
    // Create horizontal segments
    const horizontalGeometry = new THREE.BoxGeometry(segmentHeight, segmentDepth, segmentWidth);
    
    // Create vertical segments
    const verticalGeometry = new THREE.BoxGeometry(segmentWidth, segmentDepth, segmentHeight);
    
    // Define segment positions (for a 7-segment display layout adjusted to octagon)
    const segmentPositions = {
      top: [0, 0.15, -1.0],
      topRight: [0.8, 0.15, -0.5],
      bottomRight: [0.8, 0.15, 0.5],
      bottom: [0, 0.15, 1.0],
      bottomLeft: [-0.8, 0.15, 0.5],
      topLeft: [-0.8, 0.15, -0.5],
      middle: [0, 0.15, 0]
    };
    
    // Material for the segments
    const segmentMaterial = new THREE.MeshStandardMaterial({
      color: darkerColor,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Add the required segments
    segments.forEach(segment => {
      let geometry, position, rotation;
      
      switch(segment) {
        case 'top':
        case 'bottom':
        case 'middle':
          geometry = horizontalGeometry;
          position = segmentPositions[segment];
          rotation = [0, 0, 0];
          break;
        case 'topRight':
        case 'bottomRight':
        case 'topLeft':
        case 'bottomLeft':
          geometry = verticalGeometry;
          position = segmentPositions[segment];
          rotation = [0, 0, 0];
          break;
      }
      
      if (geometry && position) {
        const segmentMesh = new THREE.Mesh(geometry, segmentMaterial);
        segmentMesh.position.set(...position);
        if (rotation) {
          segmentMesh.rotation.set(...rotation);
        }
        segmentMesh.castShadow = true;
        digitMesh.add(segmentMesh);
      }
    });
  }
  
  getSegmentsForDigit(value) {
    // Define which segments are active for each digit
    const digitSegments = {
      0: ['top', 'topRight', 'bottomRight', 'bottom', 'bottomLeft', 'topLeft'],
      1: ['topRight', 'bottomRight'],
      2: ['top', 'topRight', 'middle', 'bottomLeft', 'bottom'],
      3: ['top', 'topRight', 'middle', 'bottomRight', 'bottom'],
      4: ['topLeft', 'topRight', 'middle', 'bottomRight'],
      5: ['top', 'topLeft', 'middle', 'bottomRight', 'bottom'],
      6: ['top', 'topLeft', 'middle', 'bottomLeft', 'bottomRight', 'bottom'],
      7: ['top', 'topRight', 'bottomRight'],
      8: ['top', 'topRight', 'bottomRight', 'bottom', 'bottomLeft', 'topLeft', 'middle'],
      9: ['top', 'topRight', 'bottomRight', 'bottom', 'topLeft', 'middle']
    };
    
    return digitSegments[value] || [];
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

// Initialize the application
function init() {
  const container = document.getElementById('container');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'container';
    document.body.appendChild(newContainer);
    new OctagonalDigitsBoard(newContainer);
  } else {
    new OctagonalDigitsBoard(container);
  }
}

// Start the application
window.onload = init;
