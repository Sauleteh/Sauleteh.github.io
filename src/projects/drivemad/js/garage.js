import { Car } from "./objects/Car.js";
import { Point } from "./objects/Point.js";
import { MenuButton } from "./objects/MenuOption.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");
    const $spriteUI = document.querySelector("#spriteUI");

    canvas.width = 960;
    canvas.height = 540;
    canvas.onselectstart = function () { return false; }  // Desactiva la selección de texto al hacer clic y arrastrar
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const cars = [
        new Car("Seot Lean", new Point(0, 0), 0,
            20, 40, "red",
            1.2, 1.5, 0.3,
            5, 4, 1.5,
            1.05, 1000
        ),
        new Car("BEMEV i7 7700K", new Point(0, 0), 0,
            20, 50, "blue",
            1.4, 1.6, 0.5,
            4, 4, 1.3,
            1.04, 850
        ),
        new Car("Ferfari Pheromosa", new Point(0, 0), 0,
            20, 40, "crimson",
            1.6, 1.8, 0.4,
            5, 3, 1.0,
            1.02, 500
        ),
        new Car("Menozda RY-7", new Point(0, 0), 0,
            20, 45, "orange",
            1.3, 1.4, 0.3,
            2, 2, 3.0,
            1.1, 1500
        )
    ];

    const size = 70;
    const buttons = [
        new MenuButton(
            canvas.width / 2 - size / 2 + canvas.width / 4,
            canvas.height / 3 - size / 2,
            size,
            size,
            () => changeActualCar(1)
        ),
        new MenuButton(
            canvas.width / 2 - size / 2 - canvas.width / 4,
            canvas.height / 3 - size / 2,
            size,
            size,
            () => changeActualCar(-1)
        )
    ];

    let actualCar = cars[0];

    function initEvents() {
        console.log("Initializing events...");

        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("mousemove", onMouseMoveListener);
    }

    function onClickListener(event) {
        const x = event.offsetX;
        const y = event.offsetY;

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.isPointInside(x, y) && button.handler !== undefined) button.handler();
        }

        draw();
    }

    function onMouseMoveListener() {
        draw();
    }

    function drawActualCar() {
        const scale = 1.6;
        ctx.fillStyle = actualCar.color;
        ctx.fillRect(
            canvas.width / 2 - actualCar.height * scale / 2,
            canvas.height / 3 - actualCar.width * scale / 2,
            actualCar.height * scale,
            actualCar.width * scale
        );

        ctx.fillStyle = "white";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            actualCar.name,
            canvas.width / 2,
            canvas.height / 5 - actualCar.width * 1.5
        );
    }

    function drawChangeCarButtons() {
        const x = event.offsetX;
        const y = event.offsetY;

        for (const button of buttons) {
            ctx.fillStyle = button.isPointInside(x, y) ? "white" : "black";
            ctx.fillRect(button.x, button.y, button.width, button.height);
        }

        ctx.drawImage(
            $spriteUI,
            square.color * 16, // Posición X del cuadrado en la imagen
            0, // Posición Y del cuadrado en la imagen
            16, // Ancho del cuadrado en la imagen
            16, // Alto del cuadrado en la imagen
            j * Constants.SQUARE_SIZE, // Posición X del cuadrado
            i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
            Constants.SQUARE_SIZE, // Ancho del cuadrado
            Constants.SQUARE_SIZE // Alto del cuadrado
        );
    }

    function drawCursor() {
        const x = event.offsetX;
        const y = event.offsetY;

        ctx.fillStyle = "red";
        ctx.fillRect(x, y, 5, 5);
    }

    /**
     * Selecciona el siguiente coche en la lista a partir del actual más un offset.
     * @param {number} offset Es el desplazamiento a aplicar al índice del coche actual.
     */
    function changeActualCar(offset) {
        const index = cars.indexOf(actualCar);
        actualCar = cars[(index + offset + cars.length) % cars.length];
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
        clearCanvas();

        drawActualCar();
        drawChangeCarButtons();
        drawCursor();
    }

    draw();
    initEvents();
};
document.addEventListener('DOMContentLoaded', handler);