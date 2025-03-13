import { COLORS, BOARD_DEPTH, BOARD_WIDTH, BOARD_HEIGHT } from './constants.js';
import * as THREE from 'three';

export class DigitManager {
  constructor(scene) {
    this.scene = scene;
    this.digits = [];
    this.selectedDigit = null;
    this.placedDigits = {};
  }

  createDigitMesh(value) {
    // Create digit group
    const digitGroup = new THREE.Group();
    digitGroup.name = `digit_${value}`;

    // Digit material
    const material = new THREE.MeshPhongMaterial({
      color: COLORS.DIGIT,
      specular: 0xffffff,
      shininess: 70,
    });

    // Segment dimensions
    const segWidth = 1.2;
    const segHeight = 0.2;
    const segDepth = 0.4;
    const segSpacing = 1.5;

    // 7-segment positions and visibility for each digit
    const segments = {
      a: {
        pos: [0, segSpacing, 0],
        rot: [0, 0, 0],
        show: [0, 2, 3, 5, 6, 7, 8, 9],
      },
      b: {
        pos: [segSpacing / 2, segSpacing / 2, 0],
        rot: [0, 0, Math.PI / 2],
        show: [0, 1, 2, 3, 4, 7, 8, 9],
      },
      c: {
        pos: [segSpacing / 2, -segSpacing / 2, 0],
        rot: [0, 0, Math.PI / 2],
        show: [0, 1, 3, 4, 5, 6, 7, 8, 9],
      },
      d: {
        pos: [0, -segSpacing, 0],
        rot: [0, 0, 0],
        show: [0, 2, 3, 5, 6, 8, 9],
      },
      e: {
        pos: [-segSpacing / 2, -segSpacing / 2, 0],
        rot: [0, 0, Math.PI / 2],
        show: [0, 2, 6, 8],
      },
      f: {
        pos: [-segSpacing / 2, segSpacing / 2, 0],
        rot: [0, 0, Math.PI / 2],
        show: [0, 4, 5, 6, 8, 9],
      },
      g: { 
        pos: [0, 0, 0], 
        rot: [0, 0, 0], 
        show: [2, 3, 4, 5, 6, 8, 9] 
      },
    };

    // Create segments that should be visible for this digit
    for (const [key, seg] of Object.entries(segments)) {
      if (seg.show.includes(value)) {
        const geometry = new THREE.BoxGeometry(
          segWidth,
          segHeight,
          segDepth
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...seg.pos);
        mesh.rotation.set(...seg.rot);
        mesh.castShadow = true;
        mesh.name = `segment_${key}`;
        mesh.userData.parentDigit = digitGroup;
        digitGroup.add(mesh);
      }
    }

    // Rotate the whole digit to lie flat
    digitGroup.rotation.x = -Math.PI / 2;

    return digitGroup;
  }

  createDigits() {
    // Calculate positions for the digits around the board
    const boardOffset = 3; // Distance from board edge
    
    // Create all 10 digits
    for (let i = 0; i < 10; i++) {
      const digit = this.createDigitMesh(i);
      
      // Calculate position based on digit index
      let x, z;
      
      if (i < 5) {
        // Position digits 0-4 on the left side of the board
        x = -BOARD_WIDTH/2 - boardOffset;
        z = -BOARD_HEIGHT/2 + i * (BOARD_HEIGHT / 4);
      } else {
        // Position digits 5-9 on the right side of the board
        x = BOARD_WIDTH/2 + boardOffset;
        z = -BOARD_HEIGHT/2 + (i - 5) * (BOARD_HEIGHT / 4);
      }
      
      digit.userData = {
        value: i,
        placed: false,
        originalPosition: new THREE.Vector3(x, 1, z),
        rotation: 0,
        flipped: false,
        // Store the initial x-rotation to maintain the flat orientation
        initialXRotation: -Math.PI / 2
      };
      
      digit.position.copy(digit.userData.originalPosition);
      this.scene.add(digit);
      this.digits.push(digit);
    }
    
    return this.digits;
  }

  selectDigit(value) {
    // If digit already placed, can't select it
    if (this.digits[value].userData.placed) {
      return;
    }

    // Deselect previous digit if any
    if (this.selectedDigit) {
      this.selectedDigit.children.forEach((seg) => {
        seg.material.color.setHex(COLORS.DIGIT);
      });
    }

    // Select new digit
    this.selectedDigit = this.digits[value];

    // Change selected digit color
    this.selectedDigit.children.forEach((seg) => {
      seg.material.color.setHex(COLORS.SELECTED_DIGIT);
    });
    
    return this.selectedDigit;
  }

  placeDigit(digit, position) {
    // Ensure digit is not already placed
    if (digit.userData.placed) {
      return;
    }

    // Get proper digit reference
    const parentDigit = digit.userData.parentDigit || digit;
    const digitValue = parentDigit.userData.value;

    // Position the digit on the board
    parentDigit.position.copy(position);
    parentDigit.position.y = BOARD_DEPTH / 2 + 0.1; // Position slightly above board

    // Mark digit as placed
    parentDigit.userData.placed = true;
    this.placedDigits[digitValue] = parentDigit;

    // Changed color to placed color
    parentDigit.children.forEach((seg) => {
      seg.material.color.setHex(COLORS.PLACED_DIGIT);
    });

    // Reset selection
    if (this.selectedDigit === parentDigit) {
      this.selectedDigit = null;
    }

    return true;
  }

  rotateSelectedDigit(direction) {
    if (!this.selectedDigit) return;

    // Rotate in 90-degree increments around the y-axis while maintaining the horizontal position
    this.selectedDigit.userData.rotation += (direction * Math.PI) / 2;
    
    // Apply the rotation while preserving the x-rotation that makes the digit lie flat
    this.selectedDigit.rotation.y = this.selectedDigit.userData.rotation;
    this.selectedDigit.rotation.x = this.selectedDigit.userData.initialXRotation;
  }

  flipSelectedDigit() {
    if (!this.selectedDigit) return;

    // Flip digit (rotate 180 degrees around the z-axis)
    this.selectedDigit.userData.flipped = !this.selectedDigit.userData.flipped;

    if (this.selectedDigit.userData.flipped) {
      this.selectedDigit.rotation.z = Math.PI;
    } else {
      this.selectedDigit.rotation.z = 0;
    }
    
    // Maintain the horizontal orientation
    this.selectedDigit.rotation.x = this.selectedDigit.userData.initialXRotation;
  }

  resetDigits() {
    // Reset all digits to original positions
    this.digits.forEach((digit) => {
      digit.position.copy(digit.userData.originalPosition);
      
      // Reset rotation while maintaining the horizontal orientation
      digit.rotation.set(digit.userData.initialXRotation, 0, 0);
      digit.userData.placed = false;
      digit.userData.rotation = 0;
      digit.userData.flipped = false;

      // Reset color
      digit.children.forEach((seg) => {
        seg.material.color.setHex(COLORS.DIGIT);
      });
    });

    // Reset game state
    this.selectedDigit = null;
    this.placedDigits = {};
  }
}