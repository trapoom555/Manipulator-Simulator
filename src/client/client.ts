import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import createFloor from './floor'
import { Manipulator } from './manipulator'

// Robot
let DHparam = [
    [0, Math.PI/2, 0, 0.785],
    [2, 0, 0.5, 0.524],
    [1, 0, 0, 0],
]
let rho = [true, false, true]

let HneMatrix = [1, 0, 0, 1,
                 0, 1, 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1]

let Hne = new THREE.Matrix4().fromArray(HneMatrix)
// Scene
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
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
    createFloor(scene, 8)
    render()
}

function render() {
    renderer.render(scene, camera)
}

let m = new Manipulator(DHparam, rho, Hne, scene)
m.draw()
m.addGUI()

animate()
