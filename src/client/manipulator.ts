import * as THREE from 'three'
import { GUI } from 'dat.gui'

export class Manipulator {
    // Numerical
    DHparams: number[][];
    rho: boolean[];
    q: number[];
    framesTransformation: THREE.Matrix4[];

    // Graphical
    scene: THREE.Scene;
    coordinateFramesUI: THREE.Group[];

    // GUI
    gui: GUI;

    constructor(DHparams: number[][], rho: boolean[], scene: THREE.Scene) {
        // Numerical
        this.DHparams = DHparams;
        this.rho = rho;
        this.q = Array<number>(this.rho.length).fill(0);
        this.framesTransformation = [new THREE.Matrix4()]; // Base Frame
        this.calcAllTransformations()

        // Graphical
        this.scene = scene;
        this.coordinateFramesUI = [];

        // GUI
        this.gui = new GUI();
    }

    // Calculation Zone
    calcAllTransformations() {
        for (let i = 0; i < this.DHparams.length; i++) {
            let a = this.DHparams[i][0];
            let alpha = this.DHparams[i][1];
            let d = this.DHparams[i][2];
            let theta = this.DHparams[i][3];
            let rho = this.rho[i];
            let q = this.q[i];
            let H = this.framesTransformation[i];

            let K = H.clone();
            // translate X
            var translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(a, 0, 0);
            K.multiply(translationMatrix);
            // rotate X
            var rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis(new THREE.Vector3(1, 0, 0), alpha);
            K.multiply(rotationMatrix);
            // translate Z
            var translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(0, 0, d);
            K.multiply(translationMatrix);
            // rotate Z
            var rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis(new THREE.Vector3(0, 0, 1), theta);
            K.multiply(rotationMatrix);

            // joint config
            if (rho == true) {
                // revolute joint
                var rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationAxis(new THREE.Vector3(0, 0, 1), q);
                K.multiply(rotationMatrix);
            }
            else {
                // prismatic joint
                var translationMatrix = new THREE.Matrix4();
                translationMatrix.makeTranslation(0, 0, q);
                K.multiply(translationMatrix);
            }

            // push to framesTransformation
            this.framesTransformation.push(K)
        }
    }

    // Draw Zone

    draw() {
        this.drawCoord();
        this.drawManipulatorJoint();
    }

    drawCoord() {
        for (let i = 0; i < this.framesTransformation.length; i++) {
            let H = this.framesTransformation[i];

            let xAxis = new THREE.Vector3();
            let yAxis = new THREE.Vector3();
            let zAxis = new THREE.Vector3();
            let origin = new THREE.Vector3();

            // extract orientation
            H.extractBasis(xAxis, yAxis, zAxis)

            // extract position
            origin.setFromMatrixPosition(H)

            // x axis
            const xAxisObj = new THREE.ArrowHelper(xAxis, origin, 1, "#ff0000");
            // y axis
            const yAxisObj = new THREE.ArrowHelper(yAxis, origin, 1, "#00ff00");
            // z axis
            const zAxisObj = new THREE.ArrowHelper(zAxis, origin, 1, "#0000ff");

            const group = new THREE.Group();
            group.add(xAxisObj);
            group.add(yAxisObj);
            group.add(zAxisObj);

            this.scene.add(group)
            this.coordinateFramesUI.push(group)
        }
    }

    drawManipulatorJoint() {
        for (let i = 1; i < this.framesTransformation.length; i++) {
            const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.material.transparent = true;
            cylinder.material.opacity = 0.5

            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.extractRotation(this.framesTransformation[i]);
            cylinder.setRotationFromMatrix(rotationMatrix)
            cylinder.rotateX(Math.PI / 2)

            cylinder.position.setFromMatrixPosition(this.framesTransformation[i])
            this.scene.add(cylinder);
        }
    }

    // GUI Zone
    addGUI() {
        this.configVarGUI();
    }

    configVarGUI() {
        const configVar = this.gui.addFolder("Configuration Variable");
        Object.keys(this.q).forEach((key) => {
            configVar.add(this.q, key, -Math.PI, Math.PI, 0.0001).onChange((val) => {
                this.scene.remove.apply(this.scene, this.scene.children);
                this.framesTransformation = [new THREE.Matrix4()];
                this.calcAllTransformations();
                console.log(this.framesTransformation)
                this.draw();
            })
        });
    }

}