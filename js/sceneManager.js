import { COLORS, BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH } from './constants.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

export class SceneManager {
    constructor(textureManager) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.textureManager = textureManager;
        this.envMap = null;
        this.useWebGPU = false;
    }

    async initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.BACKGROUND);
        
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(COLORS.BACKGROUND, 0.025);

        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 22);

        // Create environment map for reflections
        this.createEnvironmentMap();

        // Initialize renderer
        this.initRenderer();

        // Set up orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below the floor
        this.controls.minDistance = 5;
        this.controls.maxDistance = 105;
        this.controls.target.set(0, 0, 0);
        this.controls.zoomSpeed = 0.7;
        this.controls.rotateSpeed = 0.7;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
        };

        // Disable mousewheel zoom by default - we'll use it for digit rotation
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
    }

    initRenderer() {
        // Use WebGL renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
            antialias: true,
            alpha: true,
            stencil: true,
            precision: 'highp'
        });
        
        // Common renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // WebGL-specific configurations
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set lighting model (false = physically correct lighting in newer versions)
        this.renderer.useLegacyLights = false;
    }

    createEnvironmentMap() {
        // Create a simple environment map using a color gradient
        // Instead of creating a cube render target, we'll create a simpler environment
        // by using hemisphere lights to simulate ambient lighting
        
        // Add a hemisphere light for ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(
            0xddeeff, // Sky color
            0xe6f0ff, // Ground color
            0.6       // Intensity
        );
        this.scene.add(hemisphereLight);
        
        // Add directional lighting for better highlights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Flag that we're done with environment setup
        console.log("Environment lighting set up");
    }

    addLights() {
        // Main directional light with improved shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 12, 8);
        mainLight.castShadow = true;
        
        // Shadow configurations for better quality
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        mainLight.shadow.bias = -0.0005;
        
        // Add light target
        const target = new THREE.Object3D();
        target.position.set(0, 0, 0);
        this.scene.add(target);
        mainLight.target = target;
        
        this.scene.add(mainLight);

        // Second directional light from opposite angle
        const fillLight = new THREE.DirectionalLight(0xddeeff, 0.4);
        fillLight.position.set(-8, 10, -9);
        fillLight.castShadow = true;
        
        // Lower quality shadows for the fill light
        fillLight.shadow.mapSize.width = 1024;
        fillLight.shadow.mapSize.height = 1024;
        fillLight.shadow.camera.near = 0.1;
        fillLight.shadow.camera.far = 30;
        fillLight.shadow.camera.left = -10;
        fillLight.shadow.camera.right = 10;
        fillLight.shadow.camera.top = 10;
        fillLight.shadow.camera.bottom = -10;
        
        this.scene.add(fillLight);
        
        // Add blue-ish rim light for highlighting edges
        const rimLight = new THREE.DirectionalLight(0xaaccff, 0.3);
        rimLight.position.set(0, 8, -15);
        this.scene.add(rimLight);
        
        // Add point lights for better illumination
        const pointLight1 = new THREE.PointLight(0xffffee, 0.6, 30, 2);
        pointLight1.position.set(-5, 8, 5);
        pointLight1.castShadow = true;
        pointLight1.shadow.mapSize.width = 1024;
        pointLight1.shadow.mapSize.height = 1024;
        pointLight1.shadow.bias = -0.0005;
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xeeeeff, 0.6, 30, 2);
        pointLight2.position.set(6, 7, -6);
        pointLight2.castShadow = true;
        pointLight2.shadow.mapSize.width = 1024;
        pointLight2.shadow.mapSize.height = 1024;
        pointLight2.shadow.bias = -0.0005;
        this.scene.add(pointLight2);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add floor to the scene
    createFloor() {
        // Use texture manager's floor material
        const floorMaterial = this.textureManager ? 
            this.textureManager.getFloorMaterial() : 
            new THREE.MeshPhongMaterial({
                color: 0xccccdd,
                side: THREE.DoubleSide,
            });
        
        // Create a larger floor
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Add a subtle glow plane just above the floor
        const glowGeometry = new THREE.PlaneGeometry(BOARD_WIDTH * 1.5, BOARD_HEIGHT * 1.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xaabbff,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
        glowPlane.rotation.x = -Math.PI / 2;
        glowPlane.position.y = -0.48;
        this.scene.add(glowPlane);
    }

    // Add subtle axis lines for orientation
    addAxisLines() {
        const axisLength = BOARD_WIDTH * 0.6;
        const axisWidth = 0.05;
        
        // X-axis (red)
        const xGeometry = new THREE.BoxGeometry(axisLength, axisWidth, axisWidth);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff6666, transparent: true, opacity: 0.3 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.position.y = -0.48;
        this.scene.add(xAxis);
        
        // Z-axis (blue)
        const zGeometry = new THREE.BoxGeometry(axisWidth, axisWidth, axisLength);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x6666ff, transparent: true, opacity: 0.3 });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.position.y = -0.48;
        this.scene.add(zAxis);
    }

    adjustZoom(factor) {
        this.camera.position.multiplyScalar(factor);
        this.controls.update();
    }
}