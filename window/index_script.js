"use strict";

Function.prototype.bindArgs = function (...boundArgs) {
    const targetThis = this;

    return function (...args) {
        return targetThis.call(this, ...boundArgs, ...args);
    }
}


function node(element) {
    this.node = element;
    this.position = { x: 550 + Math.random() * 15, y: 250 + Math.random() * 5 };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };

    this.addForce = function (x, y) {
        this.acceleration.x += x;
        this.acceleration.y += y;
    };

    this.updatePosition = function () {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.velocity.x *= C_SLOW;
        this.velocity.y *= C_SLOW;

        if (Math.abs(this.velocity.x) < ZERO_VELOCITY) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < ZERO_VELOCITY) this.velocity.y = 0;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.node.setAttribute('transform', `translate(${this.position.x},${this.position.y})`);
    };
}

function edge(from, to, direction) {
    this.from = from;
    this.to = to;
    this.direction = direction;
    this.stroke = buildStroke(from, to, direction);

    this.updatePosition = function () {
        this.stroke.setAttribute('d', `m ${from.position.x},${from.position.y} ${to.position.x - from.position.x},${to.position.y - from.position.y}`);
    }
    this.updateConnections = function () {
        this.stroke.setAttribute('class', 'stroke');

        // TODO: switch
        if (this.direction === 2) {
            this.stroke.setAttribute('style', "marker-start:url(#marker_s);marker-end:url(#marker_e)");
        } else if (this.direction === 1) {
            this.stroke.setAttribute('style', "marker-end:url(#marker_e)");
        } else if (this.direction === -1) {
            this.stroke.setAttribute('style', "marker-start:url(#marker_s)");
        } else { // direction === 0
            this.stroke.setAttribute('class', 'stroke hidden');
        }
    }
}

function insertMatrixContainer({ nodesSize, matrixForm, edges }) {
    // insert legend
    for (let i = 0; i < nodesSize; i++) {
        matrixForm.insertAdjacentHTML('beforeend', `<span class="legend horizontal">${i + 1} </span>`);
    }

    for (let i = 0; i < nodesSize; i++) {
        let divMxRow = document.createElement('div');
        divMxRow.insertAdjacentHTML('afterbegin', `<span class="legend">${i + 1} </span>`);

        // insert checkboxes
        for (let j = 0; j < nodesSize; j++) {
            divMxRow.appendChild(getCheckbox(i, j, { edges, nodesSize }));
        }

        matrixForm.appendChild(divMxRow);
    }
}

function generateEdges({ nodes, nodesSize, edges, matrixForm, strokes }) {
    let matrixRows = matrixForm.getElementsByTagName('div');

    for (let row = 0; row < nodesSize; row++) {
        let matrixRowInputs = matrixRows[row].getElementsByTagName('input');

        for (let col = 0; col < nodesSize; col++) {
            if (row < col)
                edges.push(new edge(nodes[row], nodes[col], 0));
        }
    }

    for (let edge of edges) {
        strokes.appendChild(edge.stroke);
        edge.updateConnections();
    }
}
function generateNodes({ nodes, nodesSize, canvas }) {
    for (let i = 0; i < nodesSize; i++) {
        let nodeImg = buildNode(i, i * 100, i * 50);
        canvas.appendChild(nodeImg);
        nodes.push(new node(nodeImg));
    }
}
function buildNode(number, x, y) {
    const svgns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(svgns, 'g');

    g.setAttribute('id', `node_${number}`);
    g.classList.add('nodeContainer')
    g.setAttribute('transform', `translate(${x},${y})`);
    g.innerHTML = `
        <circle class="node_bg" r="24" cx="0" cy="0"/>
        <circle class="node_colored" r="24" cx="0" cy="0"/>
        <circle class="node node_colored" r="24" cx="0" cy="0"/>
        <text class="label" x="0" y="10">${number + 1}</text>`;

    return g;
}

function buildStroke(from, to, direction) {
    let svgns = "http://www.w3.org/2000/svg";
    let path = document.createElementNS(svgns, 'path');

    path.setAttribute('d', `m ${from.position.x},${from.position.y} ${to.position.x - from.position.x},${to.position.y - from.position.y}`);
    return path;
}

function getCheckbox(i, j, { edges, nodesSize }) {
    let label = document.createElement('label');
    let checkbox = document.createElement('input');

    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', `${i}_${j}`);
    checkbox.setAttribute('name', `${i}_${j}`);;
    checkbox.onclick = checkboxChange.bindArgs({ edges, nodesSize });

    label.appendChild(checkbox);

    label.classList.add('checkbox_container')

    return label
}

function showResults(result_str) {
    results.innerHTML = '';

    const components = result_str.scc
        .split('\n')
        .map(str => str.trim())
        .filter(x => x);

    const components_html = components
        .map(
            comp => comp.split(' ')
                .map(vert => `<span class="scc_vertice">${vert}</span>`)
                .join(' ')
        )
        .map(comp => `<div class"scc_container"><p class="scc">${comp}</p></div>`)
        .join('\n');

    const head = `<label>Число компонент<br>сильной связности: ${components.length}</label>\n`;

    results.innerHTML = head + components_html;
}

function checkboxChange({ edges, nodesSize }) {
    results.innerHTML = '';

    let [v1, v2] = this.id.split("_");
    v1 = parseInt(v1);
    v2 = parseInt(v2);

    if (v1 == v2) return;

    let edge = getEdge(v1, v2, { edges, nodesSize });

    if (this.checked) {
        if (edge.direction == 0) {
            if (v1 < v2) {
                edge.direction = 1;
            } else if ((v1 > v2)) {
                edge.direction = -1;
            }
            edge.stroke.classList.remove("hidden");
            edge.updateConnections();
        } else {
            edge.direction = 2;
            edge.updateConnections();
        }
    } else {
        if (edge.direction == 2) {
            if (v1 < v2) {
                edge.direction = -1;
            } else if ((v1 > v2)) {
                edge.direction = 1;
            }
            edge.updateConnections();
        } else {
            edge.direction = 0;
            edge.stroke.classList.add('hidden');
        }
    }
}

function getUnusedEdgesOffset(i) {
    return (i + 2) * (i + 1) / 2;
}
function getEdge(i, j, { edges, nodesSize }) {
    if (i < j)
        [i, j] = [j, i]

    return edges[nodesSize * j + i - getUnusedEdgesOffset(j)];
}

function shake(nodes) {
    const SHAKE = 40;

    event.preventDefault();
    for (const node of nodes) {
        node.velocity.x = Math.random() * SHAKE - (SHAKE / 2);
        node.velocity.y = Math.random() * SHAKE - (SHAKE / 2);
    }
}

function calculateForces(edges) {
    const PULL_HAS_EDGE = 2;
    const STASIS_DISTANCE_HAS_EDGE = document.getElementById("sliderDistHasEdge").value || 220;
    const PULL_NO_EDGE = 1.5;
    const STASIS_DISTANCE_NO_EDGE = document.getElementById("sliderDistNoEdge").value || 300;

    for (let edge of edges) {
        const distanceX = edge.from.position.x - edge.to.position.x;
        const distanceY = edge.from.position.y - edge.to.position.y;
        const distance = Math.sqrt((distanceX) ** 2 + (distanceY) ** 2) + Math.random() / 5;

        const PULL = edge.direction ? PULL_HAS_EDGE : PULL_NO_EDGE;
        const STASIS_DISTANCE = edge.direction ? STASIS_DISTANCE_HAS_EDGE : STASIS_DISTANCE_NO_EDGE;

        // const force = PULL * Math.log(Math.abs(distance) / STASIS_DISTANCE);
        const force = PULL * Math.log(distance / STASIS_DISTANCE);

        const forceX = force * distanceX / distance;
        const forceY = force * distanceY / distance;

        edge.from.acceleration.x -= forceX;
        edge.from.acceleration.y -= forceY;
        edge.to.acceleration.x += forceX;
        edge.to.acceleration.y += forceY;
    }
}

function animate({ nodes, nodesSize, edges }) {
    calculateForces(edges);

    for (let i = 0; i < nodesSize; i++) {
        nodes[i].addForce(nodes[i].acceleration.x, nodes[i].acceleration.y);
        nodes[i].updatePosition();
    }
    for (let edge of edges) {
        edge.updatePosition();
    }
}

function findScc(nodes) {
    event.preventDefault();

    const mx = tableToMx(nodes);

    if (!mx || mx.length < 1) return;

    const mx_str = mx
        .map(row => row.join(' '))
        .join('\n');

    const result = compute_str(mx.length + "\n" + mx_str);

    showResults(result);
}
function tableToMx(nodes) {
    const mx = [];

    for (let i = 0; i < nodes.length; i++) {
        const row = [];

        for (let j = 0; j < nodes.length; j++) {
            const checkbox = document.getElementById(`${i}_${j}`);
            row[j] = checkbox.checked ? 1 : 0;
        }

        mx[i] = row;
    }

    return mx;
}

function shiftNodes({ nodes }, e) {
    // const isOX = e.srcElement === document.getElementById('sliderShiftOX');
    const sliderX = document.getElementById('sliderShiftOX');
    const sliderY = document.getElementById('sliderShiftOY');

    const diffX = sliderX.value - sliderX.dataset.oldX;
    const diffY = sliderY.value - sliderY.dataset.oldY;

    for (const node of nodes) {
        node.velocity.x += diffX;
        node.velocity.y += diffY;
        node.updatePosition();
    }

    this.dataset.oldX = sliderX.value;
    this.dataset.oldY = sliderY.value;

    debugger;
}

const C_SLOW = 0.7;
const ZERO_VELOCITY = 0.04;

async function main() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let nodesSize = urlParams.get('counter');
    nodesSize = nodesSize || 5;
    let counter = document.getElementById('nodesCounter');
    counter.value = nodesSize;

    let nodes = [];
    let edges = [];
    let canvas = document.getElementById('nodes');
    let strokes = document.getElementById('strokes');
    let counterForm = document.getElementById('counter');
    let matrixForm = document.getElementById('adjacencyMatrix');
    let svg = document.getElementById('graph');
    let results = document.getElementById('results');

    insertMatrixContainer({ nodesSize, matrixForm, edges });
    generateNodes({ nodes, nodesSize, canvas });
    generateEdges({ nodes, nodesSize, edges, matrixForm, strokes });

    document.getElementById('buttonCalculate').onclick = () => findScc(nodes);
    document.getElementById('buttonShake').onclick = () => shake(nodes);

    document.getElementById('sliderShiftOX').oninput = shiftNodes.bindArgs({ nodes, nodesSize });
    document.getElementById('sliderShiftOY').oninput = shiftNodes.bindArgs({ nodes, nodesSize });
    document.getElementById('sliderShiftOX').dataset.oldX = document.getElementById('sliderShiftOX').value;
    document.getElementById('sliderShiftOY').dataset.oldY = document.getElementById('sliderShiftOY').value;

    let delay = setInterval(() => animate({ nodes, nodesSize, edges }), 35);
}

main();