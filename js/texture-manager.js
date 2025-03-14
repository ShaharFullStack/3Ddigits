import * as THREE from 'three';
import { COLORS } from './constants.js';

export class TextureManager {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textures = {};
    this.materials = {};
    
    // יצירת טקסטורות
    this.initTextures();
  }
  
  initTextures() {
    // יצירת טקסטורה פרוצדורלית ללוח המשחק
    this.createBoardTexture();
    
    // יצירת טקסטורה פרוצדורלית לספרות
    this.createDigitTextures();
    
    // יצירת טקסטורה לרצפה
    this.createFloorTexture();
  }
  
  createBoardTexture() {
    // יצירת טקסטורה פרוצדורלית ללוח המשחק עם מראה מודרני ואלגנטי
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // הגדלת רזולוציה לפרטים עשירים יותר
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע בסיסי - גוון מודרני יותר
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#ebf1fa');
    bgGradient.addColorStop(0.5, '#f3f7fc');
    bgGradient.addColorStop(1, '#e8eff8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת שכבת טקסטורה מיקרו
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 0.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#cce0ff' : '#ffffff';
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1.0;
    
    // הוספת דפוס קריסטלי עדין
    const tileSize = 150;
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        // יצירת דפוס דמוי יהלום מודרני
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          // שימוש בגרדיאנט במקום צבע אחיד
          const patternGradient = ctx.createRadialGradient(
            x + tileSize/2, y + tileSize/2, 0,
            x + tileSize/2, y + tileSize/2, tileSize
          );
          patternGradient.addColorStop(0, 'rgba(230, 240, 255, 0.4)');
          patternGradient.addColorStop(0.7, 'rgba(230, 240, 255, 0.2)');
          patternGradient.addColorStop(1, 'rgba(230, 240, 255, 0)');
          
          ctx.fillStyle = patternGradient;
          
          // צייר יהלום במקום ריבוע
          ctx.beginPath();
          ctx.moveTo(x + tileSize/2, y);
          ctx.lineTo(x + tileSize, y + tileSize/2);
          ctx.lineTo(x + tileSize/2, y + tileSize);
          ctx.lineTo(x, y + tileSize/2);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    
    // הוספת קווי רשת עדינים לתחושת עומק
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#a0c0ff';
    ctx.lineWidth = 1;
    
    // קווים אופקיים
    for (let y = 0; y < canvas.height; y += tileSize / 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // קווים אנכיים
    for (let x = 0; x < canvas.width; x += tileSize / 3) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    
    // הוספת זוהר הולוגרפי במרכז
    const holographicGradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.7
    );
    holographicGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    holographicGradient.addColorStop(0.5, 'rgba(180, 220, 255, 0.05)');
    holographicGradient.addColorStop(0.8, 'rgba(140, 200, 255, 0.03)');
    holographicGradient.addColorStop(1, 'rgba(120, 180, 240, 0)');
    
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = holographicGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // הוספת אפקט תאורה מהפינות
    for (let corner = 0; corner < 4; corner++) {
      const cornerX = corner % 2 === 0 ? 0 : canvas.width;
      const cornerY = corner < 2 ? 0 : canvas.height;
      
      const cornerGlow = ctx.createRadialGradient(
        cornerX, cornerY, 0,
        cornerX, cornerY, canvas.width * 0.3
      );
      cornerGlow.addColorStop(0, 'rgba(210, 230, 255, 0.1)');
      cornerGlow.addColorStop(0.5, 'rgba(200, 225, 255, 0.05)');
      cornerGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
      
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = cornerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = 'source-over';
    
    // הוספת אפקט קצוות זוהרים
    const borderWidth = canvas.width * 0.05;
    const borderGradient = ctx.createLinearGradient(0, 0, borderWidth, 0);
    borderGradient.addColorStop(0, 'rgba(180, 215, 255, 0.15)');
    borderGradient.addColorStop(1, 'rgba(180, 215, 255, 0)');
    
    // ארבעת הצדדים
    ctx.fillStyle = borderGradient;
    ctx.fillRect(0, 0, borderWidth, canvas.height); // שמאל
    
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI/2);
    ctx.fillRect(0, 0, borderWidth, canvas.width); // למעלה
    
    ctx.translate(canvas.height, 0);
    ctx.rotate(Math.PI/2);
    ctx.fillRect(0, 0, borderWidth, canvas.width); // ימין
    
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI/2);
    ctx.fillRect(0, 0, borderWidth, canvas.height); // למטה
    
    // איפוס הטרנספורמציה
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // יצירת הטקסטורה מהקנבס
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    this.textures.board = texture;
    this.textures.boardNormal = this.createNormalMap(canvas, 2.5); // הגדלנו את עוצמת הנורמל מאפ
    
    // יצירת החומר ללוח - חומר פיזי יותר עם משחקי אור משופרים
    this.materials.board = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.5, // פחות גס למראה יותר מבריק
      metalness: 0.2, // יותר מתכתי
      color: 0xffffff,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5 // יותר החזרי אור
    });
    
    // חומר לגבולות - יותר מתכתי
    this.materials.boardBorder = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.3,
      metalness: 0.7,
      color: COLORS.BOARD_BORDER,
      side: THREE.DoubleSide,
      envMapIntensity: 2.0
    });
    
    // חומר לבליטות - חלק יותר
    this.materials.bump = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.2,
      metalness: 0.3,
      color: COLORS.BUMP,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5
    });
  }
  
  createDigitTextures() {
    // יצירת טקסטורות לספרות עם מראה מודרני, דיגיטלי וזוהר
    
    // טקסטורה לספרות רגילות (כחול עשיר)
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // הגדלת רזולוציה
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע כחול עם גרדיאנט
    const digitGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    digitGradient.addColorStop(0, '#3b78e7');
    digitGradient.addColorStop(0.5, '#4285f4');
    digitGradient.addColorStop(1, '#3b78e7');
    ctx.fillStyle = digitGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // דפוס קווים דיגיטליים
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#76a8ff';
    
    // קווי מעגל דיגיטליים (מדמה מעגל אלקטרוני)
    const circuitLines = 15;
    const radiusStep = Math.min(canvas.width, canvas.height) / (2 * circuitLines);
    ctx.strokeStyle = '#76a8ff';
    ctx.lineWidth = 2;
    
    for (let i = 1; i <= circuitLines; i++) {
      const radius = i * radiusStep;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // הוספת "מחברים" במיקומים אקראיים
      const connectors = Math.floor(i * 1.5);
      for (let j = 0; j < connectors; j++) {
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = radius - radiusStep * 0.8;
        const outerRadius = radius;
        
        const x1 = canvas.width / 2 + innerRadius * Math.cos(angle);
        const y1 = canvas.height / 2 + innerRadius * Math.sin(angle);
        const x2 = canvas.width / 2 + outerRadius * Math.cos(angle);
        const y2 = canvas.height / 2 + outerRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    
    // קווים אופקיים ואנכיים בפריסה פרקטלית
    ctx.lineWidth = 1;
    this.drawFractalLines(ctx, 0, 0, canvas.width, canvas.height, 4);
    
    // הוספת שכבת נצנוץ - כמו נקודות חשמליות זוהרות
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      
      const glowRadius = size * 3;
      const glow = ctx.createRadialGradient(
        x, y, 0,
        x, y, glowRadius
      );
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // נקודה פנימית לבנה
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // הוספת פולסים זוהרים דיגיטליים
    this.addDigitalPulses(ctx, canvas.width, canvas.height, '#76a8ff');
    
    // הוספת אפקט של קצוות עם הארה
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 10;
    
    // יצירת קווי זוהר כמו שוליים דיגיטליים
    const borderGlow = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    borderGlow.addColorStop(0, '#ffffff');
    borderGlow.addColorStop(0.5, '#c0d6ff');
    borderGlow.addColorStop(1, '#ffffff');
    
    ctx.strokeStyle = borderGlow;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    
    // יצירת טקסטורה מהקנבס
    const digitTexture = new THREE.CanvasTexture(canvas);
    this.textures.digit = digitTexture;
    this.textures.digitNormal = this.createNormalMap(canvas, 3.0); // הגדלנו את עוצמת הנורמל מאפ
    
    // חומר לספרות רגילות - עם זוהר ומתכתיות משופרת
    this.materials.digit = new THREE.MeshStandardMaterial({
      map: this.textures.digit,
      normalMap: this.textures.digitNormal,
      roughness: 0.2,  // יותר חלק למראה יוקרתי
      metalness: 0.8,  // יותר מתכתי
      color: COLORS.DIGIT,
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: 0.3,  // יותר זוהר
      envMapIntensity: 2.0
    });
    
    // טקסטורה לספרות נבחרות - כחול כהה וזוהר
    const selectedCanvas = document.createElement('canvas');
    selectedCanvas.width = 1024;
    selectedCanvas.height = 1024;
    const selectedCtx = selectedCanvas.getContext('2d');
    
    // צבע רקע כחול כהה עם גרדיאנט
    const selectedGradient = selectedCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
    selectedGradient.addColorStop(0, '#0a3a99');
    selectedGradient.addColorStop(0.5, '#0d47a1');
    selectedGradient.addColorStop(1, '#0a3a99');
    selectedCtx.fillStyle = selectedGradient;
    selectedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // דפוס קווים דיגיטליים כחולים כהים
    selectedCtx.globalAlpha = 0.3;
    selectedCtx.strokeStyle = '#1565c0';
    selectedCtx.lineWidth = 3;
    
    // מוטיב דיגיטל-סייבר עם קווים זורמים
    for (let i = 0; i < 20; i++) {
      const y = i * (canvas.height / 20);
      
      selectedCtx.beginPath();
      selectedCtx.moveTo(0, y);
      
      // יצירת קו זרימה דינמי
      let x = 0;
      while (x < canvas.width) {
        const segmentLength = Math.random() * 60 + 20;
        const direction = Math.random() > 0.7 ? -1 : 1;
        const height = Math.random() * 30 * direction;
        
        const midX = x + segmentLength / 2;
        const endX = x + segmentLength;
        const controlY = y + height;
        
        selectedCtx.quadraticCurveTo(midX, controlY, endX, y);
        x = endX;
      }
      
      selectedCtx.stroke();
    }
    
    // הוספת זוהר פעימה חזק יותר (אלקטרוני)
    selectedCtx.globalCompositeOperation = 'lighter';
    const pulseGradient = selectedCtx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.7
    );
    pulseGradient.addColorStop(0, 'rgba(150, 200, 255, 0.5)');
    pulseGradient.addColorStop(0.7, 'rgba(100, 170, 255, 0.2)');
    pulseGradient.addColorStop(1, 'rgba(100, 170, 255, 0)');
    
    selectedCtx.fillStyle = pulseGradient;
    selectedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת פולסים זוהרים (כמו חוטי חשמל)
    this.addDigitalPulses(selectedCtx, canvas.width, canvas.height, '#4d8df0', 30, 0.5);
    
    // אפקט פינות מעוגלות זוהרות
    selectedCtx.lineWidth = 15;
    selectedCtx.strokeStyle = '#ffffff';
    const radius = 30;
    
    // צייר מרובע עם פינות מעוגלות
    selectedCtx.beginPath();
    selectedCtx.moveTo(radius, 5);
    selectedCtx.lineTo(canvas.width - radius, 5);
    selectedCtx.quadraticCurveTo(canvas.width - 5, 5, canvas.width - 5, radius);
    selectedCtx.lineTo(canvas.width - 5, canvas.height - radius);
    selectedCtx.quadraticCurveTo(canvas.width - 5, canvas.height - 5, canvas.width - radius, canvas.height - 5);
    selectedCtx.lineTo(radius, canvas.height - 5);
    selectedCtx.quadraticCurveTo(5, canvas.height - 5, 5, canvas.height - radius);
    selectedCtx.lineTo(5, radius);
    selectedCtx.quadraticCurveTo(5, 5, radius, 5);
    selectedCtx.stroke();
    
    // נקודות אור זוהרות
    selectedCtx.globalAlpha = 1.0;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 4 + 2;
      
      // נקודה בהירה במרכז
      selectedCtx.beginPath();
      selectedCtx.arc(x, y, radius, 0, Math.PI * 2);
      selectedCtx.fillStyle = '#ffffff';
      selectedCtx.fill();
      
      // זוהר מסביב לנקודה
      const glowRadius = radius * 5;
      const glow = selectedCtx.createRadialGradient(
        x, y, radius,
        x, y, glowRadius
      );
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      selectedCtx.beginPath();
      selectedCtx.arc(x, y, glowRadius, 0, Math.PI * 2);
      selectedCtx.fillStyle = glow;
      selectedCtx.fill();
    }
    
    selectedCtx.globalCompositeOperation = 'source-over';
    selectedCtx.globalAlpha = 1.0;
    
    const selectedTexture = new THREE.CanvasTexture(selectedCanvas);
    this.textures.digitSelected = selectedTexture;
    
    // חומר לספרות נבחרות - עם זוהר חזק ואפקטים מיוחדים
    this.materials.digitSelected = new THREE.MeshStandardMaterial({
      map: this.textures.digitSelected,
      normalMap: this.textures.digitNormal,
      roughness: 0.1,  // חלק יותר למראה מבריק
      metalness: 0.9,  // כמעט לגמרי מתכתי
      color: COLORS.SELECTED_DIGIT,
      emissive: new THREE.Color(0x3366cc),
      emissiveIntensity: 0.7,  // זוהר חזק יותר
      envMapIntensity: 2.5
    });
    
    // טקסטורה לספרות מוצבות - ירוק זוהר
    const placedCanvas = document.createElement('canvas');
    placedCanvas.width = 1024;
    placedCanvas.height = 1024;
    const placedCtx = placedCanvas.getContext('2d');
    
    // צבע רקע ירוק עם גרדיאנט
    const placedGradient = placedCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
    placedGradient.addColorStop(0, '#2d9549');
    placedGradient.addColorStop(0.5, '#34a853');
    placedGradient.addColorStop(1, '#2d9549');
    placedCtx.fillStyle = placedGradient;
    placedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // דפוס קווים וביטים דיגיטלים בגוון ירוק
    placedCtx.globalAlpha = 0.3;
    placedCtx.fillStyle = '#40b764';
    
    // דפוס ביטים דיגיטליים
    const bitSize = 15;
    for (let x = 0; x < canvas.width; x += bitSize * 2) {
      for (let y = 0; y < canvas.height; y += bitSize * 2) {
        if (Math.random() > 0.4) {
          placedCtx.fillRect(x, y, bitSize, bitSize);
        }
      }
    }
    
    // קווי זרימה דיגיטליים
    placedCtx.strokeStyle = '#40b764';
    placedCtx.lineWidth = 2;
    
    for (let i = 0; i < 15; i++) {
      placedCtx.beginPath();
      placedCtx.moveTo(0, i * (canvas.height / 15));
      
      for (let x = 0; x < canvas.width; x += canvas.width / 20) {
        const yOffset = Math.random() * 30 - 15;
        placedCtx.lineTo(x, i * (canvas.height / 15) + yOffset);
      }
      
      placedCtx.stroke();
    }
    
    // הוספת זוהר ירוק זרחני
    placedCtx.globalCompositeOperation = 'lighter';
    const greenGlow = placedCtx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.7
    );
    greenGlow.addColorStop(0, 'rgba(120, 255, 150, 0.4)');
    greenGlow.addColorStop(0.6, 'rgba(100, 255, 150, 0.2)');
    greenGlow.addColorStop(1, 'rgba(100, 255, 150, 0)');
    
    placedCtx.fillStyle = greenGlow;
    placedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת פולסים ירוקים זוהרים
    this.addDigitalPulses(placedCtx, canvas.width, canvas.height, '#70dd85', 20, 0.4);
    
    // קווי זוהר בקצוות עם אפקט אנרגיה
    placedCtx.lineWidth = 12;
    placedCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    
    // מלבן עם פינות מעוגלות
    const cornerRadius = 40;
    placedCtx.beginPath();
    placedCtx.moveTo(cornerRadius, 8);
    placedCtx.lineTo(canvas.width - cornerRadius, 8);
    placedCtx.quadraticCurveTo(canvas.width - 8, 8, canvas.width - 8, cornerRadius);
    placedCtx.lineTo(canvas.width - 8, canvas.height - cornerRadius);
    placedCtx.quadraticCurveTo(canvas.width - 8, canvas.height - 8, canvas.width - cornerRadius, canvas.height - 8);
    placedCtx.lineTo(cornerRadius, canvas.height - 8);
    placedCtx.quadraticCurveTo(8, canvas.height - 8, 8, canvas.height - cornerRadius);
    placedCtx.lineTo(8, cornerRadius);
    placedCtx.quadraticCurveTo(8, 8, cornerRadius, 8);
    placedCtx.stroke();
    
    // הוספת סימן "וי" מעוצב יותר בפינה
    placedCtx.fillStyle = '#ffffff';
    placedCtx.globalAlpha = 0.9;
    const checkmarkSize = 90;
    const margin = 60;
    
    // סימון "וי" משופר עם זוהר
    placedCtx.lineWidth = 18;
    placedCtx.lineCap = 'round';
    placedCtx.lineJoin = 'round';
    
    // שכבת זוהר
    placedCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    placedCtx.shadowBlur = 20;
    placedCtx.beginPath();
    placedCtx.moveTo(canvas.width - margin - checkmarkSize, margin + checkmarkSize/2);
    placedCtx.lineTo(canvas.width - margin - checkmarkSize/2, margin + checkmarkSize);
    placedCtx.lineTo(canvas.width - margin, margin);
    placedCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    placedCtx.stroke();
    
    // איפוס צל
    placedCtx.shadowBlur = 0;
    
    // קו פנימי חד יותר
    placedCtx.lineWidth = 9;
    placedCtx.beginPath();
    placedCtx.moveTo(canvas.width - margin - checkmarkSize, margin + checkmarkSize/2);
    placedCtx.lineTo(canvas.width - margin - checkmarkSize/2, margin + checkmarkSize);
    placedCtx.lineTo(canvas.width - margin, margin);
    placedCtx.strokeStyle = '#ffffff';
    placedCtx.stroke();
    
    placedCtx.globalCompositeOperation = 'source-over';
    placedCtx.globalAlpha = 1.0;
    
    const placedTexture = new THREE.CanvasTexture(placedCanvas);
    this.textures.digitPlaced = placedTexture;
    
    // חומר לספרות מוצבות - עם זוהר ירוק ואפקטים של הצלחה
    this.materials.digitPlaced = new THREE.MeshStandardMaterial({
      map: this.textures.digitPlaced,
      normalMap: this.textures.digitNormal,
      roughness: 0.3,  // מעט יותר גס לתחושת "הישג"
      metalness: 0.7,  // מתכתי אך לא כמו הנבחר
      color: COLORS.PLACED_DIGIT,
      emissive: new THREE.Color(0x118833),
      emissiveIntensity: 0.5,  // זוהר בינוני
      envMapIntensity: 1.8
    });
  }
  
  // פונקציית עזר ליצירת קווים פרקטליים
  drawFractalLines(ctx, x, y, width, height, depth) {
    if (depth <= 0) return;
    
    // צייר קווים אופקיים ואנכיים
    ctx.beginPath();
    
    // קו אופקי באמצע
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    
    // קו אנכי באמצע
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y + height);
    
    ctx.stroke();
    
    // רקורסיה לרבעים
    const newWidth = width / 2;
    const newHeight = height / 2;
    const newDepth = depth - 1;
    
    this.drawFractalLines(ctx, x, y, newWidth, newHeight, newDepth);
    this.drawFractalLines(ctx, x + newWidth, y, newWidth, newHeight, newDepth);
    this.drawFractalLines(ctx, x, y + newHeight, newWidth, newHeight, newDepth);
    this.drawFractalLines(ctx, x + newWidth, y + newHeight, newWidth, newHeight, newDepth);
  }
  
  // פונקציית עזר להוספת פולסים דיגיטליים
  addDigitalPulses(ctx, width, height, color, count = 20, alpha = 0.3) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // צייר פולסים אקראיים כמו חוטי חשמל זוהרים
    for (let i = 0; i < count; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const length = Math.random() * 200 + 100;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let currentX = startX;
      let currentY = startY;
      let remainingLength = length;
      
      while (remainingLength > 0) {
        const segmentLength = Math.min(remainingLength, Math.random() * 40 + 20);
        const directionChange = Math.random() * 0.3 - 0.15;
        const newAngle = angle + directionChange;
        
        currentX += Math.cos(newAngle) * segmentLength;
        currentY += Math.sin(newAngle) * segmentLength;
        
        ctx.lineTo(currentX, currentY);
        remainingLength -= segmentLength;
      }
      
      // הוספת זוהר לפולס
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  createFloorTexture() {
    // יצירת טקסטורה פרוצדורלית לרצפה - מודרנית ורפלקטיבית
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // הגדלת רזולוציה לפרטים עשירים יותר
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע בסיסי - גרדיאנט עדין
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#e0ebff');
    bgGradient.addColorStop(0.5, '#e6f0ff');
    bgGradient.addColorStop(1, '#dde8fa');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // יצירת מרקם מעניין של אריחים מודרניים עם אפקט השתקפות
    const tileSize = 256;
    const tileBorder = 3;
    
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        // יצירת מגוון גוונים עדינים
        let baseColor;
        const randVal = Math.random();
        if (randVal > 0.7) {
          baseColor = '#e2eafd';
        } else if (randVal > 0.4) {
          baseColor = '#edf3ff';
        } else {
          baseColor = '#e9f0ff';
        }
        
        // יצירת גרדיאנט עדין לכל אריח
        const tileGradient = ctx.createLinearGradient(
          x, y, x + tileSize, y + tileSize
        );
        tileGradient.addColorStop(0, baseColor);
        tileGradient.addColorStop(1, this.shiftColor(baseColor, 10));
        
        ctx.fillStyle = tileGradient;
        
        // ציור אריח עם פינות מעוגלות
        const cornerRadius = 5;
        ctx.beginPath();
        ctx.moveTo(x + tileBorder + cornerRadius, y + tileBorder);
        ctx.lineTo(x + tileSize - tileBorder - cornerRadius, y + tileBorder);
        ctx.quadraticCurveTo(x + tileSize - tileBorder, y + tileBorder, x + tileSize - tileBorder, y + tileBorder + cornerRadius);
        ctx.lineTo(x + tileSize - tileBorder, y + tileSize - tileBorder - cornerRadius);
        ctx.quadraticCurveTo(x + tileSize - tileBorder, y + tileSize - tileBorder, x + tileSize - tileBorder - cornerRadius, y + tileSize - tileBorder);
        ctx.lineTo(x + tileBorder + cornerRadius, y + tileSize - tileBorder);
        ctx.quadraticCurveTo(x + tileBorder, y + tileSize - tileBorder, x + tileBorder, y + tileSize - tileBorder - cornerRadius);
        ctx.lineTo(x + tileBorder, y + tileBorder + cornerRadius);
        ctx.quadraticCurveTo(x + tileBorder, y + tileBorder, x + tileBorder + cornerRadius, y + tileBorder);
        ctx.closePath();
        ctx.fill();
        
        // הוספת מרקם פנימי לכל אריח
        ctx.globalAlpha = 0.1;
        
        // משטחי השתקפות עדינים
        if (Math.random() > 0.5) {
          const reflGradient = ctx.createLinearGradient(
            x + tileBorder, y + tileBorder, 
            x + tileSize - tileBorder, y + tileSize - tileBorder
          );
          reflGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
          reflGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
          reflGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
          
          ctx.fillStyle = reflGradient;
          ctx.fillRect(
            x + tileBorder + 10, 
            y + tileBorder + 10, 
            tileSize - tileBorder * 2 - 20, 
            tileSize - tileBorder * 2 - 20
          );
        }
        
        // קווי השתקפות אלכסוניים
        if (Math.random() > 0.5) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = Math.random() * 5 + 2;
          
          ctx.beginPath();
          if (Math.random() > 0.5) {
            // אלכסון ראשי
            ctx.moveTo(x + tileBorder + 15, y + tileBorder + 15);
            ctx.lineTo(x + tileSize - tileBorder - 15, y + tileSize - tileBorder - 15);
          } else {
            // אלכסון משני
            ctx.moveTo(x + tileSize - tileBorder - 15, y + tileBorder + 15);
            ctx.lineTo(x + tileBorder + 15, y + tileSize - tileBorder - 15);
          }
          ctx.stroke();
        }
        
        // נקודות מרקם אקראיות
        for (let i = 0; i < 150; i++) {
          const dotX = x + tileBorder + Math.random() * (tileSize - tileBorder * 2);
          const dotY = y + tileBorder + Math.random() * (tileSize - tileBorder * 2);
          const radius = Math.random() * 3 + 1;
          
          // גוון כחול אקראי עדין
          const blue = 210 + Math.random() * 40;
          ctx.fillStyle = `rgba(230, 240, ${blue}, 0.3)`;
          ctx.beginPath();
          ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
      }
    }
    
    // הוספת קווי רשת עדינים בין האריחים
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#a0c0ff';
    ctx.lineWidth = 1;
    
    // קווים אופקיים
    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // קווים אנכיים
    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
    
    // הוספת אפקט אור כללי במרכז - יותר עדין ומעניין
    const lightGradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width/1.6
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    lightGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
    lightGradient.addColorStop(1, 'rgba(240, 240, 255, 0)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // נקודות זוהר פזורות
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 50;
      
      const glow = ctx.createRadialGradient(
        x, y, 0,
        x, y, radius
      );
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    
    // יצירת הטקסטורה מהקנבס
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    
    this.textures.floor = texture;
    this.textures.floorNormal = this.createNormalMap(canvas, 1.5); // מפת נורמל חזקה יותר
    
    // חומר לרצפה - מראה יוקרתי יותר
    this.materials.floor = new THREE.MeshStandardMaterial({
      map: this.textures.floor,
      normalMap: this.textures.floorNormal,
      roughness: 0.4, // יותר חלק למראה של רצפה מבריקה
      metalness: 0.3, // יותר מתכתי
      color: 0xffffff,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5
    });
  }
  
  // פונקציית עזר להזזת צבע - מקבלת צבע HEX ומזיזה אותו
  shiftColor(hex, amount) {
    // המרת צבע הקס לערכי RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // הזזת ערכים
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));
    
    // המרה חזרה לפורמט הקס
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  createNormalMap(sourceCanvas, intensity = 1.0) {
    // יצירת normal map מקנבס נתון - גרסה משופרת
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d');
    
    // העתקת תוכן הקנבס המקורי
    ctx.drawImage(sourceCanvas, 0, 0);
    
    // קבלת נתוני הפיקסלים
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // יצירת normal map חדש
    const normalMapData = ctx.createImageData(canvas.width, canvas.height);
    const normalPixels = normalMapData.data;
    
    // חישוב מפת נורמל משופרת - סוברל אופרטור
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const i = (y * canvas.width + x) * 4;
        
        // קריאת בהירות באזור 3x3 סביב הפיקסל
        const tl = (pixels[((y - 1) * canvas.width + (x - 1)) * 4] + 
                   pixels[((y - 1) * canvas.width + (x - 1)) * 4 + 1] + 
                   pixels[((y - 1) * canvas.width + (x - 1)) * 4 + 2]) / 3;
        
        const t = (pixels[((y - 1) * canvas.width + x) * 4] + 
                  pixels[((y - 1) * canvas.width + x) * 4 + 1] + 
                  pixels[((y - 1) * canvas.width + x) * 4 + 2]) / 3;
        
        const tr = (pixels[((y - 1) * canvas.width + (x + 1)) * 4] + 
                   pixels[((y - 1) * canvas.width + (x + 1)) * 4 + 1] + 
                   pixels[((y - 1) * canvas.width + (x + 1)) * 4 + 2]) / 3;
        
        const l = (pixels[(y * canvas.width + (x - 1)) * 4] + 
                  pixels[(y * canvas.width + (x - 1)) * 4 + 1] + 
                  pixels[(y * canvas.width + (x - 1)) * 4 + 2]) / 3;
        
        const r = (pixels[(y * canvas.width + (x + 1)) * 4] + 
                  pixels[(y * canvas.width + (x + 1)) * 4 + 1] + 
                  pixels[(y * canvas.width + (x + 1)) * 4 + 2]) / 3;
        
        const bl = (pixels[((y + 1) * canvas.width + (x - 1)) * 4] + 
                   pixels[((y + 1) * canvas.width + (x - 1)) * 4 + 1] + 
                   pixels[((y + 1) * canvas.width + (x - 1)) * 4 + 2]) / 3;
        
        const b = (pixels[((y + 1) * canvas.width + x) * 4] + 
                  pixels[((y + 1) * canvas.width + x) * 4 + 1] + 
                  pixels[((y + 1) * canvas.width + x) * 4 + 2]) / 3;
        
        const br = (pixels[((y + 1) * canvas.width + (x + 1)) * 4] + 
                   pixels[((y + 1) * canvas.width + (x + 1)) * 4 + 1] + 
                   pixels[((y + 1) * canvas.width + (x + 1)) * 4 + 2]) / 3;
        
        // חישוב וקטור נורמל באמצעות אופרטור סוברל
        const dx = ((tr + 2.0 * r + br) - (tl + 2.0 * l + bl)) * intensity;
        const dy = ((bl + 2.0 * b + br) - (tl + 2.0 * t + tr)) * intensity;
        const dz = 255 / intensity;
        
        // נרמול הווקטור
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // המרה לצבע RGB בפורמט של normal map
        normalPixels[i] = 128 + (dx / length) * 127;
        normalPixels[i + 1] = 128 + (dy / length) * 127;
        normalPixels[i + 2] = 128 + (dz / length) * 127;
        normalPixels[i + 3] = 255; // אלפא
      }
    }
    
    // יישום סינון גאוסיאני עדין להחלקת הנורמל מאפ
    this.applyGaussianBlur(normalMapData, canvas.width, canvas.height);
    
    // צייר את הנורמל מפ על הקנבס
    ctx.putImageData(normalMapData, 0, 0);
    
    // יצירת הטקסטורה מהקנבס
    const normalTexture = new THREE.CanvasTexture(canvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    
    return normalTexture;
  }
  
  // פונקציית עזר להחלקת נורמל מאפ
  applyGaussianBlur(imageData, width, height) {
    const pixels = imageData.data;
    const tempPixels = new Uint8ClampedArray(pixels);
    
    const kernel = [
      0.0625, 0.125, 0.0625,
      0.125,  0.25,  0.125,
      0.0625, 0.125, 0.0625
    ];
    
    // עיבוד רק על ערוצי X ו-Y (אינדקסים 0 ו-1)
    for (let channel = 0; channel < 2; channel++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const center = (y * width + x) * 4 + channel;
          
          let sum = 0;
          let k = 0;
          
          // עיבוד קרנל 3x3
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixelPos = ((y + ky) * width + (x + kx)) * 4 + channel;
              sum += tempPixels[pixelPos] * kernel[k++];
            }
          }
          
          pixels[center] = sum;
        }
      }
    }
  }
  
  // פונקציות עזר לעדכון חומרים
  updateDigitMaterial(segment, state) {
    if (state === 'normal') {
      segment.material = this.materials.digit.clone();
    } else if (state === 'selected') {
      segment.material = this.materials.digitSelected.clone();
    } else if (state === 'placed') {
      segment.material = this.materials.digitPlaced.clone();
    }
  }
  
  getBoardMaterial() {
    return this.materials.board;
  }
  
  getBoardBorderMaterial() {
    return this.materials.boardBorder;
  }
  
  getBumpMaterial() {
    return this.materials.bump;
  }
  
  getFloorMaterial() {
    return this.materials.floor;
  }
}