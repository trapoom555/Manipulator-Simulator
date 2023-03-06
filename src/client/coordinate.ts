import * as THREE from 'three'
import { Vector3 } from 'three';

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
    const arrowXHelper = new THREE.ArrowHelper( xAxis, origin, 1, "#ff0000" );
    scene.add(arrowXHelper)
    // y axis
    const arrowYHelper = new THREE.ArrowHelper( yAxis, origin, 1, "#00ff00" );
    scene.add(arrowYHelper)
    // z axis
    const arrowZHelper = new THREE.ArrowHelper( zAxis, origin, 1, "#0000ff" );
    scene.add(arrowZHelper)


}

export function translateH(x: number, y: number, z: number, H: THREE.Matrix4) {
    return H.clone().makeTranslation(x, y, z).clone()
}

export function rotateH(rotAxis: THREE.Vector3, theta: number, H: THREE.Matrix4) {
    return H.clone().makeRotationAxis(rotAxis, theta).clone()
}