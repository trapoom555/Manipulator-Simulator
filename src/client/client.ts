import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import createFloor from './floor'
import { Manipulator } from './manipulator'

// Robot
let DHparam = [
    [0, 1.571, 0, 0.785],
    [2, 0, 0.5, 0.524],
    [1, 0, 0, -1.571],
]

// Joint Type
let rho = [true, false, true]

// column major matrix
let HneMatrix = [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 1
]

function getDHParamFromTableUI() {
    let table = document.getElementById("dh") as HTMLTableElement;
    let lastRow = table.rows.length - 1;
    let lastColumn = 4;

    let DHparam = [];
    for (let i = 0; i < lastRow; i++) {
        let tmp = []
        for (let j = 0; j < lastColumn; j++) {
            let id = i.toString() + "," + j.toString()
            let input = document.getElementById(id) as HTMLInputElement;
            tmp.push(Number(input.value))
        }
        DHparam.push(tmp)
    }
    return DHparam
}

function getRhoParamFromTableUI() {
    let table = document.getElementById("rho") as HTMLTableElement;
    let lastRow = table.rows.length - 1;
    let rho = []

    for (let i = 0; i < lastRow; i++) {
        let id = 'rho' + i.toString();
        let input = document.getElementById(id) as HTMLInputElement;
        rho.push(input.checked)
    }

    return rho
}

function addTableRow(tableData?: number[][], isRevoluteData?: boolean[]) {

    // add DH Table Row
    let DHtable = document.getElementById("dh") as HTMLTableElement;
    let lastRowIdx = DHtable.rows.length - 1;
    let row = DHtable.insertRow(-1);
    for (let i = 0; i < 4; i++) {
        let cell = row.insertCell(i);
        let id = lastRowIdx.toString() + "," + i.toString()
        let data = 0;
        if (tableData != null) {
            data = tableData[lastRowIdx][i];
        }
        cell.innerHTML = "<input id='" + id + "' value=" + data.toString() + "> </input>";
    }

    // add rho Table Row
    let rhoTable = document.getElementById("rho") as HTMLTableElement;
    row = rhoTable.insertRow(-1);
    let cell = row.insertCell(0);
    if (isRevoluteData != null) {
        if (isRevoluteData[lastRowIdx]) {
            cell.innerHTML = "<input type='checkbox' id='rho" + lastRowIdx.toString() + "' checked> </input>";
        }
        else {
            cell.innerHTML = "<input type='checkbox' id='rho" + lastRowIdx.toString() + "'> </input>";
        }
    }
    else {
        cell.innerHTML = "<input type='checkbox' id='rho" + lastRowIdx.toString() + "' checked> </input>";
    }

}

function deleteTableRow() {
    // add DH Table Row
    let DHtable = document.getElementById("dh") as HTMLTableElement;
    DHtable.deleteRow(DHtable.rows.length - 1);
    // add rho Table Row
    let rhoTable = document.getElementById("rho") as HTMLTableElement;
    rhoTable.deleteRow(rhoTable.rows.length - 1);
}


let addRowBtn = document.getElementById("add-row-btn") as HTMLButtonElement;
if (addRowBtn) {
    addRowBtn.addEventListener("click", function () {
        addTableRow();
    });
}

let deleteRowBtn = document.getElementById("del-row-btn") as HTMLButtonElement;
if (deleteRowBtn) {
    deleteRowBtn.addEventListener("click", function () {
        deleteTableRow();
    });
}

let spawnRobotBtn = document.getElementById("spawn-robot") as HTMLButtonElement;
if (spawnRobotBtn) {
    spawnRobotBtn.addEventListener("click", function () {
        DHparam = getDHParamFromTableUI();
        rho = getRhoParamFromTableUI();
        m.onUpdateParam(DHparam, rho)
    });
}


// Add DH-Table to UI
for (let i = 0; i < DHparam.length; i++) {
    addTableRow(DHparam, rho);
}


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
    // scene.remove.apply(scene, scene.children);
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
