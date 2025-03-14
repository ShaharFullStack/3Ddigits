
  
  // BoardManager.js
  import * as THREE from 'three';
  import { BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH, COLORS, CELL_SIZE, GRID_SIZE } from './constants.js';
  
  export class BoardManager {
    constructor(scene, textureManager) {
      this.scene = scene;
      this.textureManager = textureManager;
      this.board = null;
      this.boardPlane = null;
      this.cells = [];
    }
  
    createBoard() {
      // Create board group
      this.board = new THREE.Group();
  
      // Base board with improved materials
      const boardGeometry = new THREE.BoxGeometry(
        BOARD_WIDTH,
        BOARD_DEPTH,
        BOARD_HEIGHT
      );
      
      // Create board material
      const boardMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.BOARD,
        roughness: 0.8,
        metalness: 0.2
      });
        
      const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
      boardMesh.receiveShadow = true;
      this.board.add(boardMesh);
  
      // Invisible plane for collisions at the correct height
      this.boardPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_HEIGHT),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      this.boardPlane.rotation.x = -Math.PI / 2;
      this.boardPlane.position.y = BOARD_DEPTH / 2; // Set to the top of the board
      this.boardPlane.name = "boardPlane";
      this.board.add(this.boardPlane);
  
      // Add borders
      this.addBoardBorders();
  
      // Create grid cells (16 square holes)
      this.createGridCells();
  
      // Add board to scene
      this.board.position.set(0, 0, 0);
      this.scene.add(this.board);
  
      return this.board;
    }
  
    addBoardBorders() {
      // Board borders material
      const borderMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.BOARD_BORDER,
        roughness: 0.7,
        metalness: 0.3
      });
  
      // Create outer border frame
      const borderGeometry = new THREE.BoxGeometry(
        BOARD_WIDTH + 0.5, 
        BOARD_DEPTH + 0.2, 
        BOARD_HEIGHT + 0.5
      );
      
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.y = -0.1; // Slightly below the board
      border.receiveShadow = true;
      
      this.board.add(border);
  
      // Add rounded corners for a more refined look
      const cornerRadius = 0.5;
      const cornerGeometry = new THREE.CylinderGeometry(cornerRadius, cornerRadius, BOARD_DEPTH + 0.2, 16);
      
      const corners = [
        { pos: [BOARD_WIDTH / 2, 0, BOARD_HEIGHT / 2] },
        { pos: [BOARD_WIDTH / 2, 0, -BOARD_HEIGHT / 2] },
        { pos: [-BOARD_WIDTH / 2, 0, BOARD_HEIGHT / 2] },
        { pos: [-BOARD_WIDTH / 2, 0, -BOARD_HEIGHT / 2] },
      ];
      
      corners.forEach((c) => {
        const cornerMesh = new THREE.Mesh(cornerGeometry, borderMaterial);
        cornerMesh.position.set(...c.pos);
        cornerMesh.castShadow = true;
        cornerMesh.receiveShadow = true;
        this.board.add(cornerMesh);
      });
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
          this.board.add(hole);
          
          // Store cell position for digit placement
          this.cells.push({
            row,
            col,
            position: new THREE.Vector3(x, BOARD_DEPTH / 2, z)
          });
        }
      }
    }
    
    // Get cell position by row and column
    getCellPosition(row, col) {
      const cell = this.cells.find(c => c.row === row && c.col === col);
      return cell ? cell.position.clone() : null;
    }
    
    // Highlight cell for placement preview
    highlightCell(row, col, highlight = true) {
      // Implementation for highlighting cells when hovering
      // This would create a temporary highlight effect
      const cell = this.cells.find(c => c.row === row && c.col === col);
      if (cell && cell.highlightMesh) {
        cell.highlightMesh.visible = highlight;
      } else if (cell && highlight) {
        const highlightGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9);
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: COLORS.HIGHLIGHT,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        
        const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightMesh.rotation.x = -Math.PI / 2;
        highlightMesh.position.copy(cell.position);
        highlightMesh.position.y += 0.01; // Slightly above the board
        
        this.board.add(highlightMesh);
        cell.highlightMesh = highlightMesh;
      }
    }
  }