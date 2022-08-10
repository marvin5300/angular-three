
  import { gl_item } from "./gl_item";
  import * as THREE from 'three';
import { Euler, Vector3 } from "three";
  
  export class star_sphere extends gl_item{
      sphere_object: THREE.Object3D;
      stars: THREE.Mesh[] = [];

      constructor(private radius: number = 20000, private n_stars: number = 500){
          super();
          this.sphere_object = new THREE.Object3D();
      }
      public add(scene: THREE.Scene): void {
        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
        
        for (let i = 0; i < this.n_stars; i++) {
          let colorValue = null;
          const random = +(Math.random() * 10).toFixed(0);
          switch (random) {
            case 0:
            case 1:
            case 2:
            case 3:
              colorValue = 0xfcb3a9;
              break;
            case 4:
            case 5:
            case 6:
              colorValue = 0xeffffe;
              break;
            case 7:
            case 8:
            case 9:
              colorValue = 0xfff8a8;
              break;
            default:
              colorValue = 0xfafdee;
              break;
          }
          var geometry = new THREE.SphereGeometry(15, 32, 32);
          let material = new THREE.MeshBasicMaterial({
            color: colorValue,
          });
          var sphere = new THREE.Mesh(geometry, material);
          var sphere1 = new THREE.Mesh(geometry, material);
    
          // This time we give the sphere random x and y positions between -500 and 500
          sphere.position.setFromSphericalCoords(this.radius, Math.acos(1 - 2 * Math.random()), Math.random() * 2 * Math.PI);
          sphere1.position.setFromSphericalCoords(this.radius, Math.acos(1 - 2 * Math.random()), Math.random() * 2 * Math.PI);
          // sphere.position.x = Math.random() * 1000 - 500;
          // sphere.position.y = Math.random() * 1000 - 500;
    
          // sphere1.position.x = Math.random() * 1000 - 500;
          // sphere1.position.y = Math.random() * 1000 - 500;
    
          // Then set the z position to where it is in the loop (distance of camera)
          // sphere.position.z = z;
          // sphere1.position.z = z;
    
          // scale it up a bit
          // sphere.scale.x = sphere.scale.y = 2;
          // sphere1.scale.x = sphere1.scale.y = 2;
    
          //add the sphere to the scene
          this.sphere_object.add(sphere);
          this.sphere_object.add(sphere1);
          //finally push it to the stars array
          this.stars.push(sphere);
          this.stars.push(sphere1);
        }
        console.log("length", this.stars.length);
        scene.add(this.sphere_object);
      }
  
      public render(width: number, height: number): void {
      }
}  