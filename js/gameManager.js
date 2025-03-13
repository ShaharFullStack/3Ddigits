import { SceneManager } from './sceneManager.js';
import { BoardManager } from './boardManager.js';
import { DigitManager } from './digitManager.js';
import { UIManager } from './uiManager.js';
import { InteractionManager } from './interactionManager.js';


class GameManager {
  constructor() {
    this.initialized = false;
    this.init();
  }
  
  async init() {
    try {
      // Initialize scene manager
      this.sceneManager = new SceneManager();
      await this.sceneManager.initScene();
      this.sceneManager.addLights();
      this.sceneManager.createFloor();
      
      // Initialize other managers
      this.boardManager = new BoardManager(this.sceneManager.scene);
      this.boardManager.createBoard();
      
      this.digitManager = new DigitManager(this.sceneManager.scene);
      this.digitManager.createDigits();
      
      this.uiManager = new UIManager(this.digitManager);
      // No need to call createUI since we've removed the UI buttons
      
      this.interactionManager = new InteractionManager(
        this.sceneManager,
        this.boardManager,
        this.digitManager
      );
      this.interactionManager.initEventListeners();
      
      // Update mouse instructions
      this.updateInstructions();
      
      // Start game loop
      this.initialized = true;
      this.animate = this.animate.bind(this);
      this.animate();
    } catch (error) {
      console.error("Error initializing game:", error);
      this.showErrorMessage("Failed to initialize game. Please try refreshing the page.");
    }
  }
  
  updateInstructions() {
    // Update mobile instructions to include new mouse/touch controls
    const mobileInstructions = document.getElementById("mobileInstructions");
    if (mobileInstructions) {
      const instructionsContent = `
        <h2>Game Instructions</h2>
        <h3>Mouse Controls</h3>
        <ul>
          <li>Click and drag digits to move them</li>
          <li>Use the mouse wheel to rotate selected digits</li>
          <li>Right-click to flip a selected digit</li>
        </ul>
        <h3>Mobile Controls</h3>
        <ul>
          <li><strong>🔄</strong> - Toggle between camera mode and drag mode</li>
          <li><strong>+/-</strong> - Zoom in/out</li>
          <li>In camera mode, use one finger to rotate view, two fingers to pan</li>
          <li>In drag mode, tap a digit to select it and drag to place</li>
          <li>Use two fingers to rotate a selected digit</li>
          <li>Double-tap a selected digit to flip it</li>
        </ul>
      `;
      mobileInstructions.innerHTML = instructionsContent + `
        <button id="closeMobileInstructions">Close</button>
      `;
      
      // Re-attach the event listener
      document.getElementById("closeMobileInstructions").addEventListener(
        "click", 
        this.interactionManager.hideMobileInstructions
      );
    }
  }
  
  animate() {
    if (!this.initialized) return;
    
    requestAnimationFrame(this.animate);
    
    // Update controls
    this.sceneManager.controls.update();
    
    // Render scene
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
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new GameManager();
});