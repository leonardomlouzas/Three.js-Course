import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pane } from 'tweakpane';

class App {

    #threejs_ = null;
    #camera_ = null;

    #scene_ = null;
    #clock_ = null;
    #controls_ = null;

    #perspectiveCamera_ = null;
    #ortographicCamera_ = null;

    #debugParams_ = {};

    constructor() {
    }

    async initialize() {
        this.#clock_ = new THREE.Clock(true);

        window.addEventListener('resize', () => {
            this.#onWindowResize_();
        }, false);

        await this.#setupProject_();

        this.#onWindowResize_();
        this.#raf_();
    }

    async #setupProject_() {
        this.#threejs_ = new THREE.WebGLRenderer();
        this.#threejs_.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.#threejs_.domElement);

        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 1000;
        this.#perspectiveCamera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.#camera_ = this.#perspectiveCamera_;

        const w = 3;
        this.#ortographicCamera_ = new THREE.OrthographicCamera(-w * aspect, w, w, -w, near, far);

        this.#camera_.position.set(2, 1, 2);
        this.#camera_.lookAt(new THREE.Vector3(0, 0, 0));

        this.#controls_ = new OrbitControls(this.#camera_, this.#threejs_.domElement);
        this.#controls_.enableDamping = true;
        this.#controls_.target.set(0, 0, 0);

        this.#scene_ = new THREE.Scene();
        this.#scene_.background = new THREE.Color(0x000000);

        // Setup simple scene
        const light = new THREE.DirectionalLight();
        light.position.set(1, 2, 1);
        light.lookAt(new THREE.Vector3(0, 0, 0));
        this.#scene_.add(light);

        const ambientLight = new THREE.AmbientLight();
        this.#scene_.add(ambientLight);

        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(x * 2, 0, z * 2);
                this.#scene_.add(mesh);
            }
        }

        // Create debug pane
        const pane = new Pane();
        const debugUI = pane.addFolder({
            title: 'Debug',
        });

        this.#debugParams_ = {
            camera: {
                type: 'perspective',
                perspective: 'perspective',
                ortographic: 'ortographic',
            },
            fov: fov,
        };

        debugUI.addBinding(this.#debugParams_.camera, 'type', {
            options: {
                perspective: this.#debugParams_.camera.perspective,
                ortographic: this.#debugParams_.camera.ortographic,
            }
        }).on('change', (evt) => {
            if (evt.value === 'perspective') {
                this.#camera_ = this.#perspectiveCamera_;
            } else {
                this.#camera_ = this.#ortographicCamera_;
            }
        });

        debugUI.addBinding(this.#debugParams_, 'fov', { min: 0, max: 180 }).on('change', (evt) => {
            this.#perspectiveCamera_.fov = evt.value;
            this.#perspectiveCamera_.updateProjectionMatrix();
        })
    }

    #onWindowResize_() {
        const dpr = window.devicePixelRatio;
        const canvas = this.#threejs_.domElement;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        const aspect = w / h;

        this.#threejs_.setSize(w * dpr, h * dpr, false);
        this.#perspectiveCamera_.aspect = aspect;
        this.#perspectiveCamera_.updateProjectionMatrix();

        this.#camera_.left = -3 * aspect;
        this.#camera_.right = 3 * aspect;
        this.#ortographicCamera_.updateProjectionMatrix();

    }

    #raf_() {
        requestAnimationFrame((t) => {
            this.#step_(this.#clock_.getDelta());
            this.#render_();
            this.#raf_();
        });
    }

    #render_() {
        this.#threejs_.render(this.#scene_, this.#camera_);
    }

    #step_(timeElapsed) {
        this.#ortographicCamera_.position.copy(this.#perspectiveCamera_.position);
        this.#ortographicCamera_.quaternion.copy(this.#perspectiveCamera_.quaternion);
    }
}


const APP_ = new App();

window.addEventListener('DOMContentLoaded', async () => {
    await APP_.initialize();
});
