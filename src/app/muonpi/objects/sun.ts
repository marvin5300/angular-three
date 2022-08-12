import { gl_item } from "./gl_item";
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

export class sun extends gl_item {
    sun_object: THREE.Object3D = new THREE.Object3D();

    constructor(private position: THREE.Vector3 = new THREE.Vector3(20000, 0, 0), private radius: number = 30) {
        super();
    }
    public add(scene: THREE.Scene): void {
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(this.position.x, this.position.y, this.position.z);
        this.sun_object.add(dirLight);


        let textureLoader = new THREE.TextureLoader();
        const textureFlare0 = textureLoader.load('assets/textures/lensflare0.png');
        const textureFlare3 = textureLoader.load('assets/textures/lensflare3.png');

        let addLight = (h: number, s: number, l: number, x: number, y: number, z: number) => {
            const light = new THREE.PointLight(0xffffff, 1.5, 20000);
            light.color.setHSL(h, s, l);
            light.position.set(x, y, z);

            const lensflare = new Lensflare();
            lensflare.addElement(new LensflareElement(textureFlare0, 120, 0, light.color));
            //   lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
            //   lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
            //   lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
            //   lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
            lensflare.position.set(0, 20, 0);
            light.add(lensflare);
            this.sun_object.add(light);
        }

        addLight(0.1, 0.7, 0.5, 20000, 0, 0);

        // let sun_light = new THREE.Mesh(new THREE.SphereBufferGeometry(this.radius, 6, 8), new THREE.MeshStandardMaterial({
        //   emissive: 0xffffee,
        //   emissiveIntensity: 1,
        //   color: 0x000000})
        // );
        // sun_light.position.set(0,0,0);
        // this.sun_object.add(sun_light);
        scene.add(this.sun_object);
    }

    public render(): void {
    }
}