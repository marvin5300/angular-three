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
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader';
import { star_sphere } from './objects/star_sphere';
import { moon } from './objects/moon';
import { sun } from './objects/sun';

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
    // this.items.push(new ground(256,256));
    this.items.push(new earth(1000));
    this.items.push(new moon(0.2725 * 1000, new THREE.Vector3(12000, 0, 12000)));
    this.items.push(new sun());
    this.items.push(new star_sphere(20000));
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

    this.items.forEach((item: any) => {
      item.add(this.scene);
    });

    // camera fixed
    this.camera = new THREE.PerspectiveCamera(20, this.canvas.clientWidth / this.canvas.clientHeight, 300, 50000);
    this.camera.position.set(0, 7000, 7000);
    this.camera.lookAt(this.scene.position);

    // light
    // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    // hemiLight.position.set( 0, 20, 0 );
    // this.scene.add( hemiLight );


    // const hemiLuminousIrradiances = {
    //   "0.0001 lx (Moonless Night)": 0.0001,
    //   "0.002 lx (Night Airglow)": 0.002,
    //   "0.5 lx (Full Moon)": 0.5,
    //   "3.4 lx (City Twilight)": 3.4,
    //   "50 lx (Living Room)": 50,
    //   "100 lx (Very Overcast)": 100,
    //   "350 lx (Office Room)": 350,
    //   "400 lx (Sunrise/Sunset)": 400,
    //   "1000 lx (Overcast)": 1000,
    //   "18000 lx (Daylight)": 18000,
    //   "50000 lx (Direct Sun)": 50000
    // };

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.03);
    this.scene.add(ambientLight);


    // addLight(0.08, 0.8, 0.5, 0, 0, - 1000);
    // addLight(0.995, 0.5, 0.9, 5000, 5000, - 1000);


    const mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(100,32,32), new THREE.MeshBasicMaterial({}));
    mesh.position.set(20000, 0, 0);
    // floor
    // const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.position.set(0,-50,0);
    // mesh.receiveShadow = true;
    // this.scene.add( mesh );


    // postprocessing

    const renderModel = new RenderPass(this.scene, this.camera);
    const effectBloom = new BloomPass(0.74);
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
    let delta = 0;
    let clock = new THREE.Clock();
    let component: MuonpiComponent = this;
    let interval = 1 / 30;
    (function render() {
      requestAnimationFrame(render);

      delta += clock.getDelta();
      if (delta > interval) {
        // The draw or time dependent code are here
        component.render();
        delta = delta % interval;
      }
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