import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import Stats from 'three/addons/libs/stats.module.js';

class App {

    #threejs_ = null;
    #camera_ = null;

    #scene_ = null;
    #clock_ = null;
    #controls_ = null;
    #stats_ = null;

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

        this.#stats_ = new Stats();
        document.body.appendChild(this.#stats_.dom);

        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 1000;
        this.#camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.#camera_.position.set(2, 1, 2);
        this.#camera_.lookAt(new THREE.Vector3(0, 0, 0));

        this.#controls_ = new OrbitControls(this.#camera_, this.#threejs_.domElement);
        this.#controls_.enableDamping = true;
        this.#controls_.target.set(0, 0, 0);

        this.#scene_ = new THREE.Scene();
        this.#scene_.background = new THREE.Color(0x000000);

        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const box = new THREE.Mesh(geo, mat);
        this.#scene_.add(box);
        const pane = new Pane();

        const PARAMNS = {
            wireframe: false,
            transparent: false,
            opacity: 1,
            color: box.material.color,
            offset2D: { x: 0, y: 0 },
            offset3D: { x: 0, y: 0, z: 0 },
        }

        const cubeFolder = pane.addFolder({ title: 'Cube' });
        cubeFolder.addBinding(PARAMNS, 'wireframe').on('change', (evt) => {
            box.material.wireframe = evt.value;
        });

        cubeFolder.addBinding(PARAMNS, 'transparent').on('change', (evt) => {
            box.material.transparent = evt.value;
            box.material.needsUpdate = true;
        });

        cubeFolder.addBinding(PARAMNS, 'opacity', { min: 0, max: 1, step: 0.1 }).on('change', (evt) => {
            box.material.opacity = evt.value;
        });

        cubeFolder.addBinding(PARAMNS, 'color', { view: 'color', color: { type: 'float' } }).on('change', (evt) => {
            let a = 0;
            box.material.color.set(evt.value);
        });

        cubeFolder.addBinding(PARAMNS, 'offset2D').on('change', (evt) => {
            box.position.set(evt.value.x, 0, evt.value.y);
        });

        cubeFolder.addBinding(PARAMNS, 'offset3D').on('change', (evt) => {
            box.position.set(evt.value.x, evt.value.y, evt.value.z);
        });
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
        this.#camera_.aspect = aspect;
        this.#camera_.updateProjectionMatrix();
    }

    #raf_() {
        requestAnimationFrame((t) => {
            this.#stats_.begin();
            this.#step_(this.#clock_.getDelta());
            this.#render_();
            this.#stats_.end();
            this.#raf_();
        });
    }

    #render_() {
        this.#threejs_.render(this.#scene_, this.#camera_);
    }

    #step_(timeElapsed) {
    }
}


const APP_ = new App();

window.addEventListener('DOMContentLoaded', async () => {
    await APP_.initialize();
});
