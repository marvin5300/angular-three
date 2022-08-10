import { gl_item } from "./gl_item";
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

export class earth extends gl_item{
    mesh?: THREE.Mesh;

    constructor(private width: number, private depth: number){
        super();
    }
    public add(scene: THREE.Scene): void {
        const data = this.generateHeight( this.width, this.depth );
        // let geometry = new THREE.PlaneGeometry( 7500, 7500, this.width - 1, this.depth - 1 );
        let geometry = new THREE.SphereBufferGeometry(1000, 20, 20);
        // geometry.rotateX( - Math.PI / 2 );
        // for ( let i = 0, j = 0, l = geometry.attributes['position'].count; i < l; i ++, j += 3 ) {
        //     geometry.attributes['position'].setY(i, data[i]*2);
        // }
        let texture = new THREE.CanvasTexture( this.generateTexture( data, this.width, this.depth ) );
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        this.mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
        scene.add(this.mesh);
    }

    public render(width: number, height: number): void {
    }


    private generateHeight( width: number, height: number ): Uint8Array {

        let seed = Math.PI / 4;
        window.Math.random = function () {

            const x = Math.sin( seed ++ ) * 10000;
            return x - Math.floor( x );

        };

        const size = width * height;
        const data = new Uint8Array( size );
        const perlin = new ImprovedNoise(), z = Math.random() * 100;

        let quality = 1;

        for ( let j = 0; j < 4; j ++ ) {

            for ( let i = 0; i < size; i ++ ) {

                const x = i % width, y = ~ ~ ( i / width );
                data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

            }

            quality *= 5;

        }

        return data;

    }

    private generateTexture( data: Uint8Array, width: number, height: number ): HTMLCanvasElement {

        let context, image, imageData, shade;

        const vector3 = new THREE.Vector3( 0, 0, 0 );

        const sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();

        const canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext( '2d' );
        context!.fillStyle = '#000';
        context!.fillRect( 0, 0, width, height );

        image = context!.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;

        for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

            vector3.x = data[ j - 2 ] - data[ j + 2 ];
            vector3.y = 2;
            vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
            vector3.normalize();

            shade = vector3.dot( sun );

            imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

        }

        context!.putImageData( image, 0, 0 );

        // Scaled 4x

        const canvasScaled = document.createElement( 'canvas' );
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;

        context = canvasScaled.getContext( '2d' );
        context!.scale( 4, 4 );
        context!.drawImage( canvas, 0, 0 );

        image = context!.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
        imageData = image.data;

        for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

            const v = ~ ~ ( Math.random() * 5 );

            imageData[ i ] += v;
            imageData[ i + 1 ] += v;
            imageData[ i + 2 ] += v;

        }

        context!.putImageData( image, 0, 0 );

        return canvasScaled;
    }

}