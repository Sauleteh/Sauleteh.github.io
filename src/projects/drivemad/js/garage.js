import { MenuButton, MenuImage } from "./objects/MenuObjects.js";
import { STORAGE_KEYS, CARS } from "./objects/Constants.js";
import { FPSControllerV2 } from "./objects/FPSControllerV2.js";
import { Point } from "./objects/Point.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");
    const $spriteUI = document.querySelector("#spriteUI");

    canvas.width = 960;
    canvas.height = 540;
    canvas.onselectstart = function () { return false; }  // Desactiva la selección de texto al hacer clic y arrastrar
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const fpsController = new FPSControllerV2(60);
    const mousePos = new Point(0, 0);
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
    let carAngle = 0;

    function initEvents() {
        console.log("Initializing events...");

        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("mousemove", onMouseMoveListener);
    }

    function onClickListener(event) {
        mousePos.x = event.offsetX;
        mousePos.y = event.offsetY;

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.isPointInside(mousePos.x, mousePos.y) && button.handler !== undefined) button.handler();
        }
    }

    function onMouseMoveListener(event) {
        mousePos.x = event.offsetX;
        mousePos.y = event.offsetY;
    }

    function rotateCar() {
        carAngle = (carAngle + 1 * fpsController.deltaTime) % 360;
    }

    function stringToVariable(string) {
        switch (string) {
            case "spriteUI": return $spriteUI;
            default: return undefined;
        }
    }

    function drawActualCar() {
        const scale = 3;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 3);
        ctx.rotate(carAngle * Math.PI / 180);
        ctx.drawImage(
            stringToVariable(actualCar.image.sprite),
            actualCar.image.x, // Posición X del coche en la imagen
            actualCar.image.y, // Posición Y del coche en la imagen
            actualCar.image.width, // Ancho del coche en la imagen
            actualCar.image.height, // Alto del coche en la imagen
            -actualCar.height * scale / 2, // Posición X del coche
            -actualCar.width * scale / 2, // Posición Y del coche
            actualCar.height * scale, // Ancho del coche
            actualCar.width * scale // Alto del coche
        );
        ctx.restore();

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

    function drawStats() {
        const stats = [{
                name: "Speed power",
                value: actualCar.speedPower,
                min: 0,
                max: 2
            }, {
                name: "Acceleration power",
                value: actualCar.accelerationPower,
                min: 1,
                max: 2
            }, {
                name: "Braking power",
                value: actualCar.brakingPower,
                min: 0,
                max: 2
            }, {
                name: "Turn force",
                value: actualCar.turnForce,
                min: 0,
                max: 10
            }, {
                name: "Drifting ability",
                value: actualCar.driftingTurnMultiplier,
                min: 1,
                max: 5
            }, {
                name: "Boost power",
                value: actualCar.boostMultiplier * actualCar.boostDuration,
                min: 0,
                max: 2000
            }
        ];

        const statSpriteOn = new MenuImage(32, 0, 48, 8, "spriteUI");
        const statSpriteOff = new MenuImage(32, 8, 48, 8, "spriteUI");

        const scale = 3;
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";

        for (let i = 0; i < stats.length; i++) {
            const fillPercentage = stats[i].value / (stats[i].min + stats[i].max); // Porcentaje al que debe estar rellenada la barra (de 0 a 1)

            const pixelsToFill = Math.round(statSpriteOn.width * fillPercentage); // Píxeles a rellenar de la barra
            const pixelsToFillOff = statSpriteOff.width - pixelsToFill; // Píxeles a no rellenar de la barra

            // Barra llenada
            ctx.drawImage(
                stringToVariable(actualCar.image.sprite),
                statSpriteOn.x, // Posición X del item en la imagen
                statSpriteOn.y, // Posición Y del item en la imagen
                pixelsToFill, // Ancho del item en la imagen
                statSpriteOn.height, // Alto del item en la imagen
                Math.floor(canvas.width / 2 + 20), // Posición X del item
                Math.floor(canvas.height / 1.9 + i * 35), // Posición Y del item
                pixelsToFill * scale, // Ancho del item en el canvas
                statSpriteOn.height * scale // Alto del item en el canvas
            );

            // El restante de la barra, sin llenarla
            ctx.drawImage(
                stringToVariable(actualCar.image.sprite),
                statSpriteOff.x + pixelsToFill, // Posición X del item en la imagen
                statSpriteOff.y, // Posición Y del item en la imagen
                pixelsToFillOff, // Ancho del item en la imagen
                statSpriteOff.height, // Alto del item en la imagen
                Math.floor(canvas.width / 2 + 20 + pixelsToFill * scale), // Posición X del item
                Math.floor(canvas.height / 1.9 + i * 35), // Posición Y del item
                pixelsToFillOff * scale, // Ancho del item en el canvas
                statSpriteOff.height * scale // Alto del item en el canvas
            );

            // Texto de la barra
            ctx.fillText(
                stats[i].name,
                canvas.width / 2 - 20,
                canvas.height / 1.9 + i * 35
            );
        }
    }

    function drawChangeCarButtons() {
        for (const button of buttons) {
            ctx.fillStyle = button.isPointInside(mousePos.x, mousePos.y) ? "white" : "black";
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
        ctx.fillStyle = "red";
        ctx.fillRect(mousePos.x, mousePos.y, 5, 5);
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

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;

        clearCanvas();
        drawActualCar();
        drawStats();
        drawChangeCarButtons();
        drawCursor();

        rotateCar();
    }

    restoreLocalStorage();
    initEvents();
    draw();
};
document.addEventListener('DOMContentLoaded', handler);

/** TODO list:
 * - [ ] Mostrar más información de los coches, en forma de barras o numéricamente.
 * - [ ] Añadir más coches.
 * - [ ] ¿Coche custom?
 * - [ ] Dejar más bonito el garaje.
 */