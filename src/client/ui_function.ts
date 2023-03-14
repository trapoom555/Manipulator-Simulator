import { Manipulator } from './manipulator'
import * as THREE from 'three'

class UIFunction {
    getDHParamFromTableUI() {
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

    getRhoParamFromTableUI() {
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

    getHneParamFromTableUI() {

        let HneMatrix = Array<number>(16).fill(0);
        HneMatrix[15] = 1;

        for (let i = 0; i < 16; i++) {
            if ((i + 1) % 4 != 0) {
                let id = "Hne" + i.toString();
                console.log(id)
                let input = document.getElementById(id) as HTMLInputElement;
                HneMatrix[i] = Number(input.value);
            }
        }
        return HneMatrix
    }

    addTableRow(tableData?: number[][], isRevoluteData?: boolean[]) {

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

    deleteTableRow() {
        // delete DH Table Row
        let DHtable = document.getElementById("dh") as HTMLTableElement;
        if (DHtable.rows.length > 2) {
            DHtable.deleteRow(DHtable.rows.length - 1);
        }
        // delete rho Table Row
        let rhoTable = document.getElementById("rho") as HTMLTableElement;
        if (rhoTable.rows.length > 2) {
            rhoTable.deleteRow(rhoTable.rows.length - 1);
        }
    }
}

export class SetUIFunction {
    constructor(m: Manipulator, initDHparam: number[][], initRho: boolean[]) {
        let uiFunction = new UIFunction()
        let addRowBtn = document.getElementById("add-row-btn") as HTMLButtonElement;
        if (addRowBtn) {
            addRowBtn.addEventListener("click", function () {
                uiFunction.addTableRow();
            });
        }

        let deleteRowBtn = document.getElementById("del-row-btn") as HTMLButtonElement;
        if (deleteRowBtn) {
            deleteRowBtn.addEventListener("click", function () {
                uiFunction.deleteTableRow();
            });
        }

        let spawnRobotBtn = document.getElementById("spawn-robot") as HTMLButtonElement;
        if (spawnRobotBtn) {
            spawnRobotBtn.addEventListener("click", function () {
                let DHparam = uiFunction.getDHParamFromTableUI();
                let rho = uiFunction.getRhoParamFromTableUI();
                let HneMatrix = uiFunction.getHneParamFromTableUI();
                let Hne = new THREE.Matrix4().fromArray(HneMatrix)
                m.onUpdateParam(DHparam, rho, Hne)
            });
        }

        // Add DH-Table to UI
        for (let i = 0; i < initDHparam.length; i++) {
            uiFunction.addTableRow(initDHparam, initRho);
        }
    }
}