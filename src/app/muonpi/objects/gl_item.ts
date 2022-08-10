import * as THREE from 'three';

export abstract class gl_item {
    constructor(){}
    // abstract get item(): THREE.Object3D;
    abstract add(scene: THREE.Scene): void;
    abstract render(width: number, height: number): void;
}