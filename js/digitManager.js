import { COLORS, BOARD_DEPTH, BOARD_WIDTH, BOARD_HEIGHT } from './constants.js';
import * as THREE from 'three';
import { OctagonalDigitGenerator } from './OctagonalDigitGenerator.js';

export class DigitManager {
  constructor(scene, textureManager) {
    this.scene = scene;
    this.textureManager = textureManager;
    this.digits = [];
    this.selectedDigit = null;
    this.placedDigits = {};
    this.digitModels = {};
    this.digitGenerator = new OctagonalDigitGenerator();
  }

  createDigits() {
    // קבלת הספרות והחומרים מ-generator
    const { digits, materials } = this.digitGenerator.createAllDigits();

    // חישוב מיקומים מסביב ללוח
    const boardOffset = 3.5; // מרחק מקצה הלוח

    // יצירת כל 10 הספרות במיקומים המתאימים
    for (let i = 0; i < 10; i++) {
      const digit = digits[i];

      // חישוב מיקום לפי אינדקס הספרה
      let x, y, z;

      if (i < 3) {
        // ספרות 0-4 בצד שמאל של הלוח
        x = -BOARD_WIDTH / 2 - boardOffset;
        y = BOARD_DEPTH / 2;
        z = -BOARD_HEIGHT / 2 + i * (BOARD_HEIGHT / 2.4);
      }
      // ספרות 4 עד 7 בצד העליון של הלוח
      else if (i < 4) {
        x = -BOARD_WIDTH / 2 - boardOffset;
        y = BOARD_DEPTH / 2;
        z = -BOARD_HEIGHT / 2 + (i - 3) * (BOARD_HEIGHT / 2.4);
      }
      //  ספרות 7 עד 9 בצד התחתון של הלוח
        else if (i < 7) {
          x = -BOARD_WIDTH / 2 - boardOffset;
          y = BOARD_DEPTH / 2;
          z = -BOARD_HEIGHT / 2 + (i - 6) * (BOARD_HEIGHT / 2.4);
        }

        // ספרות 9 עד 10 בצד הימני של הלוח  
        else {
          x = BOARD_WIDTH / 2 + boardOffset;
          y = BOARD_DEPTH / 2;
          z = -BOARD_HEIGHT / 2 + (i - 5) * (BOARD_HEIGHT / 4);
        }
      

      // הגדרת מיקום התחלתי
      digit.userData.originalPosition = new THREE.Vector3(x, y, z);
      digit.position.copy(digit.userData.originalPosition);

      // הוספת אפקט ריחוף וזוהר
      this.addFloatingEffect(digit);

      // הוספה לסצנה ולמערכים פנימיים
      this.scene.add(digit);
      this.digits.push(digit);
      this.digitModels[i] = digit;
    }

    // שמירת החומרים לשימוש בהמשך
    this.materials = materials;

    return this.digits;
  }

  addFloatingEffect(digit) {
    // הוספת אנימציית ריחוף לספרות שאינן מוצבות
    const value = digit.userData.value;

    // הוספת זוהר עדין
    const glowGeometry = new THREE.RingGeometry(1.5, 1.55, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4285f4,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = -0.2;
    glow.rotation.x = Math.PI / 2;
    digit.add(glow);

    // יצירת אנימציית ריחוף
    const animateFloat = () => {
      if (!digit.userData.placed) {
        const time = Date.now() * 0.001;
        const floatAmount = Math.sin(time + value) * 0.1;
        const rotationAmount = Math.sin(time * 0.5 + value) * 0.03;

        // תנועת ריחוף
        digit.position.y = digit.userData.originalPosition.y + floatAmount;

        // סיבוב עדין לתחושת "חיות"
        if (!this.selectedDigit || this.selectedDigit !== digit) {
          digit.rotation.z = rotationAmount;
        }

        // המשך האנימציה
        requestAnimationFrame(animateFloat);
      }
    };

    // התחלת האנימציה
    animateFloat();
  }

  selectDigit(value) {
    // אם הספרה כבר הוצבה, לא ניתן לבחור בה
    if (this.digits[value].userData.placed) {
      return;
    }

    // ביטול בחירה קודמת
    if (this.selectedDigit) {
      // החזרת החומר הרגיל
      this.selectedDigit.children.forEach((seg) => {
        if (seg.isMesh && seg.material && !seg.name.includes('glow')) {
          seg.material = this.materials.normal.clone();
        }
      });

      // אנימציית הקטנה קלה
      this.animateScale(this.selectedDigit, 1, 0.95, 150);
    }

    // בחירת ספרה חדשה
    this.selectedDigit = this.digits[value];

    // שינוי מראה הספרה הנבחרת
    this.selectedDigit.children.forEach((seg) => {
      if (seg.isMesh && seg.material && !seg.name.includes('glow')) {
        seg.material = this.materials.selected.clone();
      }
    });

    // אנימציית בחירה
    this.animateScale(this.selectedDigit, 0.95, 1.1, 200);

    return this.selectedDigit;
  }

  animateScale(object, startScale, endScale, duration) {
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const scale = startScale + (endScale - startScale) * progress;

        object.scale.set(scale, scale, scale);

        requestAnimationFrame(animate);
      } else {
        object.scale.set(endScale, endScale, endScale);
      }
    };

    animate();
  }

  placeDigit(digit, position) {
    // ודא שהספרה אינה מוצבת כבר
    if (digit.userData.placed) {
      return;
    }

    // קבלת הפנייה הנכונה לספרה
    const parentDigit = digit.userData.parentDigit || digit;
    const digitValue = parentDigit.userData.value;

    // מיקום הספרה על הלוח
    parentDigit.position.copy(position);
    parentDigit.position.y = BOARD_DEPTH / 2 + 0.2; // מיקום מעט מעל הלוח

    // הוספת אנימציית הצבה
    this.animateDigitPlacement(parentDigit);

    // סימון הספרה כמוצבת
    parentDigit.userData.placed = true;
    this.placedDigits[digitValue] = parentDigit;

    // שינוי מראה לסמן סטטוס מוצב
    parentDigit.children.forEach((seg) => {
      if (seg.isMesh && seg.material && !seg.name.includes('glow')) {
        seg.material = this.materials.placed.clone();
      }
    });

    // איפוס בחירה
    if (this.selectedDigit === parentDigit) {
      this.selectedDigit = null;
    }

    // השמעת סאונד הצבה
    this.playPlacementSound();

    return true;
  }

  animateDigitPlacement(digit) {
    // אנימציית הצבת ספרה - אפקט קפיצה קלה
    const startY = digit.position.y + 0.5; // התחלה מעט גבוה יותר
    const endY = digit.position.y;
    const duration = 300; // מילישניות
    const startTime = Date.now();

    // שמירת סקייל מקורי
    const originalScale = digit.scale.clone();

    // מעיכה קלה בסוף
    const animatePosition = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // פונקציית ריכוך - קפיצה
      const bounce = (t) => {
        return --t * t * ((1.7 + 1) * t + 1.7) + 1;
      };

      // חישוב מיקום Y עם אפקט קפיצה
      const currentY = startY - (startY - endY) * bounce(progress);
      digit.position.y = currentY;

      // הוספת אפקט מעיכה קלה בסוף
      if (progress > 0.8) {
        const squashFactor = 1 + Math.sin((progress - 0.8) * 5 * Math.PI) * 0.15;
        digit.scale.set(
          originalScale.x * squashFactor,
          originalScale.y * (squashFactor),
          originalScale.z * squashFactor
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animatePosition);
      } else {
        // ודא מיקום וסקייל סופי
        digit.position.y = endY;
        digit.scale.copy(originalScale);
      }
    };

    // התחלת האנימציה
    digit.position.y = startY;
    animatePosition();
  }

  rotateSelectedDigit(direction) {
    if (!this.selectedDigit) return;

    // שמירת הסיבוב הקודם
    const prevRotation = this.selectedDigit.userData.rotation;

    // סיבוב ב-90 מעלות סביב ציר ה-y תוך שמירה על המנח האופקי
    const targetRotation = prevRotation + (direction * Math.PI);
    this.selectedDigit.userData.rotation = targetRotation;

    // אנימציית סיבוב
    this.animateRotation(this.selectedDigit, prevRotation, targetRotation, 150);
  }

  animateRotation(digit, startRotation, targetRotation, duration) {
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ריכוך חלק
      const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const currentRotation = startRotation + (targetRotation - startRotation) * easeInOut(progress);

      // איפוס הסיבוב תחילה למניעת סיבובים מצטברים
      digit.rotation.set(0, 0, 0);

      // קודם כל, הגדרת סיבוב X הנכון לשמירה על הספרה שטוחה
      digit.rotateX(digit.userData.initialXRotation);

      // לאחר מכן הוספת סיבוב ה-Z
      digit.rotateZ(currentRotation);

      // הוספת היפוך במידת הצורך
      if (digit.userData.flipped) {
        digit.rotateY(Math.PI);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  flipSelectedDigit() {
    if (!this.selectedDigit) return;

    // שמירת מצב ההיפוך הנוכחי
    const wasFlipped = this.selectedDigit.userData.flipped;

    // היפוך הספרה (סיבוב ב-180 מעלות סביב ציר ה-Y)
    this.selectedDigit.userData.flipped = !wasFlipped;

    // אנימציית היפוך
    this.animateFlip(this.selectedDigit, 600);
  }

  animateFlip(digit, duration) {
    const startTime = Date.now();
    const targetY = digit.userData.flipped ? Math.PI : 0;

    // שמירת מצב נוכחי
    const startY = targetY === 0 ? Math.PI : 0;
    const currentRotZ = digit.rotation.z;
    const initialXRotation = digit.userData.initialXRotation;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ריכוך אנימציה
      const easeOutBack = t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

      // חישוב סיבוב נוכחי
      const currentY = startY + (targetY - startY) * easeOutBack(progress);

      // איפוס והחלת כל הסיבובים
      digit.rotation.set(0, 0, 0);
      digit.rotateX(initialXRotation);
      digit.rotateZ(currentRotZ);
      digit.rotateY(currentY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  resetDigits() {
    // איפוס כל הספרות למיקומן המקורי עם אנימציה
    this.digits.forEach((digit) => {
      // אנימציית חזרה למיקום המקורי
      this.animateMove(digit, digit.position.clone(), digit.userData.originalPosition, 500);

      // איפוס סיבוב תוך שמירה על האוריינטציה האופקית
      digit.rotation.set(0, 0, 0);
      digit.rotateX(digit.userData.initialXRotation);
      digit.userData.placed = false;
      digit.userData.rotation = 0;
      digit.userData.flipped = false;

      // איפוס צבע וסקייל
      digit.children.forEach((seg) => {
        if (seg.isMesh && seg.material && !seg.name.includes('glow')) {
          seg.material = this.materials.normal.clone();
        }
      });

      digit.scale.set(1, 1, 1);
    });

    // איפוס מצב המשחק
    this.selectedDigit = null;
    this.placedDigits = {};
  }

  animateMove(object, startPos, endPos, duration) {
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ריכוך קוביק
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const t = easeOut(progress);

      // עדכון מיקום
      object.position.lerpVectors(startPos, endPos, t);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // ודא שהמיקום הסופי הוא בדיוק היעד
        object.position.copy(endPos);
      }
    };

    animate();
  }

  playPlacementSound() {
    // יצירת אפקט סאונד פשוט להצבה
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // יצירת אוסילטור לסאונד "קליק"
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);

      // יצירת נוד לבקרת ווליום
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      // חיבור נודים
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // נגינה ועצירה לאחר זמן קצר
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // כישלון שקט אם אודיו לא זמין
      console.log("Audio not available for sound effects");
    }
  }
}