import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { drawCoord, translateH, rotateH } from './coordinate'
import createFloor from './floor'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 2


const renderer = new THREE.WebGLRenderer()
const controls = new OrbitControls(camera, renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    renderer.render(scene, camera)
}

let H = new THREE.Matrix4()

drawCoord(scene, H)

let K = H.clone()
var rotationMatrix = new THREE.Matrix4();
rotationMatrix.makeRotationAxis(new THREE.Vector3(0, 0, 1), 0.8);
K.multiply(rotationMatrix);

var translationMatrix = new THREE.Matrix4();
translationMatrix.makeTranslation(1, 0, 0);
K.multiply(translationMatrix);

drawCoord(scene, K)

createFloor(scene)

animate()
