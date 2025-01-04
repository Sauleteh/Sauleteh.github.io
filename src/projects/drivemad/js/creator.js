import { Circuit } from "./objects/Circuit.js";
import { Point } from "./objects/Point.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    let circuit = undefined;
    const camera = new Point(0, 0);
    let scale = 1;

    function initEvents() {
        // Añadir al document los elementos necesarios para crear un circuito

        const divControls = document.createElement("div");
        divControls.classList.add("controls-div");
        divControls.addEventListener("click", handleControlsClick);
        divControls.innerHTML = `
            <div class="controls-primary">
                <div class="controls-primary-left">
                    <ul class="controls-segment-list"></ul>
                </div>
                <div class="controls-primary-right">
                    <div class="controls-create-circuit">
                        <button class="controls-button" id="btnCreateCircuit">Create circuit</button>
                        <input class="controls-input" type="number" placeholder="Angle (degrees)" min="0" max="360"/>
                        <input class="controls-input" type="number" placeholder="Circuit width (px)" min="0"/>
                        <input class="controls-input" type="number" placeholder="Line width (px)" min="0"/>
                    </div>
                    <div class="controls-straight-line">
                        <button class="controls-button" id="btnStraightLine">Add straight line</button>
                        <input class="controls-input" type="number" placeholder="Length (px)" min="0"/>
                    </div>
                    <div class="controls-arc">
                        <button class="controls-button" id="btnArc">Add arc</button>
                        <input class="controls-input" type="number" placeholder="Radius (px)" min="0"/>
                        <input class="controls-input" type="number" placeholder="Angle (degrees)" min="-360" max="360"/>
                    </div>
                    <div class="controls-howtoclose">
                        <button class="controls-button" id="btnHowToClose">How to close the circuit?</button>
                        <input class="controls-input" type="number" placeholder="Iterations" min="1" value="100"/>
                    </div>
                </div>
            </div>
            <div class="controls-secondary">
                <div class="controls-output-multiline">If there is a problem, it will be displayed here.</div>
                <div class="controls-zoom">
                    <button class="controls-button" id="btnZoomOut">−</button>
                    <button class="controls-button" id="btnZoomReset">Zoom</button>
                    <button class="controls-button" id="btnZoomIn">+</button>
                </div>
            </div>
        `;

        // Añadir los elementos al document
        document.body.appendChild(divControls);
        invokeHandleHeight();
    }

    function handleControlsClick(event) {
        const target = event.target;
        if (target.id === "btnCreateCircuit") onCreateCircuitButtonClick();
        else if (target.id === "btnStraightLine") onStraightLineButtonClick();
        else if (target.id === "btnArc") onArcButtonClick();
        else if (target.id === "btnHowToClose") onHowToCloseButtonClick();
        else if (target.id === "btnZoomOut") updateScale(-0.1);
        else if (target.id === "btnZoomReset") updateScale(0);
        else if (target.id === "btnZoomIn") updateScale(0.1);
    }

    function onCreateCircuitButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        if (circuit) outDiv.textContent = "You have already created the circuit definition. Start adding segments.";
        else {
            const angle = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(1)").value);
            const circuitWidth = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(2)").value);
            const lineWidth = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(3)").value);

            if (angle === undefined || angle === null || isNaN(angle) || angle < 0 || angle >= 360) outDiv.textContent = "Please, enter the angle of the start point. It must be between 0 (included) and 360 (excluded).";
            else if (!circuitWidth || circuitWidth <= 0) outDiv.textContent = "Please, enter the width of the circuit. It must be greater than 0.";
            else if (!lineWidth || lineWidth <= 0) outDiv.textContent = "Please, enter the width of the edges of the circuit. It must be greater than 0.";
            else {
                circuit = new Circuit(circuitWidth, lineWidth);
                circuit.setStartPoint(100, 100, angle);
                outDiv.textContent = "Circuit created successfully. You can now add segments.";
                addItemToSegmentList(`Start point direction: ${circuit.startPoint.direction}º`);
                addItemToSegmentList(`Circuit width: ${circuit.circuitWidth}px`);
                addItemToSegmentList(`Edge lines width: ${circuit.lineWidth}px`);
            }
        }

        invokeHandleHeight();
        return;
    }

    function onStraightLineButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        if (!circuit) outDiv.textContent = "There is no start point to add a straight line, please create the circuit first.";
        else {
            const length = parseFloat(document.querySelector(".controls-straight-line input").value);

            if (!length || length <= 0) outDiv.textContent = "Please, enter the length of the straight line. It must be greater than 0.";
            else {
                circuit.addSegment(circuit.straightLine(length));
                outDiv.textContent = "Straight line added successfully.";
                addItemToSegmentList(`Straight line (L: ${length}px)`);
                draw();
            }
        }

        invokeHandleHeight();
        return;
    }

    function onArcButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        if (!circuit) outDiv.textContent = "There is no start point to add an arc, please create the circuit first.";
        else {
            const radius = parseFloat(document.querySelector(".controls-arc input:nth-of-type(1)").value);
            const angle = parseFloat(document.querySelector(".controls-arc input:nth-of-type(2)").value);

            if (!radius || radius <= 0) outDiv.textContent = "Please, enter the radius of the arc. It must be greater than 0.";
            else if (angle === undefined || angle === null || isNaN(angle) || angle === 0 || angle <= -360 || angle >= 360) outDiv.textContent = "Please, enter the angle of the arc. It must be between -360 (excluded) and 360 (excluded).\nIt cannot be 0 either.";
            else {
                circuit.addSegment(circuit.arc(radius, angle));
                outDiv.textContent = "Arc added successfully.";
                addItemToSegmentList(`Arc (R: ${radius}px, A: ${angle}º)`);
                draw();
            }
        }

        invokeHandleHeight();
        return;
    }

    function onHowToCloseButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");
        
        if (!circuit) outDiv.textContent = "There is no circuit to close.";
        else {
            const iterations = parseInt(document.querySelector(".controls-howtoclose input").value);

            if (!iterations || iterations <= 0) outDiv.textContent = "Please, enter the number of iterations. It must be greater than 0.";
            else outDiv.textContent = circuit.howToCloseCircuit(iterations);
        }
        
        invokeHandleHeight();
        return;
    }

    // Llamar a la función que ajusta la altura del iframe
    function invokeHandleHeight() {
        window.parent.postMessage({
            type: 'invokeHandleHeight',
            payload: null
        }, '*');
    }

    function addItemToSegmentList(item) {
        const ul = document.querySelector(".controls-segment-list");
        const li = document.createElement("li");
        li.classList.add("controls-segment-list-item");
        li.textContent = item;
        ul.appendChild(li);
        ul.scrollTop = ul.scrollHeight;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawCircuit() {
        if (!circuit) return;

        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];

            if (segment.type === 'straight') {
                ctx.strokeStyle = "green";
                ctx.lineWidth = circuit.lineWidth;
                ctx.beginPath();
                ctx.moveTo(segment.data.start.x - segment.data.widthSin + camera.x, segment.data.start.y + segment.data.widthCos + camera.y);
                ctx.lineTo(segment.data.end.x - segment.data.widthSin + camera.x, segment.data.end.y + segment.data.widthCos + camera.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(segment.data.start.x + segment.data.widthSin + camera.x, segment.data.start.y - segment.data.widthCos + camera.y);
                ctx.lineTo(segment.data.end.x + segment.data.widthSin + camera.x, segment.data.end.y - segment.data.widthCos + camera.y);
                ctx.stroke();

                ctx.strokeStyle = "gray";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(segment.data.start.x + camera.x, segment.data.start.y + camera.y);
                ctx.lineTo(segment.data.end.x + camera.x, segment.data.end.y + camera.y);
                ctx.stroke();
                ctx.strokeStyle = "rgb(0, 255, 255)";
                ctx.beginPath();
                ctx.arc((segment.data.start.x + segment.data.end.x)/2 + camera.x, (segment.data.start.y + segment.data.end.y)/2 + camera.y, 6, 0, 2 * Math.PI);
            }
            else if (segment.type === 'arc') {
                ctx.strokeStyle = "green";
                ctx.lineWidth = circuit.lineWidth;
                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, segment.data.radius - circuit.circuitWidth / 2, segment.data.startAngle, segment.data.endAngle, !segment.data.isClockwise);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, segment.data.radius + circuit.circuitWidth / 2, segment.data.startAngle, segment.data.endAngle, !segment.data.isClockwise);
                ctx.stroke();

                ctx.strokeStyle = "gray";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, segment.data.radius, segment.data.startAngle, segment.data.endAngle, !segment.data.isClockwise);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, 6, 0, 2 * Math.PI);
            }
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(segment.ref.coords.x + camera.x, segment.ref.coords.y + camera.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Dibujar línea de meta
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
            circuit.leftFinishLine.x + camera.x,
            circuit.leftFinishLine.y + camera.y
        );
        ctx.lineTo(
            circuit.rightFinishLine.x + camera.x,
            circuit.rightFinishLine.y + camera.y
        );
        ctx.stroke();
    }

    /**
     * Actualiza el valor de la escala
     * @param {number} value El valor a sumar a la escala actual. Si es 0, la escala se resetea a 1.
     */
    function updateScale(value) {
        if (value === 0) scale = 1;
        
        // Se reduce o aumenta la escala según el valor de value. Si ese value hace que la escala sea 0, se divide entre 10
        const diff = parseFloat((scale - Math.abs(value)).toFixed(2)); // Diferencia entre la escala actual y el valor absoluto de value
        if (value < 0) scale += ( diff <= 0 ? value / 10 : value ); // Si se está reduciendo la escala, se divide value entre 10 si la diferencia es menor o igual a 0
        else scale += ( diff < 0 ? value / 10 : value ); // Si se está aumentando la escala, se divide value entre 10 si la diferencia es menor a 0, no si es menor o igual a 0 ya que al aumentar la escala a 0.1, 0.1 - 0.1 es igual a 0 por lo que no se dividiría entre 10

        if (parseFloat(scale.toFixed(2)) <= 0) scale -= value / 10; // Si la escala es menor o igual a 0, se vuelve a la escala anterior

        const outDiv = document.querySelector(".controls-output-multiline");
        outDiv.textContent = `Scale updated to ${scale.toFixed(2)}.`;
        draw();
        invokeHandleHeight();
        return;
    }

    function updateCamera() {
        if (!circuit) return;

        const lastSegment = circuit.segments[circuit.segments.length - 1];
        if (!lastSegment) return; // No hay segmentos, solo el punto de inicio
        
        camera.x = -lastSegment.ref.coords.x + (canvas.width / (2 * scale));
        camera.y = -lastSegment.ref.coords.y + (canvas.height / (2 * scale));
    }

    function draw() {
        clearCanvas();
        ctx.save();
        ctx.scale(scale, scale);
        updateCamera();
        drawCircuit();
        ctx.restore();
    }

    draw();
    initEvents();
};
document.addEventListener('DOMContentLoaded', handler);