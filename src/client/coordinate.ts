import * as THREE from 'three'

export function drawCoord(scene: THREE.Scene, H: THREE.Matrix4) {
    let xAxis = new THREE.Vector3();
    let yAxis = new THREE.Vector3();
    let zAxis = new THREE.Vector3();
    let origin = new THREE.Vector3();

    // extract orientation
    H.extractBasis(xAxis, yAxis, zAxis)

    // extract position
    origin.setFromMatrixPosition(H)

    // x axis
    const xAxisObj = new THREE.ArrowHelper( xAxis, origin, 1, "#ff0000" );
    // y axis
    const yAxisObj = new THREE.ArrowHelper( yAxis, origin, 1, "#00ff00" );
    // z axis
    const zAxisObj = new THREE.ArrowHelper( zAxis, origin, 1, "#0000ff" );

    const group = new THREE.Group();
    group.add(xAxisObj);
    group.add(yAxisObj);
    group.add(zAxisObj);

    scene.add(group)

    return group
}

export function DHtransformation(a: number, alpha: number, d: number, theta: number, rho: boolean, q: number, H:THREE.Matrix4) {
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
    if(rho == true) {
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

    return K
}