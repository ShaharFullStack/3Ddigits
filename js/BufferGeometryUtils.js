// bufferGeometryHelper.js
// קובץ עזר להכנסה בתיקיית js של הפרויקט

// פתרון פשוט יותר לאיחוד הספרות - יצירת מחלקה מותאמת ללא תלות בטעינה חיצונית
class DigitGeometryHelper {
    constructor() {
      // מגדיר את הפרמטרים לבניית ספרות
      this.segWidth = 0.7;   // רוחב מקטע
      this.segHeight = 0.15; // גובה מקטע
      this.segDepth = 0.25;  // עומק מקטע
      this.segSpacing = 0.8; // מרווח בין המקטעים
      
      // הגדרת מקטעים לכל ספרה (סטנדרט 7-segment)
      this.digitSegments = {
        0: [true, true, true, true, true, true, false],
        1: [false, true, true, false, false, false, false],
        2: [true, true, false, true, true, false, true],
        3: [true, true, true, true, false, false, true],
        4: [false, true, true, false, false, true, true],
        5: [true, false, true, true, false, true, true],
        6: [true, false, true, true, true, true, true],
        7: [true, true, true, false, false, false, false],
        8: [true, true, true, true, true, true, true],
        9: [true, true, true, true, false, true, true]
      };
      
      // מיקומים של המקטעים
      this.segmentPositions = [
        [0, this.segSpacing, 0],              // a
        [this.segSpacing/2, this.segSpacing/2, 0],  // b
        [this.segSpacing/2, -this.segSpacing/2, 0], // c
        [0, -this.segSpacing, 0],             // d
        [-this.segSpacing/2, -this.segSpacing/2, 0],// e
        [-this.segSpacing/2, this.segSpacing/2, 0], // f
        [0, 0, 0]                             // g
      ];
      
      // סיבובים של המקטעים
      this.segmentRotations = [
        [0, 0, 0],         // a (אופקי)
        [0, 0, Math.PI/2], // b (אנכי)
        [0, 0, Math.PI/2], // c (אנכי)
        [0, 0, 0],         // d (אופקי)
        [0, 0, Math.PI/2], // e (אנכי)
        [0, 0, Math.PI/2], // f (אנכי)
        [0, 0, 0]          // g (אופקי)
      ];
    }
  
    // יצירת ספרה מאוחדת כגאומטריה אחת
    createDigitGeometry(value) {
      // וידוא שהערך תקין
      if (value < 0 || value > 9) {
        console.error('Invalid digit value:', value);
        return null;
      }
      
      // יצירת קבוצה להכיל את הגאומטריה
      const group = new THREE.Group();
      
      // הוספת המקטעים הנדרשים לספרה
      for (let i = 0; i < 7; i++) {
        if (this.digitSegments[value][i]) {
          // יצירת גאומטריה למקטע
          const segGeometry = new THREE.BoxGeometry(
            i % 3 === 0 ? this.segWidth : this.segHeight,
            i % 3 === 0 ? this.segHeight : this.segWidth,
            this.segDepth
          );
          
          // יצירת חומר
          const segMaterial = new THREE.MeshPhongMaterial({
            color: 0x4285f4,
            specular: 0xffffff,
            shininess: 70
          });
          
          // יצירת מש מהגאומטריה והחומר
          const segMesh = new THREE.Mesh(segGeometry, segMaterial);
          
          // הגדרת מיקום המקטע
          segMesh.position.set(
            this.segmentPositions[i][0],
            this.segmentPositions[i][1],
            this.segmentPositions[i][2]
          );
          
          // הגדרת סיבוב המקטע
          segMesh.rotation.set(
            this.segmentRotations[i][0],
            this.segmentRotations[i][1],
            this.segmentRotations[i][2]
          );
          
          // הוספה לקבוצה
          group.add(segMesh);
        }
      }
      
      return group;
    }
  }
  
  // ייצוא המחלקה לשימוש
  export { DigitGeometryHelper };