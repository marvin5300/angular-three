import { gl_item } from "./gl_item";
import * as THREE from 'three';

interface moon_options {
    surface: {
        size: number,
        material: {
            bumpScale: number,
            specular: THREE.Color,
            shininess: number
        },
        textures: {
            map: string,
            bumpMap: string
        }
    }
}

export class moon extends gl_item {
    moon_object: THREE.Object3D = new THREE.Object3D();

    constructor(private radius: number, private position: THREE.Vector3) {
        super();
    }
    public add(scene: THREE.Scene): void {
        this.moon_object = this.createPlanet({
            surface: {
                size: this.radius,
                material: {
                    bumpScale: 5,
                    specular: new THREE.Color('grey'),
                    shininess: 0
                },
                textures: {
                    // map: 'assets/textures/8081_earthlights10k.jpg',
                    map: 'assets/textures/moonmap4k.jpg',
                    bumpMap: 'assets/textures/moonbump4k.jpg'
                }
            }
        });
        this.moon_object.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.moon_object);
    }
    // Planet Proto
    public planetProto = {
        sphere: (radius: number) => {
            let sphere = new THREE.SphereGeometry(radius, 32, 32);

            return sphere;
        },
        material: (options: any) => {
            return new THREE.MeshPhongMaterial(options);
        },
        texture: (material: THREE.MeshPhongMaterial, property: string, uri: string) => {
            let textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                uri,
                (texture: THREE.Texture) => {
                    switch (property) {
                        case 'map':
                            material.map = texture;
                            break;
                        case 'alphaMap':
                            material.alphaMap = texture;
                            break;
                        case 'bumpMap':
                            material.bumpMap = texture;
                            break;
                        case 'specularMap':
                            material.specularMap = texture;
                            break;
                    }
                    material.needsUpdate = true;
                }
            );
        }
    };

    private createPlanet(options: moon_options): THREE.Object3D {
        // Create the planet's Surface
        let surfaceGeometry = this.planetProto.sphere(options.surface.size);
        let surfaceMaterial = this.planetProto.material(options.surface.material);
        let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

        // Nest the planet's Surface and Atmosphere into a planet object
        let planet = new THREE.Object3D();
        surface.name = 'surface';
        planet.add(surface);

        // Load the Surface's textures
        let surfaceProperty: keyof typeof options.surface.textures;
        for (surfaceProperty in options.surface.textures) {
            this.planetProto.texture(
                surfaceMaterial,
                surfaceProperty,
                options.surface.textures[surfaceProperty]
            );
        }

        return planet;
    };

    // Marker Proto
    private markerProto = {
        latLongToVector3: function latLongToVector3(latitude: number, longitude: number, radius: number, height: number) {
            var phi = (latitude) * Math.PI / 180;
            var theta = (longitude - 180) * Math.PI / 180;

            var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
            var y = (radius + height) * Math.sin(phi);
            var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

            return new THREE.Vector3(x, y, z);
        },
        marker: function marker(size: number, color: THREE.Color, vector3Position: THREE.Vector3) {
            let markerGeometry = new THREE.SphereGeometry(size);
            let markerMaterial = new THREE.MeshLambertMaterial({
                color: color
            });
            let markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
            markerMesh.position.copy(vector3Position);

            return markerMesh;
        }
    }

    // Place Marker
    private placeMarker(object: THREE.Object3D, options: any): void {
        let position = this.markerProto.latLongToVector3(options.latitude, options.longitude, options.radius, options.height);
        let marker = this.markerProto.marker(options.size, options.color, position);
        object.add(marker);
    }

    public render(width: number, height: number): void {
    }
}