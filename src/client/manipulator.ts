import * as THREE from 'three'
import { GUI } from 'dat.gui'
import createFloor from './floor';

export class Manipulator {
    // Numerical
    DHparams: number[][];
    rho: boolean[];
    q: number[];
    framesTransformation: THREE.Matrix4[];
    jointFrameTransformation: THREE.Matrix4[];
    Hne: THREE.Matrix4;

    // Graphical
    scene: THREE.Scene;
    coordinateFramesUI: THREE.Group[];

    // GUI
    gui: GUI;
    guiFolder: GUI[];
    isDrawCoord: boolean[];
    isDrawJoint: boolean[];
    isDrawLink: boolean[];
    isDrawGripper: { Gripper: true };

    constructor(DHparams: number[][], rho: boolean[], Hne: THREE.Matrix4, scene: THREE.Scene) {
        // Numerical
        this.DHparams = DHparams;
        this.rho = rho;
        this.q = Array<number>(this.rho.length).fill(0);
        this.framesTransformation = [new THREE.Matrix4()]; // Base Frame
        this.Hne = Hne;
        this.jointFrameTransformation = [...this.framesTransformation]
        this.calcAllTransformations()

        // Graphical
        this.scene = scene;
        this.coordinateFramesUI = [];

        // GUI
        this.gui = new GUI();
        this.guiFolder = [];
        this.isDrawCoord = Array<boolean>(this.jointFrameTransformation.length + 1).fill(true);
        this.isDrawJoint = Array<boolean>(this.jointFrameTransformation.length - 1).fill(true);
        this.isDrawLink = Array<boolean>(this.jointFrameTransformation.length - 1).fill(true);
        this.isDrawGripper = { Gripper: true };
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

            this.jointFrameTransformation.push(K.clone())
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
        let last = this.framesTransformation[this.framesTransformation.length - 1].clone();
        let Hne_glob = new THREE.Matrix4();
        Hne_glob = this.Hne.clone().premultiply(last);
        this.framesTransformation.push(Hne_glob);
    }

    // Draw Zone

    draw() {
        createFloor(this.scene, 8);
        this.drawCoord();
        this.drawManipulatorJoint();
        this.drawJointFromHome();
        this.drawManipulatorLink();
        if (this.isDrawGripper.Gripper) {
            this.drawGripper();
        }
    }

    drawCoord() {
        for (let i = 0; i < this.framesTransformation.length; i++) {
            if (this.isDrawCoord[i]) {
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
    }

    drawManipulatorJoint() {
        for (let i = 1; i < this.jointFrameTransformation.length; i++) {
            if (this.isDrawJoint[i - 1]) {
                let geometry;
                if (this.rho[i - 1] == true) {
                    if (this.q[i - 1] >= 0) {
                        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32, undefined, undefined, Math.PI / 2, this.q[i - 1] - 2 * Math.PI);
                    }
                    else {
                        geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32, undefined, undefined, Math.PI / 2, 2 * Math.PI + this.q[i - 1]);
                    }

                }
                else {
                    geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                }
                const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.material.transparent = true;
                mesh.material.opacity = 0.5

                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.extractRotation(this.jointFrameTransformation[i]);
                mesh.setRotationFromMatrix(rotationMatrix)
                mesh.rotateX(Math.PI / 2)

                mesh.position.setFromMatrixPosition(this.jointFrameTransformation[i])
                this.scene.add(mesh);
            }

        }

    }

    drawJointFromHome() {
        for (let i = 1; i < this.jointFrameTransformation.length; i++) {
            let color, mesh, geometry, material;

            if (this.q[i - 1] < 0) {
                color = 0xFF0000;
            }
            else {
                color = 0x00FF00;
            }
            if (this.rho[i - 1] == true) {
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32, undefined, undefined, Math.PI / 2, this.q[i - 1]);
                material = new THREE.MeshBasicMaterial({ color: color });
                mesh = new THREE.Mesh(geometry, material);
                mesh.material.transparent = true;
                mesh.material.opacity = 0.7
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.extractRotation(this.jointFrameTransformation[i]);
                mesh.setRotationFromMatrix(rotationMatrix)
                mesh.rotateX(Math.PI / 2)

                mesh.position.setFromMatrixPosition(this.jointFrameTransformation[i])
            }
            else {
                let start = new THREE.Vector3().setFromMatrixPosition(this.jointFrameTransformation[i]);
                let end = new THREE.Vector3().setFromMatrixPosition(this.framesTransformation[i]);
                if (this.q[i - 1] < 0) {
                    color = 0xFF0000;
                }
                else {
                    color = 0x00FF00;
                }
                mesh = this.cylinderMesh(start, end, color)
            }

            this.scene.add(mesh);
        }
    }

    cylinderMesh(pointX: THREE.Vector3, pointY: THREE.Vector3, color = 0x5B5B5B) {
        // edge from X to Y
        var direction = new THREE.Vector3().subVectors(pointY, pointX);
        const material = new THREE.MeshBasicMaterial({ color: color });
        // Make the geometry (of "direction" length)
        var geometry = new THREE.CylinderGeometry(0.1, 0.1, direction.length(), 6, 4, true);
        // shift it so one end rests on the origin
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, direction.length() / 2, 0));
        // rotate it the right way for lookAt to work
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        // Make a mesh with the geometry
        var mesh = new THREE.Mesh(geometry, material);
        // Position it where we want
        mesh.position.copy(pointX);
        // And make it point to where we want
        mesh.lookAt(pointY);

        mesh.material.transparent = true;
        mesh.material.opacity = 0.7


        return mesh;
    }

    drawManipulatorLink() {
        for (let i = 1; i < this.framesTransformation.length - 1; i++) {
            if (this.isDrawLink[i - 1]) {
                let start, end;

                let invFrameTransformation = this.framesTransformation[i].clone()
                invFrameTransformation.invert();

                start = new THREE.Vector3().setFromMatrixPosition(this.framesTransformation[i]);
                if (i < this.framesTransformation.length - 2) {
                    end = new THREE.Vector3().setFromMatrixPosition(this.jointFrameTransformation[i + 1]);
                }
                else {
                    end = new THREE.Vector3().setFromMatrixPosition(this.framesTransformation[i + 1]);
                }


                let vec_i_pov = end.applyMatrix4(invFrameTransformation);

                // Link X Direction
                let vX = new THREE.Vector3(vec_i_pov.x, 0, 0).applyMatrix4(this.framesTransformation[i]);
                let cylinderX = this.cylinderMesh(start, vX);
                this.scene.add(cylinderX);
                // Link Y Direction
                let vY = new THREE.Vector3(vec_i_pov.x, vec_i_pov.y, 0).applyMatrix4(this.framesTransformation[i]);
                let cylinderY = this.cylinderMesh(vX, vY);
                this.scene.add(cylinderY);
                // Link Z Direction
                let vZ = new THREE.Vector3(vec_i_pov.x, vec_i_pov.y, vec_i_pov.z).applyMatrix4(this.framesTransformation[i]);
                let cylinderZ = this.cylinderMesh(vY, vZ);
                this.scene.add(cylinderZ);
            }
        }

    }

    drawGripper() {
        const geometry_base = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const material = new THREE.MeshBasicMaterial({ color: 0xF8C8DC });
        let base = new THREE.Mesh(geometry_base, material);

        const geometry_grip = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        let left = new THREE.Mesh(geometry_grip, material);
        left.rotateY(Math.PI / 2)
        left.translateX(0.15)
        left.translateZ(0.15)
        base.add(left)

        let right = new THREE.Mesh(geometry_grip, material);
        right.rotateY(Math.PI / 2)
        right.translateX(-0.15)
        right.translateZ(0.15)
        base.add(right)

        base.applyMatrix4(this.framesTransformation[this.framesTransformation.length - 1])

        base.material.transparent = true;
        base.material.opacity = 0.8;

        this.scene.add(base)

    }

    // GUI Zone
    addGUI() {
        const configVarFolder = this.gui.addFolder("Configuration Variable");
        const showFolder = this.gui.addFolder("Show/ Hide");
        this.guiFolder = [showFolder, configVarFolder]

        this.configVarGUI(configVarFolder);
        this.isDrawCoordGUI(showFolder);
        this.isDrawJointGUI(showFolder);
        this.isDrawLinkGUI(showFolder);
        showFolder.add(this.isDrawGripper, 'Gripper').onChange((val) => {
            this.scene.remove.apply(this.scene, this.scene.children);
            this.draw();
        })

        configVarFolder.open()

    }

    configVarGUI(folder: GUI) {
        Object.keys(this.q).forEach((key) => {
            folder.add(this.q, key, -Math.PI, Math.PI, 0.0001).onChange((val) => {
                this.scene.remove.apply(this.scene, this.scene.children);
                this.framesTransformation = [new THREE.Matrix4()];
                this.jointFrameTransformation = [...this.framesTransformation];
                this.calcAllTransformations();
                this.draw();
            })
        });
    }

    isDrawCoordGUI(folder: GUI) {
        const isDrawCoord = folder.addFolder("Frames");
        Object.keys(this.isDrawCoord).forEach((key) => {
            isDrawCoord.add(this.isDrawCoord, key).onChange((val) => {
                this.scene.remove.apply(this.scene, this.scene.children);
                this.draw();
            })
        });
    }

    isDrawJointGUI(folder: GUI) {
        const isDrawJoint = folder.addFolder("Joints");
        Object.keys(this.isDrawJoint).forEach((key) => {
            isDrawJoint.add(this.isDrawJoint, key).onChange((val) => {
                this.scene.remove.apply(this.scene, this.scene.children);
                this.draw();
            })
        });
    }

    isDrawLinkGUI(folder: GUI) {
        const isDrawLink = folder.addFolder("Links");
        Object.keys(this.isDrawLink).forEach((key) => {
            isDrawLink.add(this.isDrawLink, key).onChange((val) => {
                this.scene.remove.apply(this.scene, this.scene.children);
                this.draw();
            })
        });
    }

    removeGUIfolder() {
        for(let i=0; i < this.guiFolder.length; i++) {
            this.gui.removeFolder(this.guiFolder[i])
        }
        this.guiFolder = []
    }

    // onUpdateParam
    onUpdateParam(DHparams: number[][], rho: boolean[], Hne: THREE.Matrix4) {
        this.DHparams = DHparams;
        this.rho = rho;
        this.q = Array<number>(this.rho.length).fill(0);
        this.framesTransformation = [new THREE.Matrix4()]; // Base Frame
        this.Hne = Hne;
        this.jointFrameTransformation = [...this.framesTransformation]
        this.calcAllTransformations()
        
        this.coordinateFramesUI = [];

        // GUI
        this.isDrawCoord = Array<boolean>(this.jointFrameTransformation.length + 1).fill(true);
        this.isDrawJoint = Array<boolean>(this.jointFrameTransformation.length - 1).fill(true);
        this.isDrawLink = Array<boolean>(this.jointFrameTransformation.length - 1).fill(true);
        this.isDrawGripper = { Gripper: true };

        this.removeGUIfolder()
        this.addGUI()

        // Draw
        this.scene.remove.apply(this.scene, this.scene.children);
        this.draw();
    }

}