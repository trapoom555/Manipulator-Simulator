import * as THREE from 'three'

export function addManipulatorJoint(transformations: Array<THREE.Matrix4>, scene: THREE.Scene) {
    for(let i = 0; i < transformations.length; i++) {
        const geometry = new THREE.CylinderGeometry( 0.2, 0.2, 0.1, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        const cylinder = new THREE.Mesh( geometry, material );
        cylinder.material.transparent = true;
        cylinder.material.opacity = 0.5

        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.extractRotation(transformations[i]);
        cylinder.setRotationFromMatrix(rotationMatrix)
        cylinder.rotateX(Math.PI / 2)

        cylinder.position.setFromMatrixPosition(transformations[i])
        scene.add( cylinder );
    }
}