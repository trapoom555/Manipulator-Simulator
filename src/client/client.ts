import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DHtransformation, drawCoord } from './coordinate'
import createFloor from './floor'
import { GUI } from 'dat.gui'
import { addManipulatorJoint } from './manipulator_body'
import { Manipulator } from './manipulator'

let DHparam = [
    [0, Math.PI/2, 0, 0.785],
    [2, 0, 0, 0.524]
]

let q = [0, 0]
let rho = [true, true]

const scene = new THREE.Scene()

// const camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 ); 

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
    createFloor(scene, 8)
    render()
}

function render() {
    renderer.render(scene, camera)
}

let m = new Manipulator(DHparam, rho, scene)
m.draw()
m.addGUI()

animate()
