import * as THREE from 'three';

import {
    COLORS,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    BOARD_DEPTH,
    GRID_SIZE,
    GRID_OFFSET_X,
    GRID_OFFSET_Z,
    GRID_ROWS,
    GRID_COLS
} from './constants.js';

export class BoardManager {
    constructor(scene) {
        this.scene = scene;
        this.board = null;
        this.boardPlane = null;
    }

    createBoard() {
        // Create board group
        this.board = new THREE.Group();

        // Base board
        const boardGeometry = new THREE.BoxGeometry(
            BOARD_WIDTH,
            BOARD_DEPTH,
            BOARD_HEIGHT
        );
        const boardMaterial = new THREE.MeshPhongMaterial({
            color: COLORS.BOARD,
            specular: 0x111111,
            shininess: 30,
        });
        const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
        boardMesh.receiveShadow = true;
        this.board.add(boardMesh);

        // Invisible plane for collisions
        this.boardPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_HEIGHT),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.boardPlane.rotation.x = -Math.PI / 2;
        this.boardPlane.position.y = BOARD_DEPTH / 2 + 0.01;
        this.boardPlane.name = "boardPlane";
        this.board.add(this.boardPlane);

        // Add borders
        this.addBoardBorders();

        // Add grid bumps
        this.addGridBumps();

        // Add board to scene
        this.board.position.set(0, 0, 0);
        this.scene.add(this.board);

        return this.board;
    }

    addBoardBorders() {
        // Board borders
        const borderMaterial = new THREE.MeshPhongMaterial({
            color: COLORS.BOARD_BORDER,
            specular: 0x333333,
            shininess: 30,
        });

        const borders = [
            { pos: [0, 0.25, BOARD_HEIGHT / 2], scale: [BOARD_WIDTH, 0.5, 0.2] },
            { pos: [0, 0.25, -BOARD_HEIGHT / 2], scale: [BOARD_WIDTH, 0.5, 0.2] },
            { pos: [BOARD_WIDTH / 2, 0.25, 0], scale: [0.2, 0.5, BOARD_HEIGHT] },
            { pos: [-BOARD_WIDTH / 2, 0.25, 0], scale: [0.2, 0.5, BOARD_HEIGHT] },
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
    }

    addGridBumps() {
        // Create bumps for digit placement
        const bumpGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
        const bumpMaterial = new THREE.MeshPhongMaterial({
            color: COLORS.BUMP,
            specular: 0x555555,
            shininess: 30,
        });

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = col * GRID_SIZE + GRID_OFFSET_X;
                const z = row * GRID_SIZE + GRID_OFFSET_Z;

                const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
                bump.position.set(x, BOARD_DEPTH / 2 + 0.1, z);
                bump.receiveShadow = true;
                bump.castShadow = true;
                bump.name = `bump_${col}_${row}`;
                this.board.add(bump);
            }
        }
    }
}