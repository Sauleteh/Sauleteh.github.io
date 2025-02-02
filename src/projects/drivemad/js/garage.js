import { MenuButton, MenuImage } from "./objects/MenuObjects.js";
import { STORAGE_KEYS, CARS } from "./objects/Constants.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");
    const $spriteUI = document.querySelector("#spriteUI");

    canvas.width = 960;
    canvas.height = 540;
    canvas.onselectstart = function () { return false; }  // Desactiva la selección de texto al hacer clic y arrastrar
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const size = 50;
    const buttons = [
        new MenuButton(
            canvas.width / 2 - size / 2 + canvas.width / 4,
            canvas.height / 3 - size / 2,
            size,
            size,
            () => changeActualCar(1),
            new MenuImage(0, 0, 16, 16, "spriteUI")
        ),
        new MenuButton(
            canvas.width / 2 - size / 2 - canvas.width / 4,
            canvas.height / 3 - size / 2,
            size,
            size,
            () => changeActualCar(-1),
            new MenuImage(16, 0, 16, 16, "spriteUI")
        )
    ];

    let actualCar = CARS[0];

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

    function stringToVariable(string) {
        switch (string) {
            case "spriteUI": return $spriteUI;
            default: return undefined;
        }
    }

    function drawActualCar() {
        const scale = 3;

        ctx.drawImage(
            stringToVariable(actualCar.image.sprite),
            actualCar.image.x, // Posición X del coche en la imagen
            actualCar.image.y, // Posición Y del coche en la imagen
            actualCar.image.width, // Ancho del coche en la imagen
            actualCar.image.height, // Alto del coche en la imagen
            canvas.width / 2 - actualCar.height * scale / 2, // Posición X del coche
            canvas.height / 3 - actualCar.width * scale / 2, // Posición Y del coche
            actualCar.height * scale, // Ancho del coche
            actualCar.width * scale // Alto del coche
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

            ctx.drawImage(
                stringToVariable(button.image.sprite),
                button.image.x, // Posición X del cuadrado en la imagen
                button.image.y, // Posición Y del cuadrado en la imagen
                button.image.width, // Ancho del cuadrado en la imagen
                button.image.height, // Alto del cuadrado en la imagen
                button.x, // Posición X del cuadrado
                button.y, // Posición Y del cuadrado
                button.width, // Ancho del cuadrado
                button.height // Alto del cuadrado
            );
        }
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
        const currentIndex = CARS.findIndex(car => car.name === actualCar.name);
        const newIndex = (currentIndex + offset + CARS.length) % CARS.length;
        actualCar = CARS[newIndex];
        localStorage.setItem(STORAGE_KEYS.ACTUAL_CAR_INDEX, newIndex);
    }

    function restoreLocalStorage() {
        if (localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX) !== null) {
            const index = parseInt(localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX));
            actualCar = CARS[index];
        }
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

    restoreLocalStorage();
    draw();
    initEvents();
};
document.addEventListener('DOMContentLoaded', handler);

/** TODO list:
 * - [ ] Mostrar más información de los coches, en forma de barras o numéricamente.
 * - [ ] Añadir más coches.
 * - [ ] ¿Coche custom?
 * - [ ] Dejar más bonito el garaje.
 */