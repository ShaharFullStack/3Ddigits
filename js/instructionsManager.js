import { BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH } from './constants.js';

export class InteractionManager {
  constructor(sceneManager, boardManager, digitManager) {
    this.sceneManager = sceneManager;
    this.boardManager = boardManager;
    this.digitManager = digitManager;
    
    // Interaction properties
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isDragging = false;
    this.dragOffset = new THREE.Vector3();
    this.dragPlane = new THREE.Plane();
    this.isTouchDevice = false;
    this.cameraMode = false;
    this.touchStartPosition = { x: 0, y: 0 };
    this.touchStartTime = 0;
  }

  initEventListeners() {
    // Computer event listeners
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.getElementById("canvas").addEventListener("mousedown", this.onMouseDown.bind(this));
    document.getElementById("canvas").addEventListener("mousemove", this.onMouseMove.bind(this));
    document.getElementById("canvas").addEventListener("mouseup", this.onMouseUp.bind(this));
    document.getElementById("canvas").addEventListener("wheel", this.onMouseWheel.bind(this));

    // Game control listeners
    document.getElementById("resetButton").addEventListener("click", this.resetGame.bind(this));
    document.getElementById("closeMessage").addEventListener("click", this.closeMessage.bind(this));

    // Touch screen listeners
    document.getElementById("canvas").addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
    document.getElementById("canvas").addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
    document.getElementById("canvas").addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
    document.getElementById("mobileCameraBtn").addEventListener("click", this.toggleCameraMode.bind(this));
    document.getElementById("mobileZoomInBtn").addEventListener("click", () => this.sceneManager.adjustZoom(0.9));
    document.getElementById("mobileZoomOutBtn").addEventListener("click", () => this.sceneManager.adjustZoom(1.1));
    document.getElementById("instructionsButton").addEventListener("click", this.showMobileInstructions);
    document.getElementById("closeMobileInstructions").addEventListener("click", this.hideMobileInstructions);

    // Check if device supports touch
    this.checkIfTouchDevice();
  }
  
  onMouseWheel(event) {
    // If we're dragging a digit, use the wheel to rotate it
    if (this.isDragging && this.digitManager.selectedDigit) {
      // Prevent default scrolling behavior
      event.preventDefault();
      
      // Determine direction based on deltaY (positive is scroll down, negative is scroll up)
      const direction = event.deltaY > 0 ? 1 : -1;
      
      // Rotate the digit (smaller rotation increments for smoother experience)
      const rotationAmount = direction * (Math.PI / 12); // 15 degree increments
      this.digitManager.selectedDigit.userData.rotation += rotationAmount;
      this.digitManager.selectedDigit.rotation.y = this.digitManager.selectedDigit.userData.rotation;
      
      // If shift is pressed, flip the digit instead
      if (event.shiftKey) {
        this.digitManager.flipSelectedDigit();
      }
    }
  }

  onWindowResize() {
    this.sceneManager.onWindowResize();
  }

  checkIfTouchDevice() {
    this.isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    // Adjust UI based on device type
    if (this.isTouchDevice) {
      document.getElementById("mobileControls").style.display = "flex";
      document.getElementById("instructionsButton").style.display = "block";
    } else {
      document.getElementById("mobileControls").style.display = "none";
      document.getElementById("instructionsButton").style.display = "none";
    }
  }

  showMobileInstructions() {
    document.getElementById("mobileInstructions").style.display = "block";
  }

  hideMobileInstructions() {
    document.getElementById("mobileInstructions").style.display = "none";
  }

  toggleCameraMode() {
    this.cameraMode = !this.cameraMode;
    
    // Toggle dragging controls
    this.sceneManager.controls.enabled = this.cameraMode;
    
    // Update button appearance
    document.getElementById("mobileCameraBtn").style.backgroundColor =
      this.cameraMode ? "#ffcc00" : "rgba(255, 255, 255, 0.8)";
  }

  resetGame() {
    this.digitManager.resetDigits();
    this.closeMessage();
    this.updateProgressBar();
  }

  closeMessage() {
    document.getElementById("messageBox").style.display = "none";
  }

  updateProgressBar() {
    const totalDigits = 10;
    const placedCount = Object.keys(this.digitManager.placedDigits).length;
    const progressPercentage = (placedCount / totalDigits) * 100;

    document.getElementById("progressFill").style.width = `${progressPercentage}%`;
  }

  checkGameCompletion() {
    const totalDigits = 10;
    const placedCount = Object.keys(this.digitManager.placedDigits).length;

    if (placedCount === totalDigits) {
      // Game completed successfully
      document.getElementById("messageBox").style.display = "block";
    }
  }

  getIntersectionWithBoard() {
    // Cast ray from camera through mouse position
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    // Check for intersection with board plane
    const intersects = this.raycaster.intersectObject(this.boardManager.boardPlane);

    return intersects.length > 0 ? intersects[0] : null;
  }

  onMouseDown(event) {
    // Only handle left mouse button
    if (event.button !== 0) return;

    // Convert mouse position to normalized coordinates
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Disable orbit controls when attempting to interact with digits
    this.sceneManager.controls.enabled = false;

    // Check for digit interaction 
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
    const digitIntersects = this.raycaster.intersectObjects(
      this.digitManager.digits.concat(this.digitManager.digits.flatMap((d) => d.children))
    );

    if (digitIntersects.length > 0) {
      let intersectedObject = digitIntersects[0].object;

      // If clicked on a segment, get the parent digit
      if (intersectedObject.userData.parentDigit) {
        intersectedObject = intersectedObject.userData.parentDigit;
      }

      // Only process if the digit is not already placed
      const value = intersectedObject.userData.value;
      if (!intersectedObject.userData.placed) {
        // If this digit is already selected, start dragging
        if (this.digitManager.selectedDigit === intersectedObject) {
          this.isDragging = true;
          
          // Calculate drag plane and offset
          const boardIntersection = this.getIntersectionWithBoard();
          if (boardIntersection) {
            this.dragPlane.setFromNormalAndCoplanarPoint(
              new THREE.Vector3(0, 1, 0),
              boardIntersection.point
            );
            
            const planeIntersection = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.dragPlane, planeIntersection);
            this.dragOffset.subVectors(intersectedObject.position, planeIntersection);
          }
        } else {
          // First click, just select the digit
          this.digitManager.selectDigit(value);
        }
      }
      
      // Prevent camera control when interacting with digits
      event.preventDefault();
    } else {
      // If not clicking on a digit, enable camera controls
      this.sceneManager.controls.enabled = true;
    }
  }

  onMouseMove(event) {
    if (!this.isDragging || !this.digitManager.selectedDigit) {
      return;
    }

    // Update mouse position
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Use drag plane to calculate new position
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

    const planeIntersection = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, planeIntersection)) {
      // Update digit position with offset
      this.digitManager.selectedDigit.position.copy(planeIntersection.add(this.dragOffset));

      // Keep digit above board
      this.digitManager.selectedDigit.position.y = Math.max(
        this.digitManager.selectedDigit.position.y,
        BOARD_DEPTH / 2 + 0.1
      );
    }
  }

  onMouseUp(event) {
    if (this.isDragging && this.digitManager.selectedDigit) {
      // Check if digit is over the board
      const boardIntersection = this.getIntersectionWithBoard();
      if (boardIntersection) {
        // Check if digit is within board boundaries
        const boardWidth = BOARD_WIDTH / 2;
        const boardHeight = BOARD_HEIGHT / 2;

        if (
          Math.abs(boardIntersection.point.x) < boardWidth &&
          Math.abs(boardIntersection.point.z) < boardHeight
        ) {
          // Place the digit
          this.digitManager.placeDigit(this.digitManager.selectedDigit, boardIntersection.point);
          
          // Update game state
          this.updateProgressBar();
          this.checkGameCompletion();
        } else {
          // Return digit to original position if outside board
          this.digitManager.selectedDigit.position.copy(
            this.digitManager.selectedDigit.userData.originalPosition
          );
        }
      } else {
        // Return digit to original position
        this.digitManager.selectedDigit.position.copy(
          this.digitManager.selectedDigit.userData.originalPosition
        );
      }
    }

    // Reset drag state
    this.isDragging = false;
    
    // Re-enable camera controls
    this.sceneManager.controls.enabled = true;
  }

  onTouchStart(event) {
    event.preventDefault();

    if (event.touches.length === 1) {
      // If in camera mode, let the controls handle it
      if (this.cameraMode) {
        return;
      }

      // Convert touch position
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      // Save initial position for tap detection
      this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
      this.touchStartTime = Date.now();

      // Handle like mouse down
      this.onMouseDown({
        button: 0,
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
      });
    }
  }

  onTouchMove(event) {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];

      // If in camera mode, skip digit movement
      if (this.cameraMode) {
        return;
      }

      // Convert touch position
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle like mouse move
      this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  onTouchEnd(event) {
    event.preventDefault();

    // Check if it's a tap or drag
    const currentTime = Date.now();
    const touchDuration = currentTime - this.touchStartTime;

    // If it's a tap (less than 200ms)
    if (touchDuration < 200 && !this.isDragging) {
      // Check if it's close to start position
      if (event.changedTouches.length === 1) {
        const touch = event.changedTouches[0];
        const dx = touch.clientX - this.touchStartPosition.x;
        const dy = touch.clientY - this.touchStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          // It's a tap - check if we tapped on a digit
          this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
          const digitIntersects = this.raycaster.intersectObjects(
            this.digitManager.digits.concat(this.digitManager.digits.flatMap((d) => d.children))
          );

          if (digitIntersects.length > 0) {
            let intersectedObject = digitIntersects[0].object;

            if (intersectedObject.userData.parentDigit) {
              intersectedObject = intersectedObject.userData.parentDigit;
            }

            const value = intersectedObject.userData.value;
            if (!intersectedObject.userData.placed) {
              this.digitManager.selectDigit(value);
            }
          }
        }
      }
    } else {
      // It's a drag - finish like mouse up
      this.onMouseUp({});
    }

    // Reset drag state
    this.isDragging = false;
  }
}