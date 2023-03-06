import * as THREE from 'three'

export default function createFloor(scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry( 5, 5, 20, 20 );
    const material = new THREE.MeshBasicMaterial( {color: 0x444444, side: THREE.DoubleSide, wireframe: true} );
    const plane = new THREE.Mesh( geometry, material );
    scene.add(plane);
}