import {
    TorusGeometry,
    MeshPhongMaterial,
    Mesh,
} from 'three';

export class Donut {
    constructor(info) {
        const container = info.container;

        this.x = info.x || 0;
        this.y = info.y || 0;
        this.z = info.z || 0;

        this.geometry = new TorusGeometry(0.8, 0.5, 16, 100);
        this.material = new MeshPhongMaterial({ color: 0xffc107 });

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = info.name;
        this.mesh.path = info.path;
        this.mesh.track = info.track;
        this.mesh.num = info.num;
        this.mesh.genre = info.genre;

        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        container.add(this.mesh);
    }
}