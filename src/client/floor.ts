import * as THREE from 'three'

export default function createFloor(scene: THREE.Scene, size: number) {
    const geometry = new THREE.PlaneGeometry( size, size, size*4, size*4 );
    const material = new THREE.MeshBasicMaterial( {color: 0x444444, side: THREE.DoubleSide, wireframe: true} );
    const plane = new THREE.Mesh( geometry, material );
    scene.add(plane);
}