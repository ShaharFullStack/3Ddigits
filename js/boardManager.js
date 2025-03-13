import * as THREE from 'three';
import { BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH, COLORS } from './constants.js';

export class BoardManager {
    constructor(scene, textureManager) {
        this.scene = scene;
        this.textureManager = textureManager;
        this.board = null;
        this.boardPlane = null;
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
        
        // Use texture manager's board material if available
        const boardMaterial = this.textureManager ? 
            this.textureManager.getBoardMaterial() : 
            new THREE.MeshPhongMaterial({
                color: COLORS.BOARD,
                specular: 0x111111,
                shininess: 30,
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

        // Add borders with improved materials
        this.addBoardBorders();

        // Add grid indicators if needed
        // this.addGridIndicators();

        // Add board to scene
        this.board.position.set(0, 0, 0);
        this.scene.add(this.board);

        return this.board;
    }

    addBoardBorders() {
        // Board borders with better materials
        const borderMaterial = this.textureManager ? 
            this.textureManager.getBoardBorderMaterial() : 
            new THREE.MeshPhongMaterial({
                color: COLORS.BOARD_BORDER,
                specular: 0x333333,
                shininess: 50,
            });

        const borders = [
            { pos: [0, 0.25, BOARD_HEIGHT / 2], scale: [BOARD_WIDTH, 0.5, 0.3] },
            { pos: [0, 0.25, -BOARD_HEIGHT / 2], scale: [BOARD_WIDTH, 0.5, 0.3] },
            { pos: [BOARD_WIDTH / 2, 0.25, 0], scale: [0.3, 0.5, BOARD_HEIGHT] },
            { pos: [-BOARD_WIDTH / 2, 0.25, 0], scale: [0.3, 0.5, BOARD_HEIGHT] },
        ];

        borders.forEach((b) => {
            const borderGeom = new THREE.BoxGeometry(1, 1, 1);
            const borderMesh = new THREE.Mesh(borderGeom, borderMaterial);
            borderMesh.position.set(...b.pos);
            borderMesh.scale.set(...b.scale);
            borderMesh.receiveShadow = true;
            borderMesh.castShadow = true;
            this.board.add(borderMesh);
        });

        // Add subtle rounded corners to enhance appearance
        const cornerRadius = 0.3;
        const cornerGeometry = new THREE.CylinderGeometry(cornerRadius, cornerRadius, 0.5, 16);
        
        const corners = [
            { pos: [BOARD_WIDTH / 2, 0.25, BOARD_HEIGHT / 2] },
            { pos: [BOARD_WIDTH / 2, 0.25, -BOARD_HEIGHT / 2] },
            { pos: [-BOARD_WIDTH / 2, 0.25, BOARD_HEIGHT / 2] },
            { pos: [-BOARD_WIDTH / 2, 0.25, -BOARD_HEIGHT / 2] },
        ];
        
        corners.forEach((c) => {
            const cornerMesh = new THREE.Mesh(cornerGeometry, borderMaterial);
            cornerMesh.position.set(...c.pos);
            cornerMesh.castShadow = true;
            cornerMesh.receiveShadow = true;
            this.board.add(cornerMesh);
        });
    }
}