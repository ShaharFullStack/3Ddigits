import { BoardManager } from './boardManager.js';
import { DigitManager } from './digitManager.js';
import { InteractionManager } from './interactionManager.js';
import { SceneManager } from './sceneManager.js';
import { TextureManager } from './texture-manager.js';
import { UIManager } from './uiManager.js';
import * as THREE from 'three';


class GameManager {
  constructor() {
    this.initialized = false;
    this.init();
  }
  
  async init() {
    try {
      // Show loading screen
      this.showLoadingScreen();
      
      // יצירת מנהל הטקסטורות תחילה
      this.textureManager = new TextureManager();
      
      // אתחול מנהל הסצנה
      this.sceneManager = new SceneManager(this.textureManager);
      await this.sceneManager.initScene();
      this.sceneManager.addLights();
      
      // אתחול מנהלים אחרים עם מנהל הטקסטורות
      this.boardManager = new BoardManager(this.sceneManager.scene, this.textureManager);
      this.boardManager.createBoard();
      
      this.sceneManager.createFloor();
      
      // הוספת קווי ציר להתמצאות (כמו בתמונה)
      this.sceneManager.addAxisLines();
      
      // יצירת מנהל הספרות לאחר יצירת הלוח כדי לאפשר תקשורת ביניהם
      this.digitManager = new DigitManager(this.sceneManager.scene, this.textureManager);
      this.digitManager.createDigits();
      
      this.uiManager = new UIManager(this.digitManager);
      
      this.interactionManager = new InteractionManager(
        this.sceneManager,
        this.boardManager,
        this.digitManager
      );
      this.interactionManager.initEventListeners();
      
      // עדכון הוראות עכבר
      this.updateInstructions();
      
      // חיבור בין המנהלים להבטחת תקשורת טובה יותר
      this.connectManagers();
      
      // התחלת לולאת המשחק
      this.initialized = true;
      this.animate = this.animate.bind(this);
      this.animate();
      
      // Hide loading screen after initialization
      this.hideLoadingScreen();
      
      // Show welcome message
      this.showWelcomeMessage();
    } catch (error) {
      console.error("Error initializing game:", error);
      this.showErrorMessage("שגיאה באתחול המשחק. נא לרענן את הדף.");
    }
  }
  
  // פונקציה חדשה להבטחת חיבור טוב בין המנהלים השונים
  connectManagers() {
    // ודא שמנהל הלוח מקושר לסצנה דרך userData
    this.sceneManager.scene.userData.boardManager = this.boardManager;
    
    // שמור על קישור גם ב-intersection manager
    this.interactionManager.boardManager = this.boardManager;
    
    console.log("Managers connected for better communication");
  }
  
  showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = '#e6f0ff';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '1000';
    loadingScreen.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    
    const title = document.createElement('h1');
    title.textContent = 'משחק הספרות';
    title.style.color = '#4285f4';
    title.style.marginBottom = '20px';
    title.style.fontSize = '32px';
    
    const loadingText = document.createElement('p');
    loadingText.textContent = 'טוען משחק...';
    loadingText.style.color = '#555';
    loadingText.style.marginBottom = '30px';
    
    const spinner = document.createElement('div');
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.border = '5px solid rgba(66, 133, 244, 0.3)';
    spinner.style.borderTop = '5px solid #4285f4';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(style);
    loadingScreen.appendChild(title);
    loadingScreen.appendChild(loadingText);
    loadingScreen.appendChild(spinner);
    document.body.appendChild(loadingScreen);
  }
  
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
  }
  
  showWelcomeMessage() {
    // Show welcome message box
    const messageBox = document.getElementById("messageBox");
    const messageTitle = messageBox.querySelector("h2");
    const messageText = messageBox.querySelector("p");
    const closeButton = document.getElementById("closeMessage");
    
    messageTitle.textContent = "ברוכים הבאים למשחק הספרות!";
    messageText.innerHTML = `
      <strong>הוראות המשחק:</strong><br>
      - בחר ספרה מסביב ללוח המשחק<br>
      - גרור אותה למשושים שעל הלוח<br>
      - השתמש בגלגל העכבר לסובב את הספרה<br>
      - לחץ לחיצה ימנית להפוך את הספרה<br><br>
      <strong>מטרת המשחק:</strong><br>
      למקם את כל 10 הספרות על הלוח<br>
      בהצלחה!
    `;
    
    closeButton.textContent = "התחל משחק";
    messageBox.style.display = "block";
    
    // Add event listener for close button
    closeButton.addEventListener("click", function() {
      messageBox.style.display = "none";
    });
  }
  
  setupPostProcessing() {
    // בהמשך ניתן להוסיף כאן אפקטים ויזואליים נוספים
    // כמו זוהר (bloom), SSAO, אנטי-אליאסינג משופר וכדומה
  }
  
  updateInstructions() {
    // עדכון הוראות למובייל כולל בקרות עכבר/מגע חדשות
    const mobileInstructions = document.getElementById("mobileInstructions");
    if (mobileInstructions) {
      const instructionsContent = `
        <h2>הוראות משחק</h2>
        <h3>שליטה בעכבר</h3>
        <ul>
          <li>לחץ על ספרה כדי לבחור בה</li>
          <li>לחץ וגרור ספרות כדי להזיז אותן למשושים על הלוח</li>
          <li>השתמש בגלגל העכבר כדי לסובב ספרות נבחרות</li>
          <li>לחץ לחיצה ימנית כדי להפוך ספרה נבחרת</li>
        </ul>
        <h3>שליטה במובייל</h3>
        <ul>
          <li><strong>🔄</strong> - החלף בין מצב מצלמה למצב גרירה</li>
          <li><strong>+/-</strong> - הגדל/הקטן תצוגה</li>
          <li>במצב מצלמה, השתמש באצבע אחת לסיבוב התצוגה, שתי אצבעות להזזת התצוגה</li>
          <li>במצב גרירה, הקש על ספרה כדי לבחור בה וגרור כדי למקם</li>
          <li>השתמש בשתי אצבעות כדי לסובב ספרה נבחרת</li>
          <li>הקש פעמיים על ספרה נבחרת כדי להפוך אותה</li>
        </ul>
        <h3>מטרת המשחק</h3>
        <ul>
          <li>מקם את כל 10 הספרות על הלוח במשושים המתאימים</li>
          <li>הספרות יוצמדו אוטומטית למשושים הקרובים ביותר</li>
        </ul>
      `;
      mobileInstructions.innerHTML = instructionsContent + `
        <button id="closeMobileInstructions">סגור</button>
      `;
      
      // חיבור מחדש של מאזין האירועים
      document.getElementById("closeMobileInstructions").addEventListener(
        "click", 
        this.interactionManager.hideMobileInstructions
      );
    }
  }
  
  animate() {
    if (!this.initialized) return;
    
    requestAnimationFrame(this.animate);
    
    // עדכון בקרים
    this.sceneManager.controls.update();
    
    // רינדור סצנה
    this.sceneManager.renderer.render(
      this.sceneManager.scene,
      this.sceneManager.camera
    );
  }
  
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.background = 'rgba(200,0,0,0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.fontSize = '16px';
    errorDiv.style.fontFamily = 'sans-serif';
    errorDiv.style.zIndex = '1001';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.textContent = message;
    
    document.body.appendChild(errorDiv);
  }
}

// אתחול המשחק כאשר ה-DOM נטען
  document.addEventListener('DOMContentLoaded', () => {
    const game = new GameManager();
  });