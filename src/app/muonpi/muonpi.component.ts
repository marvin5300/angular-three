import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { gl_item } from './objects/gl_item';
import { earth } from './objects/earth';
import { ground } from './objects/ground';
import { detector } from './objects/detector';
import { proton } from './objects/proton';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
// import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2';
// import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader';
import { star_sphere } from './objects/star_sphere';

@Component({
  selector: 'app-muonpi',
  templateUrl: './muonpi.component.html',
  styleUrls: ['./muonpi.component.scss']
})
export class MuonpiComponent implements AfterViewInit {

  @ViewChild('canvas') private canvasRef!: ElementRef;

  private get canvas() {
    return this.canvasRef?.nativeElement;
  }

  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private controls?: OrbitControls;
  private stats!: Stats;
  private gui!: GUI;

  private clock = new THREE.Clock();

  private items: gl_item[] = [];

  resizeObservable!: Observable<Event>;

  constructor() { }

  ngOnInit() {
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeObservable.subscribe(evt => {
      this.onWindowResize();
    });
  }

  ngAfterViewInit(): void {
    this.items.push(new detector());
    this.items.push(new earth(256,256));
    this.items.push(new star_sphere());
    // this.items.push(new proton());
    this.init_scene();
    this.init_gui();
    this.add_controls();
    this.start_rendering_loop();
  }

  private init_scene(): void {

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0.0);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.autoClear = false;

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0x000104);
    // this.scene.background = new THREE.Color( 0xefd1b5 );
    // this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675);
    // this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.00025 );


    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for ( let i = 0; i < 10000; i ++ ) {

      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
    this.scene.add( particles );

    this.items.forEach((item: any) => {
      // this.scene.add(item.item);
      item.add(this.scene);
    });

    // camera fixed
    this.camera = new THREE.PerspectiveCamera(20, this.canvas.clientWidth / this.canvas.clientHeight, 1, 50000);
    this.camera.position.set(0, 700, 7000);
    this.camera.lookAt(this.scene.position);

    // light
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    this.scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( - 3, 10, - 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add( dirLight );

    // floor
    // const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.position.set(0,-50,0);
    // mesh.receiveShadow = true;
    // this.scene.add( mesh );


    // postprocessing

    const renderModel = new RenderPass(this.scene, this.camera);
    const effectBloom = new BloomPass(0.75);
    const effectFilm = new FilmPass(0.5, 0.5, 1448, 0);

    const effectFocus = new ShaderPass(FocusShader);

    // effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth * window.devicePixelRatio;
    // effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight * window.devicePixelRatio;

    this.composer = new EffectComposer(this.renderer);

    this.composer.addPass(renderModel);
    // this.composer.addPass(effectBloom);
    // this.composer.addPass(effectFilm);
    // this.composer.addPass(effectFocus);

    // stats
    this.stats = Stats();
    // for showing fps
    document.body.appendChild(this.stats.dom);

    this.onWindowResize();
  }

  private onWindowResize(): void {

    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  private render(): void {
    this.stats.update();

    this.items.forEach((item: gl_item) => {
      item.render(this.canvas.clientWidth, this.canvas.clientHeight);
    });
    // main scene

    this.renderer.setClearColor(0x000000, 0);

    this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // this.renderer.render(this.scene, this.camera);
    this.composer.render(0.01);
  }

  private start_rendering_loop(): void {
    let component: MuonpiComponent = this;

    (function render() {
      requestAnimationFrame(render);
      component.render();
    })();
  }

  private add_controls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 20000;
  }

  private init_gui(): void {

    this.gui = new GUI();

    const param = {
      'controls': true
    };

    this.gui.add(param, 'controls', { 'off': false, 'on': true }).onChange((val: boolean) => {
      switch (val) {
        case true:
          this.add_controls();
          break;
        case false:
          this.controls = undefined;
          break;
      }
    });
  }
}