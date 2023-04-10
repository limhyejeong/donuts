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

        this._clickedDonut = false;
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
            1000
        );

        camera.position.set(0, 7, 5);
        this._camera = camera;
    }

    _setupLight() {
        const defaultLight = new THREE.DirectionalLight(0x111111, 1);
        defaultLight.position.set(0, 5, 0);
        defaultLight.castShadow = true;
        defaultLight.shadow.mapSize.set(50, 50);

        const directionalLight = new THREE.PointLight(0x000000, 0.5, 25);
        directionalLight.position.set(0, 20, -10);

        this._pinkLight = new THREE.PointLight(0xffeb3b, 1, 80);
        this._pinkLight.position.set(15, 5, 10);
        // this._pinkLight.castShadow = true;

        this._scene.add(defaultLight, directionalLight, this._pinkLight)
    }

    _setupModel() {
        const donut1 = new Donut({
            name: 'donut1', x: 2, y: 1, z: -2,
            path: '/data/Squirm Worm.mp3',
            track: 'On The Rocks',
            num: 1, genre: 'Jazz/Blues',
            container: this._scene
        });
        const donut2 = new Donut({
            name: 'donut2', x: -2, y: 1, z: -2,
            path: '/data/Squirm Worm.mp3',
            track: 'On The Rocks',
            num: 1, genre: 'Jazz/Blues',
            container: this._scene
        });
        const donut3 = new Donut({
            name: 'donut3', x: 2, y: 1, z: 2,
            path: '/data/Squirm Worm.mp3',
            track: 'On The Rocks',
            num: 1, genre: 'Jazz/Blues',
            container: this._scene
        });
        const donut4 = new Donut({
            name: 'donut4', x: -2, y: 1, z: 2,
            path: '/data/Squirm Worm.mp3',
            track: 'On The Rocks',
            num: 1, genre: 'Jazz/Blues',
            container: this._scene
        });

        this._donuts = [donut1, donut2];

        // 바닥
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100),
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
        this._songInformation = document.querySelector('#song-information');
        this._trackInformation = this._songInformation.querySelector('.information')

        this._trackDetial = document.querySelector('#trackDetial');
        const backBtn = this._trackDetial.querySelector('.backBtn')

        backBtn.addEventListener('click', () => {
            this.closeDetail();
        })
    }

    _setupEvents() {
        window.onresize = this.resize.bind(this);
        this.resize();

        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        const preventDragClick = new PreventDragClick(this._divContainer);

        // 도넛 호버 이벤트
        this._divContainer.addEventListener('mousemove', e => {
            if (!this._clickedDonut) {
                this.checkRaycaster(e)
                this.hoverDonut();
            }
        });

        // 도넛 클릭 이벤트
        this._divContainer.addEventListener('click', e => {
            if (preventDragClick.mouseMoved) return; // 드래그 방지
            if (this._clickedDonut) return; // 중복클릭 방지
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
                document.body.style.cursor = 'pointer';
                this._newObject = item.object;
                this.turnOn(item.object)
                this.setInformation(item.object);
                this._lastObject = this._newObject;
            } else {
                document.body.style.cursor = 'auto'
            }
            break;
        }
    }

    clickDonut() {
        if (this._lastObject) this.turnOff(this._lastObject);
        document.body.style.cursor = 'auto'

        const intersects = this._raycaster.intersectObjects(this._scene.children);

        for (const item of intersects) {
            if (item.object.name.indexOf('donut')) break;
            this.turnOff(item.object);
            this.setInformation(item.object)
            this._clickedDonut = true;

            gsap.to(
                item.object.rotation,
                {
                    duration: 1,
                    ease: Power4,
                    y: Math.PI * 3
                }
            );

            setTimeout(() => {
                gsap.to(
                    this._camera.position,
                    {
                        duration: 1,
                        x: item.object.position.x,
                        y: item.object.position.y + 3,
                        z: item.object.position.z,
                    }
                );

                gsap.to(
                    this._orbitControls.target,
                    {
                        duration: 1,
                        x: item.object.position.x,
                        z: item.object.position.z,
                    }
                );

                gsap.to(
                    this._pinkLight.position,
                    {
                        duration: 1,
                        ease: Power3,
                        x: -this._pinkLight.position.x,
                        z: -this._pinkLight.position.z
                    }
                );
            }, 1000)

            setTimeout(() => {
                this.openDetail(item.object);
                item.object.rotation.y = Math.PI;
            }, 2000)
            break;
        }
    }

    setInformation(mesh) {
        this._trackInformation.innerHTML = `
        <div>Track: ${mesh.track}</div>
        <div>No: ${mesh.num}/31</div>
        <div>Genre: ${mesh.genre}</div>`;
    }
    outInformation() {
        this._trackInformation.innerHTML = `
        <div>Track: No track selected</div>
        <div>No: 00/31</div>
        <div>Genre: No track selected</div>`;
    }

    openDetail(mesh) {
        this.musicPlay(mesh);
        this._trackDetial.classList.remove('hide')
    }

    musicPlay(mesh) {
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load(mesh.path, (buffer) => {
            const listener = new THREE.AudioListener();
            this._audio = new THREE.PositionalAudio(listener);
            this._audio.setBuffer(buffer);
            if (!this._audio.isPlaying) this._audio.play();
        })
    }

    closeDetail() {
        if (this._audio.isPlaying) this._audio.stop();
        this._trackDetial.classList.add('hide')

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

        gsap.to(
            this._pinkLight.position,
            {
                duration: 1,
                ease: Power3,
                x: -this._pinkLight.position.x,
                z: -this._pinkLight.position.z
            }
        );

        setTimeout(() => {
            this._clickedDonut = false;
            this.outInformation()
        }, 1000);
    }

    turnOn(donut) {
        gsap.to(
            donut.rotation,
            {
                duration: 0.8,
                x: Math.PI / 1.4
            }
        );

    }

    turnOff(donut) {
        gsap.to(
            donut.rotation,
            {
                duration: 0.8,
                x: Math.PI / 2
            }
        );
        this.outInformation()
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