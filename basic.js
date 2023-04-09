import * as THREE from './build/three.module.js';
import { OrbitControls } from "./examples/jsm/controls/OrbitControls.js"
import { Donut } from './Donut.js';
import { PreventDragClick } from './PreventDragClick.js';

class App {
    constructor() {
        this._setupThreeJs();
        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();
        this._setupUI();
        this._setupEvents();
    }

    _setupThreeJs() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;
    }

    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );

        camera.position.set(0, 7, 5);
        this._camera = camera;
    }

    _setupLight() {
        const defaultLight = new THREE.DirectionalLight(0xffffff, 0.8);
        defaultLight.position.set(0, 10, 0);
        defaultLight.castShadow = true;
        defaultLight.shadow.mapSize.width = 10;
        defaultLight.shadow.mapSize.height = 10;

        const pinkLight = new THREE.PointLight(0x673ab7, 0.4);
        pinkLight.position.set(20, 30, 0);
        // pinkLight.castShadow = true;

        this._scene.add(defaultLight, pinkLight)
    }

    _setupModel() {
        const donut1 = new Donut({
            name: 'donut1', x: 2, y: 2, z: -2,
            url: 'https://www.youtube.com/embed/kNDbaYEp0tU',
            container: this._scene
        });
        const donut2 = new Donut({
            name: 'donut2', x: -2, y: 2, z: -2,
            url: 'https://www.youtube.com/embed/kNDbaYEp0tU',
            container: this._scene
        });
        const donut3 = new Donut({
            name: 'donut3', x: 2, y: 2, z: 2,
            url: 'https://www.youtube.com/embed/kNDbaYEp0tU',
            container: this._scene
        });
        const donut4 = new Donut({
            name: 'donut4', x: -2, y: 2, z: 2,
            url: 'https://www.youtube.com/embed/kNDbaYEp0tU',
            container: this._scene
        });

        this._donuts = [donut1, donut2];

        // 바닥
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500),
            new THREE.MeshStandardMaterial({ color: 0xffffff }));
        floor.name = 'floor';
        floor.receiveShadow = true;
        floor.position.y = 0;
        floor.rotation.x = -Math.PI / 2
        this._scene.add(floor);
    }

    _setupControls() {
        this._orbitControls = new OrbitControls(this._camera, this._divContainer);
    }

    _setupUI() {
        const backBtn = document.querySelector('.backBtn')
        backBtn.addEventListener('click', () => {
            this.closeInformation();
        })

        this._videoContainer = document.querySelector('#video-container');
    }

    _setupEvents() {
        window.onresize = this.resize.bind(this);
        this.resize();

        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        const preventDragClick = new PreventDragClick(this._divContainer);

        // 도넛 호버 이벤트
        this._divContainer.addEventListener('mousemove', e => {
            this.checkRaycaster(e)
            this.hoverDonut();
        });

        // 도넛 클릭 이벤트
        this._divContainer.addEventListener('click', e => {
            if (preventDragClick.mouseMoved) return; // 드래그 방지
            this.checkRaycaster(e)
            this.clickDonut();
        });

        this._clock = new THREE.Clock();
        requestAnimationFrame(this.render.bind(this));
    }


    checkRaycaster(e) {
        this._mouse.x = e.clientX / this._divContainer.clientWidth * 2 - 1;
        this._mouse.y = -(e.clientY / this._divContainer.clientHeight * 2 - 1);

        this._raycaster.setFromCamera(this._mouse, this._camera);
    }

    hoverDonut() {
        const intersects = this._raycaster.intersectObjects(this._scene.children);

        for (const item of intersects) {
            // 마지막으로 호버한 도넛이 있을 경우
            if (this._lastObject) this.turnOff(this._lastObject);

            // 마우스가 도넛 위에 올라갈 경우
            if (item.object.name.startsWith('donut')) {
                this._newObject = item.object;
                this.turnOn(item.object)
                this._lastObject = this._newObject;
            }
            break;
        }
    }

    clickDonut() {
        if (this._lastObject) this.turnOff(this._lastObject);
        // Three.js 이벤트
        const intersects = this._raycaster.intersectObjects(this._scene.children);

        for (const item of intersects) {
            if (item.object.name.indexOf('donut')) break;

            gsap.to(
                item.object.rotation,
                {
                    duration: 1,
                    ease: Power4,
                    y: Math.PI * 3
                }
            );

            this.openInfomation(item.object);

            setTimeout(() => {
                gsap.to(
                    this._camera.position,
                    {
                        duration: 0.8,
                        x: item.object.position.x,
                        y: item.object.position.y + 2,
                        z: item.object.position.z,
                    }
                );

                gsap.to(
                    this._orbitControls.target,
                    {
                        duration: 0.8,
                        x: item.object.position.x,
                        z: item.object.position.z,
                    }
                );
            }, 700)
            break;
        }
    }

    openInfomation(mesh) {
        this._videoContainer.innerHTML += `<iframe width="560" height="315" src="${mesh.url}" title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowfullscreen></iframe>`;
    }

    closeInformation() {
        this._videoContainer.innerHTML = ``;

        gsap.to(
            this._camera.position,
            {
                duration: 1,
                x: 0,
                y: 7,
                z: 5
            }
        );

        gsap.to(
            this._orbitControls.target,
            {
                duration: 1,
                x: 0,
                z: 0
            }
        );
    }

    turnOn(donut) {
        gsap.to(
            donut.rotation,
            {
                duration: 1,
                x: Math.PI / 1.5
            }
        );
    }

    turnOff(donut) {
        gsap.to(
            donut.rotation,
            {
                duration: 1,
                x: Math.PI / 2
            }
        );
    }

    update() {
        const delta = this._clock.getDelta();
        this._orbitControls.update();
    }

    render() {
        this._renderer.render(this._scene, this._camera);
        this.update();

        requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }
}

window.onload = function () {
    new App();
}