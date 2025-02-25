import { MenuButton, MenuImage } from "./objects/MenuObjects.js";
import { STORAGE_KEYS, CARS } from "./objects/Constants.js";
import { FPSControllerV2 } from "./objects/FPSControllerV2.js";
import { Point } from "./objects/Point.js";
import { SpriteManager } from "./objects/SpriteManager.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    canvas.onselectstart = function () { return false; }  // Desactiva la selección de texto al hacer clic y arrastrar
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const fpsController = new FPSControllerV2(60);
    const mousePos = new Point(0, 0);
    const changeCarButtonSize = 50;
    const changeColorButtonSize = 130;
    const buttons = [
        new MenuButton(
            canvas.width / 2 - changeCarButtonSize / 2 + canvas.width / 4,
            canvas.height / 3 - changeCarButtonSize / 2,
            changeCarButtonSize,
            changeCarButtonSize,
            () => changeActualCar(1),
            new MenuImage(0, 0, 16, 16, "spriteUI")
        ),
        new MenuButton(
            canvas.width / 2 - changeCarButtonSize / 2 - canvas.width / 4,
            canvas.height / 3 - changeCarButtonSize / 2,
            changeCarButtonSize,
            changeCarButtonSize,
            () => changeActualCar(-1),
            new MenuImage(16, 0, 16, 16, "spriteUI")
        ),
        new MenuButton(
            canvas.width / 2 - changeColorButtonSize / 2,
            canvas.height / 3 - changeColorButtonSize / 2,
            changeColorButtonSize,
            changeColorButtonSize,
            () => changeCarColor(),
            "transparent"
        )
    ];

    let actualCar = CARS[0];
    let actualColorShift = 0;
    let carAngle = 0;
    let hueRotation = 0; // Grados de rotación de color para las barras de estadísticas que están por encima del máximo

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

    function drawActualCar() {
        const scale = 3;

        ctx.save();
        ctx.filter = `hue-rotate(${actualColorShift}deg)`;
        ctx.translate(canvas.width / 2, canvas.height / 3);
        ctx.rotate(carAngle * Math.PI / 180);
        ctx.drawImage(
            SpriteManager.getSpriteByName(actualCar.image.sprite),
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
                name: "Max speed",
                value: actualCar.speedPower,
                min: 0.5,
                max: 2
            }, {
                name: "Acceleration",
                value: actualCar.accelerationPower,
                min: 1.1,
                max: 2
            }, {
                name: "Braking power",
                value: actualCar.brakingPower,
                min: 0,
                max: 1
            }, {
                name: "Turn force",
                value: actualCar.turnForce,
                min: 1,
                max: 8
            }, {
                name: "Drifting ability",
                value: actualCar.driftingTurnMultiplier,
                min: 1,
                max: 3
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
            const fillPercentage = (stats[i].value - stats[i].min) / (stats[i].max - stats[i].min); // Porcentaje al que debe estar rellenada la barra (de 0 a 1)
            
            // Si se excede el máximo, el color de la barra se vuelve multicolor
            if (fillPercentage > 1) ctx.filter = `hue-rotate(${hueRotation}deg)`;
            else ctx.filter = "hue-rotate(0deg)";

            const pixelsToFill = Math.round(statSpriteOn.width * fillPercentage); // Píxeles a rellenar de la barra
            const pixelsToFillOff = statSpriteOff.width - pixelsToFill; // Píxeles a no rellenar de la barra
            const center = new Point( // Centro de la estadística (label + barra)
                canvas.width / 2,
                canvas.height / 1.9 + i * 35
            );
            const offset = 20; // Separación entre la barra y el texto

            // Barra llenada
            ctx.drawImage(
                SpriteManager.getSpriteByName(statSpriteOn.sprite),
                statSpriteOn.x, // Posición X del item en la imagen
                statSpriteOn.y, // Posición Y del item en la imagen
                pixelsToFill, // Ancho del item en la imagen
                statSpriteOn.height, // Alto del item en la imagen
                Math.floor(center.x + offset), // Posición X del item
                Math.floor(center.y), // Posición Y del item
                pixelsToFill * scale, // Ancho del item en el canvas
                statSpriteOn.height * scale // Alto del item en el canvas
            );

            // El restante de la barra, sin llenarla
            ctx.drawImage(
                SpriteManager.getSpriteByName(statSpriteOff.sprite),
                statSpriteOff.x + pixelsToFill, // Posición X del item en la imagen
                statSpriteOff.y, // Posición Y del item en la imagen
                pixelsToFillOff, // Ancho del item en la imagen
                statSpriteOff.height, // Alto del item en la imagen
                Math.floor(center.x + offset + pixelsToFill * scale), // Posición X del item
                Math.floor(center.y), // Posición Y del item
                pixelsToFillOff * scale, // Ancho del item en el canvas
                statSpriteOff.height * scale // Alto del item en el canvas
            );

            // Texto de la barra
            ctx.fillText(
                stats[i].name,
                center.x - offset,
                center.y
            );
        }

        ctx.filter = "none";
    }

    function drawButtons() {
        ctx.fillStyle = "transparent";
        for (const button of buttons) {
            ctx.filter = button.isPointInside(mousePos.x, mousePos.y) ? "brightness(0.8)" : "brightness(1.0)";
            ctx.fillRect(button.x, button.y, button.width, button.height);

            if (button.image instanceof MenuImage) {
                ctx.drawImage(
                    SpriteManager.getSpriteByName(button.image.sprite),
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

        ctx.filter = "none";
    }

    function drawTips() {
        ctx.fillStyle = "lightgray";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "Tip: You can change the car color by clicking the car",
            canvas.width / 2,
            canvas.height - 30
        );
    }

    function drawCursor() {
        ctx.fillStyle = "red";
        ctx.fillRect(mousePos.x, mousePos.y, 5, 5);
    }

    function rotateCar() {
        carAngle = (carAngle + 1 * fpsController.deltaTime) % 360;
    }

    function shiftOverpoweredStatsColor() {
        hueRotation = (hueRotation - 2 * fpsController.deltaTime) % 360;
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

        actualColorShift = 0;
        localStorage.setItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT, actualColorShift);
    }

    /**
     * Cambia el color del coche actual mediante un selector de colores.
     */
    function changeCarColor() {
        actualColorShift = (actualColorShift + 24) % 360;
        localStorage.setItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT, actualColorShift);
    }

    function restoreLocalStorage() {
        if (localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX) !== null) {
            const index = parseInt(localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX));
            actualCar = CARS[index];
        }

        if (localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT) !== null) {
            actualColorShift = parseInt(localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT));
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
        drawButtons();
        drawTips();
        drawCursor();

        rotateCar();
        shiftOverpoweredStatsColor();
    }

    restoreLocalStorage();
    initEvents();
    draw();
};
document.addEventListener('DOMContentLoaded', handler);

/** TODO list:
 * - [X] Mostrar más información de los coches, en forma de barras o numéricamente.
 * - [X] Los stats no muestran bien el porcentaje, no se tiene en cuenta que si el mínimo es 1 y el stat es  1, no se haga ningún rellenado
 * - [ ] Añadir más coches.
 *     - [X] Añadirlos a la pool del garaje.
 *     - [ ] Crear sus sprites.
 * - [ ] ¿Coche custom?
 * - [X] Posibilidad de elegir color para el coche.
 * - [ ] Dejar más bonito el garaje.
 */