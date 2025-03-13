export class UIManager {
  constructor(digitManager) {
    this.digitManager = digitManager;
  }

  createUI() {
    const container = document.getElementById("digitsContainer");

    for (let i = 0; i < 10; i++) {
      const button = document.createElement("button");
      button.className = "digitButton";
      button.textContent = i;
      button.dataset.value = i;
      button.addEventListener("click", () => this.digitManager.selectDigit(i));
      container.appendChild(button);
    }
  }

  updateProgressBar(placedCount, totalDigits = 10) {
    const progressPercentage = (placedCount / totalDigits) * 100;
    document.getElementById("progressFill").style.width = `${progressPercentage}%`;
  }

  showCompletionMessage() {
    document.getElementById("messageBox").style.display = "block";
  }

  hideCompletionMessage() {
    document.getElementById("messageBox").style.display = "none";
  }

  showMobileInstructions() {
    document.getElementById("mobileInstructions").style.display = "block";
  }

  hideMobileInstructions() {
    document.getElementById("mobileInstructions").style.display = "none";
  }

  updateCameraButtonState(cameraMode) {
    document.getElementById("mobileCameraBtn").style.backgroundColor =
      cameraMode ? "#ffcc00" : "rgba(255, 255, 255, 0.8)";
  }
  
  setupMobileControls(isTouchDevice) {
    if (isTouchDevice) {
      document.getElementById("mobileControls").style.display = "flex";
      document.getElementById("instructionsButton").style.display = "block";
    } else {
      document.getElementById("mobileControls").style.display = "none";
      document.getElementById("instructionsButton").style.display = "none";
    }
  }

  enableControlButtons(enabled) {
    const buttons = document.querySelectorAll(".controlButton");
    buttons.forEach((button) => {
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.5";
    });
  }
}
