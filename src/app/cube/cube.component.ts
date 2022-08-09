import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
import { WireframeGeometry2 } from 'three/examples/jsm/lines/WireframeGeometry2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { WireframeGeometry } from 'three';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements AfterViewInit, OnInit {

  @ViewChild('canvas') private canvasRef!: ElementRef;

  private camera!: THREE.PerspectiveCamera;
  private camera2!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private wireframe!: Wireframe;
  // private wireframe!: THREE.LineSegments;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private wireframe1!: THREE.LineSegments;
  private matLine!: LineMaterial;
  private matLineBasic!: THREE.LineBasicMaterial;
  private matLineDashed!: THREE.LineDashedMaterial;
  private stats!: Stats;
  private gui!: GUI;

  private get canvas() {
    return this.canvasRef?.nativeElement;
  }

  // viewport
  private insetWidth!: number;
  private insetHeight!: number;

  constructor() {
  }

  resizeObservable!: Observable<Event>;

  ngOnInit() {
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeObservable.subscribe(evt => {
      this.onWindowResize();
    });
  }

  ngAfterViewInit(): void {
    this.init();
    this.addLines();
    this.start_rendering_loop();
  }

  private init(): void {
    this.insetWidth = this.canvas.clientWidth / 4;
    this.insetHeight = this.canvas.clientHeight / 4;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0.0);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // this.renderer.setSize(window.innerWidth, window.innerHeight);

    // document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(- 50, 0, 50);

    this.camera2 = new THREE.PerspectiveCamera(40, 1, 1, 1000);
    this.camera2.position.copy(this.camera.position);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 10;
    this.controls.maxDistance = 500;


    // Wireframe ( WireframeGeometry2, LineMaterial )

    let icosahedron = new THREE.IcosahedronGeometry(20, 1);

    let geometry = new WireframeGeometry2(icosahedron);
    // let geometry = new THREE.WireframeGeometry(icosahedron);

    this.matLine = new LineMaterial({

      color: 0x4080ff,
      linewidth: 5, // in pixels
      //resolution:  // to be set by renderer, eventually
      dashed: false,
      opacity: 1
    });

    // this.wireframe = new THREE.LineSegments(geometry, this.matLine);
    this.wireframe = new Wireframe(geometry, this.matLine);
    this.wireframe.computeLineDistances();
    this.wireframe.scale.set(1, 1, 1);
    this.scene.add(this.wireframe);

    // Line ( THREE.WireframeGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE

    let geo = new THREE.WireframeGeometry(icosahedron);

    // this.matLineBasic = new THREE.LineBasicMaterial({ color: 0x4080ff });
    this.matLineDashed = new THREE.LineDashedMaterial({ scale: 2, dashSize: 1, gapSize: 1 });

    this.wireframe1 = new THREE.LineSegments(geo, this.matLineBasic);
    this.wireframe1.computeLineDistances();
    this.wireframe1.visible = false;
    this.scene.add(this.wireframe1);

    //

    // window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();

    this.stats = Stats();
    // for showing fps
    document.body.appendChild(this.stats.dom);

    this.initGui();
  }

  private onWindowResize(): void {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.insetWidth = window.innerHeight / 4; // square
    this.insetHeight = window.innerHeight / 4;

    this.camera2.aspect = this.insetWidth / this.insetHeight;
    this.camera2.updateProjectionMatrix();
  }


  private start_rendering_loop(): void {
    let component: CubeComponent = this;

    (function render() {
      requestAnimationFrame(render);
      component.animate();
    })();
  }

  private animate(): void {

    this.stats.update();

    // main scene

    this.renderer.setClearColor(0x000000, 0);

    this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // renderer will set this eventually
    this.matLine.resolution.set(this.canvas.clientWidth, this.canvas.clientHeight); // resolution of the viewport

    this.renderer.render(this.scene, this.camera);

    // inset scene

    this.renderer.setClearColor(0x222222, 1);

    this.renderer.clearDepth(); // important!

    this.renderer.setScissorTest(true);

    this.renderer.setScissor(20, 20, this.insetWidth, this.insetHeight);

    this.renderer.setViewport(20, 20, this.insetWidth, this.insetHeight);

    this.camera2.position.copy(this.camera.position);
    this.camera2.quaternion.copy(this.camera.quaternion);

    // renderer will set this eventually
    this.matLine.resolution.set(this.insetWidth, this.insetHeight); // resolution of the inset viewport

    this.renderer.render(this.scene, this.camera2);

    this.renderer.setScissorTest(false);
  }

  private addLines(): void {

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const vertex = new THREE.Vector3();

    for (let i = 0; i < 1500; i++) {

      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.normalize();
      vertex.multiplyScalar(450);

      vertices.push(vertex.x, vertex.y, vertex.z);

      vertex.multiplyScalar(Math.random() * 0.09 + 1);

      vertices.push(vertex.x, vertex.y, vertex.z);

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const p = [0.25, 0xff7700, 1];
    const material = new THREE.LineBasicMaterial({ color: p[1], opacity: p[2] });
    let line = new THREE.LineSegments(geometry, material);
    line.scale.x = line.scale.y = line.scale.z = p[0];
    line.userData['originalScale'] = p[0];
    line.rotation.y = Math.random() * Math.PI;
    line.updateMatrix();
    this.scene.add(line);
  }

  //

  private initGui(): void {

    this.gui = new GUI();

    const param = {
      'line type': 0,
      'width (px)': 5,
      'dashed': false,
      'dash scale': 1,
      'dash / gap': 1
    };


    this.gui.add(param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 }).onChange((val: number) => {

      switch (val) {

        case 0:
          this.wireframe.visible = true;

          this.wireframe1.visible = false;

          break;

        case 1:
          this.wireframe.visible = false;

          this.wireframe1.visible = true;

          break;

      }

    });

    this.gui.add(param, 'width (px)', 1, 10).onChange((val: number) => {

      this.matLine.linewidth = val;

    });

    this.gui.add(param, 'dashed').onChange((val: boolean) => {

      this.matLine.dashed = val;

      // dashed is implemented as a defines -- not as a uniform. this could be changed.
      // ... or THREE.LineDashedMaterial could be implemented as a separate material
      // temporary hack - renderer should do this eventually
      if (val) {
        this.matLine.defines['USE_DASH'] = "";
      } else {
        delete this.matLine.defines['USE_DASH'];
      }
      this.matLine.needsUpdate = true;

      this.wireframe1.material = val ? this.matLineDashed : this.matLineBasic;

    });

    this.gui.add(param, 'dash scale', 0.5, 1, 0.1).onChange((val: number) => {

      this.matLine.dashScale = val;
      this.matLineDashed.scale = val;

    });

    this.gui.add(param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 }).onChange((val: number) => {

      switch (val) {

        case 0:
          this.matLine.dashSize = 2;
          this.matLine.gapSize = 1;

          this.matLineDashed.dashSize = 2;
          this.matLineDashed.gapSize = 1;

          break;

        case 1:
          this.matLine.dashSize = 1;
          this.matLine.gapSize = 1;

          this.matLineDashed.dashSize = 1;
          this.matLineDashed.gapSize = 1;

          break;

        case 2:
          this.matLine.dashSize = 1;
          this.matLine.gapSize = 2;

          this.matLineDashed.dashSize = 1;
          this.matLineDashed.gapSize = 2;

          break;

      }
    });
  }
}