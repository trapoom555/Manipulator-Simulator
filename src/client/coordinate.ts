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