import { gl_item } from "./gl_item";
import * as THREE from 'three';

export class proton extends gl_item{

    private spriteObject: THREE.Object3D;

    constructor(){
        super();

    this.spriteObject = new THREE.Object3D();

  
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const textureLoader = new THREE.TextureLoader();

    const sprite1 = textureLoader.load( 'assets/sprites/snowflake1.png' );
    const sprite2 = textureLoader.load( 'assets/sprites/snowflake2.png' );
    const sprite3 = textureLoader.load( 'assets/sprites/snowflake3.png' );
    const sprite4 = textureLoader.load( 'assets/sprites/snowflake4.png' );
    const sprite5 = textureLoader.load( 'assets/sprites/snowflake5.png' );

    for ( let i = 0; i < 10000; i ++ ) {

      const x = Math.random() * 8000 - 4000;
      const y = Math.random() * 8000 - 4000;
      const z = Math.random() * 8000 - 4000;
      vertices.push( x, y, z );

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    let parameters = [
      [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
      [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
      [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
      [[ 0.85, 0, 0.5 ], sprite5, 8 ],
      [[ 0.80, 0, 0.5 ], sprite4, 5 ]
    ];
    let scale = 10;
    let materials: THREE.PointsMaterial[] = [];
    for ( let i = 0; i < parameters.length; i ++ ) {

      const color = parameters[ i ][ 0 ] as number[];
      const sprite = parameters[ i ][ 1 ] as THREE.Texture;
      const size = parameters[ i ][ 2 ] as number;

      materials[ i ] = new THREE.PointsMaterial( { size: size*scale, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
      materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

      const particles = new THREE.Points( geometry, materials[ i ] );

      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;

      this.spriteObject.add( particles );
    }
    //
    }

    public add(scene: THREE.Scene): void {
      
    }
    // public get item(): THREE.Object3D {
    //     return this.spriteObject;
    // }

    public render(width: number, height: number): void {
    }
}