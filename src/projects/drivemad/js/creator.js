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
    let editMode = false;
    let editIndex = -1;

    function initEvents() {
        // Añadir al document los elementos necesarios para crear un circuito

        const divControls = document.createElement("div");
        divControls.classList.add("controls-div");
        divControls.addEventListener("click", handleControlsClick);
        divControls.innerHTML = `
            <div class="controls-zoom">
                <button class="controls-button" id="btnZoomOut">−</button>
                <button class="controls-button" id="btnZoomReset">Zoom</button>
                <button class="controls-button" id="btnZoomIn">+</button>
            </div>
            <div class="controls-primary">
                <div class="controls-primary-left">
                    <ul class="controls-segment-list"></ul>
                </div>
                <div class="controls-primary-right">
                    <div class="controls-create-circuit">
                        <button class="controls-button" id="btnCreateCircuit">Create circuit</button>
                        <input class="controls-input" type="number" placeholder="Angle (degrees)" min="0" max="360"/>
                        <input class="controls-input" type="number" placeholder="Circuit width (px)" min="0"/>
                        <input class="controls-input" type="number" placeholder="Edges width (px)" min="0"/>
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
                <div class="controls-output-multiline">This is the output box, if there is a problem it will be displayed here.</div>
            </div>
            <div class="controls-tertiary">
                <button class="controls-button" id="btnImport">
                    <img src="/icons/download-icon.svg" alt="Import icon" class="controls-button-icon"/>
                    Import
                </button>
                <button class="controls-button" id="btnExport">
                    <img src="/icons/upload-icon.svg" alt="Export icon" class="controls-button-icon"/>
                    Export
                </button>
                <button class="controls-button" id="btnSubmit">
                    <img src="/icons/send-icon.svg" alt="Submit icon" class="controls-button-icon"/>
                    Submit the circuit
                </button>
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
        else if (target.id === "btnImport") onImportButtonClick();
        else if (target.id === "btnExport") onExportButtonClick();
        else if (target.id === "btnSubmit") onSubmitButtonClick();
    }

    function onCreateCircuitButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        if (circuit && !editMode) outDiv.textContent = "You have already created the circuit definition. Start adding segments.";
        else {
            const angle = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(1)").value);
            const circuitWidth = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(2)").value);
            const lineWidth = parseFloat(document.querySelector(".controls-create-circuit input:nth-of-type(3)").value);

            if (angle === undefined || angle === null || isNaN(angle) || angle < 0 || angle >= 360) outDiv.textContent = "Please, enter the angle of the start point. It must be between 0 (included) and 360 (excluded).";
            else if (!circuitWidth || circuitWidth <= 0) outDiv.textContent = "Please, enter the width of the circuit. It must be greater than 0.";
            else if (!lineWidth || lineWidth <= 0) outDiv.textContent = "Please, enter the width of the edges of the circuit. It must be greater than 0.";
            else {
                if (editMode) {
                    document.querySelector(".controls-div").querySelectorAll("input").forEach(input => input.disabled = false);
                    document.querySelector(".controls-div").querySelectorAll("button").forEach(button => button.disabled = false);

                    circuit.setStartPoint(100, 100, angle);
                    circuit.circuitWidth = circuitWidth;
                    circuit.lineWidth = lineWidth;
                    circuit.recalculateSegments();

                    outDiv.textContent = "Circuit initial arguments updated successfully.";
                    editItemInSegmentList(`Initial args (A: ${circuit.startPoint.direction}º, CW: ${circuit.circuitWidth}px, EW: ${circuit.lineWidth}px)`, editIndex);
                    editMode = false;
                    editIndex = -1;
                    
                    const button = document.querySelector(".controls-create-circuit button");
                    button.textContent = button.textContent.replace("Edit", "Create");
                }
                else {
                    circuit = new Circuit(circuitWidth, lineWidth);
                    circuit.setStartPoint(100, 100, angle);
                    outDiv.textContent = "Circuit created successfully. You can now add segments.";
                    addItemToSegmentList(`Initial args (A: ${circuit.startPoint.direction}º, CW: ${circuit.circuitWidth}px, EW: ${circuit.lineWidth}px)`);
                }
                draw();
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
                if (editMode) {
                    document.querySelector(".controls-div").querySelectorAll("input").forEach(input => input.disabled = false);
                    document.querySelector(".controls-div").querySelectorAll("button").forEach(button => button.disabled = false);

                    circuit.segments[editIndex - 1].data.length = length;
                    circuit.recalculateSegments();

                    outDiv.textContent = "Straight line updated successfully.";
                    editItemInSegmentList(`Straight line (L: ${length}px)`, editIndex);
                    editMode = false;
                    editIndex = -1;

                    const button = document.querySelector(".controls-straight-line button");
                    button.textContent = button.textContent.replace("Edit", "Add");
                }
                else {
                    circuit.addSegment(circuit.straightLine(length));
                    outDiv.textContent = "Straight line added successfully.";
                    addItemToSegmentList(`Straight line (L: ${length}px)`);
                }
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

            if (!radius || (radius - circuit.circuitWidth / 2) <= 0) outDiv.textContent = "Please, enter the radius of the arc. It must be greater than " + (circuit.circuitWidth/2).toFixed(2) + "px.";
            else if (angle === undefined || angle === null || isNaN(angle) || angle === 0 || angle <= -360 || angle >= 360) outDiv.textContent = "Please, enter the angle of the arc. It must be between -360 (excluded) and 360 (excluded).\nIt cannot be 0 either.";
            else {
                if (editMode) {
                    document.querySelector(".controls-div").querySelectorAll("input").forEach(input => input.disabled = false);
                    document.querySelector(".controls-div").querySelectorAll("button").forEach(button => button.disabled = false);

                    circuit.segments[editIndex - 1].data.radius = radius;
                    circuit.segments[editIndex - 1].data.angle = angle;
                    circuit.recalculateSegments();

                    outDiv.textContent = "Arc updated successfully.";
                    editItemInSegmentList(`Arc (R: ${radius}px, A: ${angle}º)`, editIndex);
                    editMode = false;
                    editIndex = -1;

                    const button = document.querySelector(".controls-arc button");
                    button.textContent = button.textContent.replace("Edit", "Add");
                }
                else {
                    circuit.addSegment(circuit.arc(radius, angle));
                    outDiv.textContent = "Arc added successfully.";
                    addItemToSegmentList(`Arc (R: ${radius}px, A: ${angle}º)`);
                }
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
        
        const text = document.createElement("label");
        text.classList.add("controls-segment-list-item-text");
        text.textContent = item;
        li.appendChild(text);

        const editButton = document.createElement("button");
        editButton.classList.add("controls-segment-list-item-button");
        editButton.classList.add("controls-segment-list-item-button-edit");
        editButton.addEventListener("click", onEditButtonClick);
        li.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("controls-segment-list-item-button");
        deleteButton.classList.add("controls-segment-list-item-button-delete");
        deleteButton.addEventListener("click", onDeleteButtonClick);
        li.appendChild(deleteButton);

        ul.appendChild(li);
        ul.scrollTop = ul.scrollHeight;
    }

    function editItemInSegmentList(item, index) {
        const ul = document.querySelector(".controls-segment-list");
        const li = ul.children[index];
        li.querySelector(".controls-segment-list-item-text").textContent = item;
    }

    function onEditButtonClick(event) {
        const outDiv = document.querySelector(".controls-output-multiline");

        const target = event.target;
        const li = target.parentElement;
        const ul = li.parentElement;
        const index = Array.from(ul.children).indexOf(li); // Índice del elemento en la lista

        // Desactivamos todos los inputs y botones
        document.querySelector(".controls-div").querySelectorAll("input").forEach(input => input.disabled = true);
        document.querySelector(".controls-div").querySelectorAll("button").forEach(button => button.disabled = true);

        // Activamos los inputs necesarios y el botón de actualización
        if (index === 0) {
            const inputAngle = document.querySelector(".controls-create-circuit input:nth-of-type(1)");
            inputAngle.disabled = false;
            inputAngle.value = circuit.startPoint.direction;

            const inputCircuitWidth = document.querySelector(".controls-create-circuit input:nth-of-type(2)");
            inputCircuitWidth.disabled = false;
            inputCircuitWidth.value = circuit.circuitWidth;

            const inputLineWidth = document.querySelector(".controls-create-circuit input:nth-of-type(3)");
            inputLineWidth.disabled = false;
            inputLineWidth.value = circuit.lineWidth;

            const button = document.querySelector(".controls-create-circuit button");
            button.disabled = false;
            button.textContent = button.textContent.replace("Create", "Edit");
        }
        else {
            const segment = circuit.segments[index - 1];
            if (segment.type === 'straight') {
                const input = document.querySelector(".controls-straight-line input");
                input.disabled = false;
                input.value = segment.data.length;

                const button = document.querySelector(".controls-straight-line button");
                button.disabled = false;
                button.textContent = button.textContent.replace("Add", "Edit");
            }
            else if (segment.type === 'arc') {
                const inputRadius = document.querySelector(".controls-arc input:nth-of-type(1)");
                inputRadius.disabled = false;
                inputRadius.value = segment.data.radius;
                
                const inputAngle = document.querySelector(".controls-arc input:nth-of-type(2)");
                inputAngle.disabled = false;
                inputAngle.value = segment.data.angle;
                
                const button = document.querySelector(".controls-arc button");
                button.disabled = false;
                button.textContent = button.textContent.replace("Add", "Edit");
            }
        }
        
        outDiv.textContent = "Edit the values and click on the edit button to update it.";
        editMode = true;
        editIndex = index;

        invokeHandleHeight();
        return;
    }

    function onDeleteButtonClick(event) {
        const outDiv = document.querySelector(".controls-output-multiline");

        const target = event.target;
        const li = target.parentElement;
        const ul = li.parentElement;
        const index = Array.from(ul.children).indexOf(li); // Índice del elemento en la lista

        // Si se intenta borrar uno de los 3 primeros elementos (Dirección, ancho y grosor del circuito), no se puede borrar
        if (index === 0) outDiv.textContent = "You cannot delete the circuit definition.";
        else {
            const segmentIndex = index - 1; // Índice del segmento en el array de segmentos
            circuit.segments.splice(segmentIndex, 1);
            ul.removeChild(li);

            circuit.recalculateSegments();
            outDiv.textContent = "Segment deleted successfully.";
            draw();
        }

        invokeHandleHeight();
        return;
    }

    function onImportButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        const element = document.createElement('input');
        element.setAttribute('type', 'file');
        element.setAttribute('accept', '.json');
        element.style.display = 'none';
        
        element.addEventListener('change', function() {
            const file = element.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
                try {
                    const data = JSON.parse(reader.result);
                    document.querySelector(".controls-segment-list").innerHTML = "";
                    circuit = new Circuit(data.circuitWidth, data.lineWidth);
                    circuit.setStartPoint(data.startPoint.coords.x, data.startPoint.coords.y, data.startPoint.direction);
                    addItemToSegmentList(`Initial args (A: ${circuit.startPoint.direction}º, CW: ${circuit.circuitWidth}px, EW: ${circuit.lineWidth}px)`);

                    for (let i = 0; i < data.segments.length; i++) {
                        const segment = data.segments[i];
                        if (segment.type === 'straight') {
                            const length = segment.data.length;
                            circuit.addSegment(circuit.straightLine(length));
                            addItemToSegmentList(`Straight line (L: ${length}px)`);
                        }
                        else if (segment.type === 'arc') {
                            const radius = segment.data.radius;
                            const angle = segment.data.angle;
                            circuit.addSegment(circuit.arc(radius, angle));
                            addItemToSegmentList(`Arc (R: ${radius}px, A: ${angle}º)`);
                        }
                    }

                    outDiv.textContent = "Circuit imported successfully.";
                    draw();
                }
                catch (error) {
                    document.querySelector(".controls-segment-list").innerHTML = "";
                    outDiv.textContent = "There was an error importing the circuit.";
                }
                invokeHandleHeight();
            };
        });

        element.addEventListener("cancel", function() {
            outDiv.textContent = "Circuit import canceled.";
            invokeHandleHeight();
        });

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        return;
    }

    function onExportButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");

        if (!circuit) outDiv.textContent = "There is no circuit to export.";
        else {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(circuit)));
            element.setAttribute('download', "circuit.json");
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            outDiv.textContent = "Circuit exported successfully.";
        }
        
        invokeHandleHeight();
        return;
    }

    function onSubmitButtonClick() {
        const outDiv = document.querySelector(".controls-output-multiline");
        
        if (!circuit) outDiv.textContent = "There is no circuit to submit.";
        else {
            const dialog = document.createElement("dialog");
            dialog.classList.add("creator-dialog");
            dialog.innerHTML = `
                <form method="dialog" class="creator-dialog-form" id="creatorDialogForm">
                    <input class="controls-input" id="yourName" type="text" placeholder="Your name" required/>
                    <input class="controls-input" id="circuitName" type="text" placeholder="Circuit name" required/>
                    <input class="controls-input" id="circuitLocation" type="text" placeholder="Location of the circuit (optional)"/>
                    <input class="controls-input" id="circuitLength" type="number" placeholder="Real length of the circuit (m) (optional)"/>
                    <div class="creator-dialog-buttons">
                        <button class="controls-button" id="btnCancelDialog">
                            <img src="/icons/close-icon.svg" alt="Close icon" class="controls-button-icon"/>
                            Cancel
                        </button>
                        <button class="controls-button" id="btnSubmitDialog" type="submit">
                            <img src="/icons/send-icon.svg" alt="Submit icon" class="controls-button-icon"/>
                            <span id="creatorDialogSubmitText">Submit</span>
                        </button>
                    </div>
                </form>
            `;
            document.body.appendChild(dialog);
            dialog.showModal();

            dialog.querySelector("#creatorDialogForm").addEventListener("submit", function(event) {
                event.preventDefault();

                const name = dialog.querySelector("#yourName").value;
                const circuitName = dialog.querySelector("#circuitName").value;
                const location = dialog.querySelector("#circuitLocation").value;
                const length = dialog.querySelector("#circuitLength").value;

                if (name && circuitName) {
                    const data = {
                        userName: name,
                        circuitName: circuitName,
                        circuitLocation: location,
                        circuitLength: length,
                        circuit: circuit
                    };
                    
                    fetch("https://sauleteh.gayofo.com/api/drivemad/circuit-upload", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }).then(response => {
                        if (response.status === 200) {
                            outDiv.textContent = "Circuit submitted successfully.";
                            dialog.close();
                            invokeHandleHeight();
                        }
                        else dialog.querySelector("#creatorDialogSubmitText").textContent = "Error, retry";
                    }).catch(error => {
                        console.error(error);
                        dialog.querySelector("#creatorDialogSubmitText").textContent = "Error, retry";
                    });
                }

                return;
            });

            dialog.querySelector("#btnCancelDialog").addEventListener("click", function(event) {
                event.preventDefault();

                outDiv.textContent = "Circuit submission canceled.";
                dialog.close();

                invokeHandleHeight();
                return;
            });
        }

        return;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawCircuit() {
        if (!circuit) return;

        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];

            if (segment.type === 'straight') {
                const calculatedSin = segment.data.widthSin * circuit.circuitWidth / 2;
                const calculatedCos = segment.data.widthCos * circuit.circuitWidth / 2;
                
                ctx.strokeStyle = "green";
                ctx.lineWidth = circuit.lineWidth;
                ctx.beginPath();
                ctx.moveTo(
                    segment.data.start.x - calculatedSin + camera.x,
                    segment.data.start.y + calculatedCos + camera.y
                );
                ctx.lineTo(
                    segment.data.end.x - calculatedSin + camera.x,
                    segment.data.end.y + calculatedCos + camera.y
                );
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(
                    segment.data.start.x + calculatedSin + camera.x,
                    segment.data.start.y - calculatedCos + camera.y
                );
                ctx.lineTo(
                    segment.data.end.x + calculatedSin + camera.x,
                    segment.data.end.y - calculatedCos + camera.y
                );
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
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius - circuit.circuitWidth / 2,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius + circuit.circuitWidth / 2,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();

                ctx.strokeStyle = "gray";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    6, 0, 2 * Math.PI
                );
            }
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(
                segment.ref.coords.x + camera.x,
                segment.ref.coords.y + camera.y,
                6, 0, 2 * Math.PI
            );
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

        let coords;
        if (circuit.segments.length === 0 && circuit.startPoint) coords = circuit.startPoint.coords;
        else if (circuit.segments.length > 0) coords = circuit.segments[circuit.segments.length - 1].ref.coords;
        else return; // No hay segmentos ni punto de inicio
        
        camera.x = -coords.x + (canvas.width / (2 * scale));
        camera.y = -coords.y + (canvas.height / (2 * scale));
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

    // Escribir en el medio del canvas al entrar en el creador que se tiene que crear el circuito
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("Create the circuit to show it here", canvas.width / 2, canvas.height / 2);
};
document.addEventListener('DOMContentLoaded', handler);