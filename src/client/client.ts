import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import createFloor from './floor'
import { Manipulator } from './manipulator'
import { SetUIFunction } from './ui_function'

// Robot
let DHparam = [
    [0, 1.571, 0, 0.785],
    [2, 0, 0.5, 0.524],
    [1, 0, 0, -1.571],
]

// Joint Type
let rho = [true, false, true]

// column major matrix
let HneMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 1
]

// Scene
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

// Set the initial position that the camera is looking at
controls.target.set(1.5, 0, 1)
controls.enableDamping = true
controls.dampingFactor = 0.1

// Set the initial distance between the camera and the target
camera.position.set(1.5, -3, 3)
camera.lookAt(controls.target)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

let Hne = new THREE.Matrix4().fromArray(HneMatrix)
let m = new Manipulator(DHparam, rho, Hne, scene)
new SetUIFunction(m, DHparam, rho)

m.draw()
m.addGUI()
createFloor(scene, 8)

animate()
