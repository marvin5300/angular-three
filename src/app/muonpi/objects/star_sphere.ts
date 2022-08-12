
import { gl_item } from "./gl_item";
import * as THREE from 'three';

export class star_sphere extends gl_item {
  sphere_object: THREE.Object3D;
  stars: THREE.Mesh[] = [];

  constructor(private radius: number = 2e4, private n_stars: number = 10000) {
    super();
    this.sphere_object = new THREE.Object3D();
  }
  public add(scene: THREE.Scene): void {
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.

    let geometry = new THREE.BufferGeometry();
    let vertices = [];

    for (let i = 0; i < this.n_stars; i++) {
      var vec = new THREE.Vector3();
      vec.setFromSphericalCoords(this.radius, Math.acos(1 - 2 * Math.random()), Math.random() * 2 * Math.PI);
      vertices.push(vec.x); // x
      vertices.push(vec.y); // y
      vertices.push(vec.z); // z
    }
    geometry.setAttribute('position', new THREE.Float16BufferAttribute(vertices, 3));
    let particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888 }));
    scene.add(particles);
  }

  public render(width: number, height: number): void {
  }
}  