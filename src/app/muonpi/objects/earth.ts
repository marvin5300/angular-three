import { gl_item } from "./gl_item";
import * as THREE from 'three';

interface earth_options {
    surface: {
        size: number,
        material: {
            bumpScale: number,
            specular: THREE.Color,
            shininess: number
        },
        textures: {
            map: string,
            bumpMap: string,
            specularMap: string
        }
    },
    atmosphere: {
        size: number
        material: {
            opacity: number
        },
        textures: {
            map: string,
            // alphaMap: string
        },
        glow: {
            size: number,
            intensity: number,
            fade: number,
            color: number
        }
    }
}

export class earth extends gl_item {
    earth_object: THREE.Object3D = new THREE.Object3D();

    constructor(private radius: number) {
        super();
    }
    public add(scene: THREE.Scene): void {
        this.earth_object = this.createPlanet({
            surface: {
                size: this.radius,
                material: {
                    bumpScale: 5,
                    specular: new THREE.Color('grey'),
                    shininess: 0
                },
                textures: {
                    // map: 'assets/textures/8081_earthlights10k.jpg',
                    map: 'assets/textures/8081_earthmap10k.jpg',
                    bumpMap: 'assets/textures/8081_earthbump10k.jpg',
                    specularMap: 'assets/textures/8081_earthspec10k.jpg'
                }
            },
            atmosphere: {
                size: 0.3,
                material: {
                    opacity: 1
                },
                textures: {
                    map: 'assets/textures/earthclouds.png'//,
                    // map: 'assets/textures/earthclouds_night.png'//,
                    // alphaMap: 'assets/textures/earthcloudmaptrans.jpg'
                },
                glow: {
                    size: 15,
                    intensity: 0.1,
                    fade: 7,
                    color: 0x93cfef
                }
            },
        });
        this.earth_object.rotateZ(-23.5 * Math.PI / 180);
        scene.add(this.earth_object);
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
        glowMaterial: (intensity: number, fade: number, color: number) => {
            // Custom glow shader from https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
            let glowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    'c': {
                        value: intensity
                    },
                    'p': {
                        value: fade
                    },
                    glowColor: {
                        value: new THREE.Color(color)
                    },
                    viewVector: {
                        value: new THREE.Vector3(0, 0, 1)
                    }
                },
                vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`
                ,
                fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`
                ,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            return glowMaterial;
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

    private createPlanet(options: earth_options): THREE.Object3D {
        // Create the planet's Surface
        let surfaceGeometry = this.planetProto.sphere(options.surface.size);
        let surfaceMaterial = this.planetProto.material(options.surface.material);
        let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

        // Create the planet's Atmosphere
        let atmosphereGeometry = this.planetProto.sphere(options.surface.size + options.atmosphere.size);
        let atmosphereMaterialDefaults = {
            side: THREE.DoubleSide,
            transparent: true
        }
        let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
        let atmosphereMaterial = this.planetProto.material(atmosphereMaterialOptions);
        let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

        // Create the planet's Atmospheric glow
        let atmosphericGlowGeometry = this.planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
        let atmosphericGlowMaterial = this.planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
        let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

        // Nest the planet's Surface and Atmosphere into a planet object
        let planet = new THREE.Object3D();
        surface.name = 'surface';
        atmosphere.name = 'atmosphere';
        atmosphericGlow.name = 'atmosphericGlow';
        planet.add(surface);
        planet.add(atmosphere);
        planet.add(atmosphericGlow);

        // Load the Surface's textures
        let surfaceProperty: keyof typeof options.surface.textures;
        for (surfaceProperty in options.surface.textures) {
            this.planetProto.texture(
                surfaceMaterial,
                surfaceProperty,
                options.surface.textures[surfaceProperty]
            );
        }

        // Load the Atmosphere's texture
        let atmosphereProperty: keyof typeof options.atmosphere.textures;
        for (atmosphereProperty in options.atmosphere.textures) {
            this.planetProto.texture(
                atmosphereMaterial,
                atmosphereProperty,
                options.atmosphere.textures[atmosphereProperty]
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