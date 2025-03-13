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
    // יצירת טקסטורה פרוצדורלית ללוח המשחק עם מראה מודרני יותר
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע בסיסי - גוון קלאסי יותר
    ctx.fillStyle = '#f0f3f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת טקסטורה מעניינת
    const tileSize = 128;
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        // גווני כחול בהיר לסירוגין
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          ctx.fillStyle = 'rgba(230, 240, 250, 0.5)';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
    
    // הוספת דפוס עדין
    ctx.globalAlpha = 0.1;
    for (let x = 0; x < canvas.width; x += 32) {
      for (let y = 0; y < canvas.height; y += 32) {
        const shift = (x + y) % 64;
        if (shift === 0) {
          ctx.fillStyle = '#e8e8f8';
          ctx.fillRect(x, y, 32, 32);
        }
      }
    }
    
    // הוספת זוהר עדין בפינות
    const gradientRadius = canvas.width * 0.7;
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, gradientRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(220, 230, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת טקסטורה מעט גרנולרית
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#ddddff';
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // יצירת הטקסטורה מהקנבס
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    this.textures.board = texture;
    this.textures.boardNormal = this.createNormalMap(canvas, 2.0);
    
    // יצירת החומר ללוח - חומר פיזי יותר עם מעט ברק
    this.materials.board = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.7,
      metalness: 0.1,
      color: 0xffffff,
      side: THREE.DoubleSide,
      envMapIntensity: 1.0
    });
    
    // חומר לגבולות - יותר מתכתי
    this.materials.boardBorder = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.4,
      metalness: 0.6,
      color: COLORS.BOARD_BORDER,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5
    });
    
    // חומר לבליטות - חלק יותר
    this.materials.bump = new THREE.MeshStandardMaterial({
      map: this.textures.board,
      normalMap: this.textures.boardNormal,
      roughness: 0.3,
      metalness: 0.2,
      color: COLORS.BUMP,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2
    });
  }
  
  createDigitTextures() {
    // יצירת טקסטורות לספרות עם מראה מודרני ודיגיטלי
    
    // טקסטורה פרוצדורלית לספרות רגילות (כחול)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע בסיסי - כחול עשיר יותר
    const digitColor = '#4285f4';
    ctx.fillStyle = digitColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת דפוס דיגיטלי/מודרני
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#76a8ff';
    
    // דפוס קווים דקים
    const lineSpacing = 8;
    for (let x = 0; x < canvas.width; x += lineSpacing) {
      ctx.fillRect(x, 0, 1, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += lineSpacing) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    
    // הוספת שכבת נצנוץ
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, size, size);
    }
    
    // הוספת אפקט של קצוות עם הארה
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    
    // יצירת טקסטורה מהקנבס
    const digitTexture = new THREE.CanvasTexture(canvas);
    this.textures.digit = digitTexture;
    this.textures.digitNormal = this.createNormalMap(canvas, 2.5);
    
    // חומר לספרות רגילות - מעט זוהר
    this.materials.digit = new THREE.MeshStandardMaterial({
      map: this.textures.digit,
      normalMap: this.textures.digitNormal,
      roughness: 0.3,
      metalness: 0.7,
      color: COLORS.DIGIT,
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: 0.2,
      envMapIntensity: 1.5
    });
    
    // טקסטורה לספרות נבחרות - כחול כהה וזוהר
    const selectedCanvas = document.createElement('canvas');
    selectedCanvas.width = 512;
    selectedCanvas.height = 512;
    const selectedCtx = selectedCanvas.getContext('2d');
    
    // צבע רקע כחול כהה
    const selectedColor = '#0d47a1';
    selectedCtx.fillStyle = selectedColor;
    selectedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת דפוס הארה דיגיטלי
    selectedCtx.globalAlpha = 0.3;
    selectedCtx.fillStyle = '#1565c0';
    
    // דפוס קווים
    for (let x = 0; x < canvas.width; x += lineSpacing) {
      selectedCtx.fillRect(x, 0, 2, canvas.height);
    }
    
    // הוספת זוהר פעימה (כמו אלקטרוני)
    selectedCtx.globalCompositeOperation = 'lighter';
    const pulseGradient = selectedCtx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.6
    );
    pulseGradient.addColorStop(0, 'rgba(120, 180, 255, 0.4)');
    pulseGradient.addColorStop(0.7, 'rgba(100, 170, 255, 0.1)');
    pulseGradient.addColorStop(1, 'rgba(100, 170, 255, 0)');
    
    selectedCtx.fillStyle = pulseGradient;
    selectedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // קווי זוהר בקצוות
    selectedCtx.strokeStyle = '#ffffff';
    selectedCtx.lineWidth = 10;
    selectedCtx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    selectedCtx.globalCompositeOperation = 'source-over';
    selectedCtx.globalAlpha = 1.0;
    
    // הוספת נקודות זוהר
    selectedCtx.globalAlpha = 0.8;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 3 + 2;
      
      selectedCtx.beginPath();
      selectedCtx.arc(x, y, radius, 0, Math.PI * 2);
      selectedCtx.fillStyle = '#ffffff';
      selectedCtx.fill();
      
      // זוהר סביב הנקודות
      const glowRadius = radius * 3;
      const glow = selectedCtx.createRadialGradient(
        x, y, radius,
        x, y, glowRadius
      );
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      selectedCtx.globalAlpha = 0.3;
      selectedCtx.beginPath();
      selectedCtx.arc(x, y, glowRadius, 0, Math.PI * 2);
      selectedCtx.fillStyle = glow;
      selectedCtx.fill();
    }
    selectedCtx.globalAlpha = 1.0;
    
    const selectedTexture = new THREE.CanvasTexture(selectedCanvas);
    this.textures.digitSelected = selectedTexture;
    
    // חומר לספרות נבחרות - זוהר חזק
    this.materials.digitSelected = new THREE.MeshStandardMaterial({
      map: this.textures.digitSelected,
      normalMap: this.textures.digitNormal,
      roughness: 0.2,
      metalness: 0.8,
      color: COLORS.SELECTED_DIGIT,
      emissive: new THREE.Color(0x3366cc),
      emissiveIntensity: 0.5,
      envMapIntensity: 2.0
    });
    
    // טקסטורה לספרות מוצבות - ירוק זוהר
    const placedCanvas = document.createElement('canvas');
    placedCanvas.width = 512;
    placedCanvas.height = 512;
    const placedCtx = placedCanvas.getContext('2d');
    
    // צבע רקע ירוק עשיר
    const placedColor = '#34a853';
    placedCtx.fillStyle = placedColor;
    placedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // הוספת דפוס דיגיטלי
    placedCtx.globalAlpha = 0.2;
    placedCtx.fillStyle = '#40b764';
    
    // דפוס קווים אופקיים
    for (let y = 0; y < canvas.height; y += lineSpacing) {
      placedCtx.fillRect(0, y, canvas.width, 2);
    }
    
    // הוספת זוהר ירוק
    placedCtx.globalCompositeOperation = 'lighter';
    const greenGlow = placedCtx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.6
    );
    greenGlow.addColorStop(0, 'rgba(120, 255, 150, 0.3)');
    greenGlow.addColorStop(0.6, 'rgba(100, 255, 150, 0.1)');
    greenGlow.addColorStop(1, 'rgba(100, 255, 150, 0)');
    
    placedCtx.fillStyle = greenGlow;
    placedCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // קווי זוהר בקצוות
    placedCtx.strokeStyle = '#ffffff';
    placedCtx.lineWidth = 8;
    placedCtx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    placedCtx.globalCompositeOperation = 'source-over';
    
    // הוספת סימן "וי" קטן בפינה כאינדיקציה שהספרה ממוקמת
    placedCtx.fillStyle = '#ffffff';
    placedCtx.globalAlpha = 0.7;
    const checkmarkSize = 70;
    const margin = 50;
    
    // ציור הסימון "וי" בפינה הימנית העליונה
    placedCtx.beginPath();
    placedCtx.moveTo(canvas.width - margin - checkmarkSize, margin + checkmarkSize/2);
    placedCtx.lineTo(canvas.width - margin - checkmarkSize/2, margin + checkmarkSize);
    placedCtx.lineTo(canvas.width - margin, margin);
    placedCtx.lineWidth = 14;
    placedCtx.strokeStyle = '#ffffff';
    placedCtx.stroke();
    
    placedCtx.globalAlpha = 1.0;
    
    const placedTexture = new THREE.CanvasTexture(placedCanvas);
    this.textures.digitPlaced = placedTexture;
    
    // חומר לספרות מוצבות - ירוק זוהר
    this.materials.digitPlaced = new THREE.MeshStandardMaterial({
      map: this.textures.digitPlaced,
      normalMap: this.textures.digitNormal,
      roughness: 0.4,
      metalness: 0.6,
      color: COLORS.PLACED_DIGIT,
      emissive: new THREE.Color(0x118833),
      emissiveIntensity: 0.3,
      envMapIntensity: 1.5
    });
  }
  
  createFloorTexture() {
    // יצירת טקסטורה פרוצדורלית לרצפה - עם אפקט של אריחים/מרצפות
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // צבע רקע בסיסי
    ctx.fillStyle = '#e6f0ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // יצירת דפוס של אריחים מודרניים
    const tileSize = 256;
    const tileBorder = 4;
    
    for (let x = 0; x < canvas.width; x += tileSize) {
      for (let y = 0; y < canvas.height; y += tileSize) {
        // צבע אריח בסיסי - גוון כחלחל עדין
        const baseColor = Math.random() > 0.8 ? '#e2eafd' : '#edf3ff';
        ctx.fillStyle = baseColor;
        ctx.fillRect(x + tileBorder, y + tileBorder, tileSize - tileBorder*2, tileSize - tileBorder*2);
        
        // הוספת פיזור צבע דקיק בתוך האריח
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 100; i++) {
          const dotX = x + tileBorder + Math.random() * (tileSize - tileBorder*2);
          const dotY = y + tileBorder + Math.random() * (tileSize - tileBorder*2);
          const radius = Math.random() * 8 + 2;
          
          // גווני כחול עדינים
          const blue = 210 + Math.random() * 30;
          ctx.beginPath();
          ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(230, 240, ${blue})`;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // הוספת אפקט מרקם/השתקפות לאריח
        if (Math.random() > 0.6) {
          ctx.globalAlpha = 0.03;
          ctx.fillStyle = '#ffffff';
          
          // קו אלכסוני דק של השתקפות
          const startX = x + tileBorder;
          const startY = y + tileBorder;
          const width = tileSize - tileBorder*2;
          const height = tileSize - tileBorder*2;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + width, startY + height);
          ctx.lineWidth = 30 + Math.random() * 30;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          
          ctx.globalAlpha = 1.0;
        }
      }
    }
    
    // הוספת אפקט אור כללי במרכז
    const lightGradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width/2
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    lightGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    lightGradient.addColorStop(1, 'rgba(240, 240, 255, 0.05)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // יצירת הטקסטורה מהקנבס
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    
    this.textures.floor = texture;
    this.textures.floorNormal = this.createNormalMap(canvas, 1.0);
    
    // חומר לרצפה - מעט מבריק
    this.materials.floor = new THREE.MeshStandardMaterial({
      map: this.textures.floor,
      normalMap: this.textures.floorNormal,
      roughness: 0.7,
      metalness: 0.2,
      color: 0xffffff,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2
    });
  }
  
  createNormalMap(sourceCanvas, intensity = 1.0) {
    // יצירת normal map מקנבס נתון
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
    
    // חישוב מפת נורמל בסיסית
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const i = (y * canvas.width + x) * 4;
        
        // קריאת בהירות פיקסלים שכנים
        const left = (pixels[(y * canvas.width + (x - 1)) * 4] + 
                      pixels[(y * canvas.width + (x - 1)) * 4 + 1] + 
                      pixels[(y * canvas.width + (x - 1)) * 4 + 2]) / 3;
        
        const right = (pixels[(y * canvas.width + (x + 1)) * 4] + 
                       pixels[(y * canvas.width + (x + 1)) * 4 + 1] + 
                       pixels[(y * canvas.width + (x + 1)) * 4 + 2]) / 3;
        
        const top = (pixels[((y - 1) * canvas.width + x) * 4] + 
                     pixels[((y - 1) * canvas.width + x) * 4 + 1] + 
                     pixels[((y - 1) * canvas.width + x) * 4 + 2]) / 3;
        
        const bottom = (pixels[((y + 1) * canvas.width + x) * 4] + 
                        pixels[((y + 1) * canvas.width + x) * 4 + 1] + 
                        pixels[((y + 1) * canvas.width + x) * 4 + 2]) / 3;
        
        // חישוב וקטור נורמל
        const dx = (right - left) * intensity;
        const dy = (bottom - top) * intensity;
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
    
    // צייר את הנורמל מפ על הקנבס
    ctx.putImageData(normalMapData, 0, 0);
    
    // יצירת הטקסטורה מהקנבס
    const normalTexture = new THREE.CanvasTexture(canvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    
    return normalTexture;
  }
  
  // פונקציות עזר לעדכון חומרים
  updateDigitMaterial(segment, state) {
    if (state === 'normal') {
      segment.material = this.materials.digit;
    } else if (state === 'selected') {
      segment.material = this.materials.digitSelected;
    } else if (state === 'placed') {
      segment.material = this.materials.digitPlaced;
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