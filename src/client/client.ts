import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DHtransformation, drawCoord } from './coordinate'
import createFloor from './floor'
import { GUI } from 'dat.gui'
import { addManipulatorJoint } from './manipulator_body'

let DHparam = [
    [0, Math.PI/2, 0, 0.785],
    [2, 0, 0, 0.524]
]

let params = { q: [0, 0] }
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
    render()
}

function render() {
    renderer.render(scene, camera)
}

const gui = new GUI()

// transformations.push(H)
function calcTransformation(params: any, DHparam: any) {
    let transformations = [];
    let H = new THREE.Matrix4()
    drawCoord(scene, H)
    let tmp = H;
    for (let i = 0; i < DHparam.length; i++) {
        let K = DHtransformation(DHparam[i][0], DHparam[i][1], DHparam[i][2], DHparam[i][3], rho[i], params.q[i], tmp)
        tmp = K;
        transformations.push(K)

        let K_group = drawCoord(scene, K)
        // const Coord = gui.addFolder('Coordinate' + i)

        // Coord.add(K_group, 'visible')
    }
    return transformations
}

let transformations = calcTransformation(params, DHparam)
addManipulatorJoint(transformations, scene)
createFloor(scene, 8)

const configVar = gui.addFolder("Configuration Variable");
Object.keys(params.q).forEach((key) => {
    configVar.add(params.q, key, -Math.PI, Math.PI, 0.0001).onChange((val) => {
        scene.remove.apply(scene, scene.children);
        transformations = calcTransformation(params, DHparam)
        addManipulatorJoint(transformations, scene)
        createFloor(scene, 8)
        render()
    })

});

animate()
