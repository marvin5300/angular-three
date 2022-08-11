import { gl_item } from "./gl_item";
import * as THREE from 'three';
import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class detector extends gl_item {
    private matLine: LineMaterial;
    private detector_obj: THREE.Object3D;

    constructor() {
        super();
        this.matLine = new LineMaterial({
            color: 0x4080ff,
            linewidth: 5, // in pixels
            //resolution:  // to be set by renderer, eventually
            dashed: false,
            opacity: 1
        });
        this.detector_obj = new THREE.Object3D();
    }
    public add(scene: THREE.Scene): void {
        const loader = new OBJLoader();
        loader.load('assets/objects/detector_hex.obj',
            (group: THREE.Group) => {
                group.traverse((object: THREE.Object3D<THREE.Event>) => {
                    let mesh = object as THREE.Mesh;
                    if (mesh.isMesh) {
                        this.detector_obj.add(new Wireframe(new WireframeGeometry2(mesh.geometry), this.matLine));
                    }
                });
                scene.add(this.detector_obj);
            },
            (event: ProgressEvent<EventTarget>) => { },
            () => { console.log("error while loading detector"); });
    }

    public render(width: number, height: number): void {
        this.matLine.resolution.set(width, height); // resolution of the viewport
    }
}