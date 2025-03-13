import * as THREE from 'three';

export class OctagonalDigitGenerator {
  constructor() {
    // מגדיר את הפרמטרים לבניית ספרות אוקטגוניות
    this.thickness = 0.28;     // עובי המקטע
    this.width = 1.2;          // רוחב המקטע
    this.depth = 0.45;         // עומק
    this.cornerRadius = 0.2;  // רדיוס פינות מעוגלות
    this.segmentSpacing = 1.5; // מרווח בין המקטעים
  }

  // יוצר צורת אוקטגון עם פינות מעוגלות
  createOctagonShape() {
    const shape = new THREE.Shape();
    
    // פרמטרים עבור האוקטגון
    const width = this.width;
    const height = this.thickness;
    const radius = this.cornerRadius;
    
    // חישוב נקודות קיצוניות
    const topRight = new THREE.Vector2(width/2, height/2);
    const topLeft = new THREE.Vector2(-width/2, height/2);
    const bottomRight = new THREE.Vector2(width/2, -height/2);
    const bottomLeft = new THREE.Vector2(-width/2, -height/2);
    
    // צייר אוקטגון עם פינות מעוגלות - מעגל את 4 הפינות הראשיות
    shape.moveTo(topLeft.x + radius, topLeft.y);
    
    // צד עליון
    shape.lineTo(topRight.x - radius, topRight.y);
    shape.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y - radius);
    
    // צד ימין
    shape.lineTo(bottomRight.x, bottomRight.y + radius);
    shape.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - radius, bottomRight.y);
    
    // צד תחתון
    shape.lineTo(bottomLeft.x + radius, bottomLeft.y);
    shape.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y + radius);
    
    // צד שמאל
    shape.lineTo(topLeft.x, topLeft.y - radius);
    shape.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + radius, topLeft.y);
    
    return shape;
  }

  // יוצר מקטע בודד של ספרה אוקטגונית
  createSegment(horizontal = true) {
    const shape = this.createOctagonShape();
    
    // הגדרות להוצאת מקטע לתלת-ממד
    const extrudeSettings = {
      steps: 1,
      depth: this.depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    };
    
    // יצירת גאומטריה של המקטע
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // סיבוב המקטע בהתאם לכיוון (אופקי או אנכי)
    if (!horizontal) {
      geometry.rotateZ(Math.PI * 2);
    }
    
    return geometry;
  }

  // יוצר מש של ספרה שלמה
  createDigitMesh(value, material) {
    // בדיקת תקינות הערך
    if (value < 0 || value > 9) {
      console.error('ערך ספרה לא תקין:', value);
      return null;
    }
    
    // יצירת קבוצה להכיל את כל מקטעי הספרה
    const digitGroup = new THREE.Group();
    digitGroup.name = `digit_${value}`;
    
    // הגדרת המקטעים לכל ספרה (סטנדרט 7-segments)
    const segments = {
      a: { // העליון
        pos: [0, this.segmentSpacing, 0],
        rot: [0, 0, 0],
        show: [0, 2, 3, 5, 6, 7, 8, 9]
      },
      b: { // ימין עליון
        pos: [this.segmentSpacing/2, this.segmentSpacing/2, 0],
        rot: [0, 0, Math.PI/2],
        show: [0, 1, 2, 3, 4, 7, 8, 9]
      },
      c: { // ימין תחתון
        pos: [this.segmentSpacing/2, -this.segmentSpacing/2, 0],
        rot: [0, 0, Math.PI/2],
        show: [0, 1, 3, 4, 5, 6, 7, 8, 9]
      },
      d: { // התחתון
        pos: [0, -this.segmentSpacing, 0],
        rot: [0, 0, 0],
        show: [0, 2, 3, 5, 6, 8, 9]
      },
      e: { // שמאל תחתון
        pos: [-this.segmentSpacing/2, -this.segmentSpacing/2, 0],
        rot: [0, 0, Math.PI/2],
        show: [0, 2, 6, 8]
      },
      f: { // שמאל עליון
        pos: [-this.segmentSpacing/2, this.segmentSpacing/2, 0],
        rot: [0, 0, Math.PI/2],
        show: [0, 4, 5, 6, 8, 9]
      },
      g: { // האמצעי
        pos: [0, 0, 0],
        rot: [0, 0, 0],
        show: [2, 3, 4, 5, 6, 8, 9]
      }
    };

    // הוספת המקטעים הנדרשים לספרה
    for (const [key, seg] of Object.entries(segments)) {
      if (seg.show.includes(value)) {
        // יצירת גאומטריה למקטע (אופקי או אנכי)
        const isHorizontal = (key === 'a' || key === 'd' || key === 'g');
        const geometry = this.createSegment(isHorizontal);
        
        // יצירת מש מהגאומטריה והחומר
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // הגדרת מיקום וסיבוב
        mesh.position.set(...seg.pos);
        mesh.rotation.set(...seg.rot);
        
        // נתונים להתייחסות בעתיד
        mesh.name = `segment_${key}`;
        mesh.userData.parentDigit = digitGroup;
        
        // הוספה לקבוצה
        digitGroup.add(mesh);
      }
    }
    
    // סיבוב הספרה השלמה לשכב אופקית
    digitGroup.rotation.x = -Math.PI / 2;
    
    // הגדרת נתונים לשימוש בהמשך
    digitGroup.userData = {
      value: value,
      placed: false,
      rotation: 0,
      flipped: false,
      initialXRotation: -Math.PI / 2
    };
    
    return digitGroup;
  }

  // יוצר צבעים עבור הספרות
  createDigitMaterials() {
    // חומר רגיל לספרות (כחול)
    const normalMaterial = new THREE.MeshStandardMaterial({
      color: 0x4285f4,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: 0.2
    });
    
    // חומר לספרות נבחרות (כחול כהה)
    const selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d47a1,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(0x3366cc),
      emissiveIntensity: 0.5
    });
    
    // חומר לספרות מוצבות (ירוק)
    const placedMaterial = new THREE.MeshStandardMaterial({
      color: 0x34a853,
      metalness: 0.6,
      roughness: 0.4,
      emissive: new THREE.Color(0x118833),
      emissiveIntensity: 0.3
    });
    
    return {
      normal: normalMaterial,
      selected: selectedMaterial,
      placed: placedMaterial
    };
  }
  
  // יוצר את כל עשר הספרות
  createAllDigits() {
    const materials = this.createDigitMaterials();
    const digits = [];
    
    for (let i = 0; i < 10; i++) {
      const digit = this.createDigitMesh(i, materials.normal);
      digits.push(digit);
    }
    
    return {
      digits,
      materials
    };
  }
}

