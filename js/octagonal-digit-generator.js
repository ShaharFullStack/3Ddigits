import * as THREE from 'three';

export class OctagonalDigitGenerator {
  constructor() {
    this.materials = {
      normal: new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.2
      }),
      selected: new THREE.MeshStandardMaterial({
        color: 0x4285f4,
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0x1b3a6b,
        emissiveIntensity: 0.3
      }),
      placed: new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.1
      })
    };
    
    // Color mapping for the digits
    this.colorMap = {
      0: 0xf4c542, // Yellow
      1: 0xd13b3b, // Red
      2: 0x4caf50, // Green
      3: 0x3f51b5, // Blue
      4: 0xaaaaaa, // Grey
      5: 0xf4c542, // Yellow
      6: 0xd13b3b, // Red
      7: 0x4caf50, // Green
      8: 0x3f51b5, // Blue
      9: 0xaaaaaa  // Grey
    };
  }
  
  createAllDigits() {
    const digits = [];
    
    for (let i = 0; i < 10; i++) {
      const digit = this.createDigit(i);
      digits.push(digit);
    }
    
    return { digits, materials: this.materials };
  }
  
  createDigit(value) {
    // Create a group to hold the octagonal digit and its segments
    const digitGroup = new THREE.Group();
    digitGroup.userData.value = value;
    digitGroup.userData.initialXRotation = Math.PI / 2; // Default orientation is flat/horizontal
    digitGroup.userData.rotation = 0;
    digitGroup.userData.flipped = false;
    digitGroup.userData.placed = false;
    
    // Create the base octagonal shape
    const octagonalBase = this.createOctagonalBase(value);
    digitGroup.add(octagonalBase);
    
    // Add the segments for this digit value
    this.addDigitSegments(digitGroup, value);
    
    // Set the initial rotation for the digit (horizontal)
    digitGroup.rotateX(digitGroup.userData.initialXRotation);
    
    return digitGroup;
  }
  
  createOctagonalBase(value) {
    // Use the color specified in the colorMap
    const color = this.colorMap[value];
    
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
    
    // Create inner cutout for the octagon (hollow center)
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
    const octagon = new THREE.Mesh(geometry, material);
    octagon.castShadow = true;
    octagon.receiveShadow = true;
    
    return octagon;
  }
  
  addDigitSegments(digitGroup, value) {
    // Add the appropriate segments based on the digit value
    const segments = this.getSegmentsForDigit(value);
    const segmentWidth = 0.4;
    const segmentHeight = 1.4;
    const segmentDepth = 0.15;
    
    // Use a slightly darker shade of the digit's color for the segments
    const baseColor = this.colorMap[value];
    const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.8);
    
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
        digitGroup.add(segmentMesh);
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
}
