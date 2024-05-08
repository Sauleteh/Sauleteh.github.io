import { CircleFigure } from "./CircleFigure.js";
import { FPSControllerV2 } from "./FPSControllerV2.js";
import { RectangleFigure } from "./RectangleFigure.js";
import { Direction } from "./Direction.js";
import { Chronometer } from "./Chronometer.js";

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector("canvas.board");
    const ctx = canvas.getContext("2d");
    const chronoText = document.querySelector(".chronometer");
    const cbClickInsteadOfHolding = document.querySelector("#cbClickInsteadOfHolding");

    canvas.onselectstart = function() { return false; } // Evitar que se seleccione texto al hacer click y arrastrar
    canvas.width = 800;
    canvas.height = 600;

    const fpsController = new FPSControllerV2(60);
    const chronoObj = new Chronometer();

    let player = null;
    let isMouseDownOnPlayer = false;
    let isMouseClickOnPlayer = false;

    let enemies = [];

    let isGameOver = false;
    let isGameStarted = false;

    function initEvents() {
        stopEvents(); // Detener eventos anteriores
        console.log("Initializing events...");
        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mousemove", onMouseMove);
    }

    function stopEvents() {
        console.log("Stopping events...");
        canvas.removeEventListener("click", onClickListener);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mousemove", onMouseMove);
    }

    function onClickListener(e) {
        console.log("Click event");

        // Si se hace click en el jugador, se activa/desactiva la variable para moverlo
        if (e.button === 0 && player.isPointInside(e.offsetX, e.offsetY)) isMouseClickOnPlayer = !isMouseClickOnPlayer;
    }

    function onMouseDown(e) {
        console.log("Mouse down event");

        // Si al pulsar, el ratón está sobre el jugador, se activa la variable para moverlo
        if (e.button === 0 && player.isPointInside(e.offsetX, e.offsetY)) isMouseDownOnPlayer = true;
    }

    function onMouseUp(e) {
        console.log("Mouse up event");
        if (e.button === 0) isMouseDownOnPlayer = false;
    }

    function onMouseMove(e) {
        console.log("Mouse move event");

        if (cbClickInsteadOfHolding.checked) {
            // Al hacer click en el jugador, se mueve hacia la posición del mouse hasta que se haga otro click
            if (isMouseClickOnPlayer) {
                player.x = e.offsetX;
                player.y = e.offsetY;
                if (!isGameStarted) {
                    isGameStarted = true;
                    chronoText.textContent = "00:00";
                    chronoObj.start(setInterval(everySecond, 1000)); // Actualizar el cronómetro cada segundo (1000ms));
                }
            }
        }
        else {
            // Al mantener en el jugador, se mueve hacia la posición del mouse mientras se mantenga presionado
            if (isMouseDownOnPlayer) {
                player.x = e.offsetX;
                player.y = e.offsetY;
                if (!isGameStarted) {
                    isGameStarted = true;
                    chronoText.textContent = "00:00";
                    chronoObj.start(setInterval(everySecond, 1000)); // Actualizar el cronómetro cada segundo (1000ms));
                }
            }
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();
    }

    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.figure.color;
            ctx.fillRect(enemy.figure.x, enemy.figure.y, enemy.figure.width, enemy.figure.height);
        });
    }

    function checkCollisions() {
        enemies.forEach(enemy => {
            if (player.isCollidingWith(enemy.figure) || player.isOutOfCanvas(canvas))
            {
                console.log("Collision detected!");
                isGameOver = true;
            }
        });
    }

    function updateEnemies() {
        enemies.forEach(enemy => {
            enemy.figure.x += enemy.direction.dX;
            enemy.figure.y += enemy.direction.dY;

            if (enemy.figure.x < 0 || enemy.figure.x + enemy.figure.width > canvas.width) enemy.direction.dX *= -1;
            if (enemy.figure.y < 0 || enemy.figure.y + enemy.figure.height > canvas.height) enemy.direction.dY *= -1;
        });
    }

    function resetGame() {
        initEvents();

        isGameOver = false;
        isGameStarted = false;
        isMouseDownOnPlayer = false;
        isMouseClickOnPlayer = false;
        player = new CircleFigure(canvas.width / 2, canvas.height / 2, 40, "blue");
        enemies = [
            { figure: new RectangleFigure(100, 100, 70, 70, "red"), direction: new Direction(4, 4) },
            { figure: new RectangleFigure(100, canvas.height - 100 - 70, 70, 60, "red"), direction: new Direction(-5, -2) },
            { figure: new RectangleFigure(canvas.width - 100 - 70, 100, 35, 70, "red"), direction: new Direction(4, -3) },
            { figure: new RectangleFigure(canvas.width - 100 - 70, canvas.height - 100 - 70, 120, 20, "red"), direction: new Direction(-3, 5) }
        ];
    }

    function everySecond() {
        const msTime = chronoObj.getElapsedTime();
        const seconds = chronoObj.zeroPad(Math.floor(msTime / 1000) % 60, 2);
        const minutes = chronoObj.zeroPad(Math.floor(msTime / 1000 / 60), 2);
        chronoText.textContent = `${minutes}:${seconds}`;
    }

    function onGameOver() {
        // Al terminar, el tiempo se mostrará en milisegundos
        chronoObj.stop();
        const msTime = chronoObj.getElapsedTime();
        const miliseconds = chronoObj.zeroPad(Math.floor(msTime) % 1000, 3);
        const seconds = chronoObj.zeroPad(Math.floor(msTime / 1000) % 60, 2);
        const minutes = chronoObj.zeroPad(Math.floor(msTime / 1000 / 60), 2);
        chronoText.textContent = `${minutes}:${seconds}.${miliseconds}`;
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        
        clearCanvas();
        drawPlayer();
        drawEnemies();

        if (!isGameStarted) return;
        checkCollisions();
        if (isGameOver) { // Mientras no se juega...
            console.log("Game over!");
            onGameOver();
            resetGame();
        }
        else { // Mientras se juega...
            updateEnemies();
        }

        fpsController.updateLastTime(now);
    }

    resetGame();
    draw();
});

/** TODO list
 * - [?] PRIORITARIO: Delta time
 * - [ ] Implementar cronómetro
 * - [ ] Implementar backend
 *       - [ ] Guardar puntuaciones
 *       - [ ] Consultar puntuaciones
 * - [X] Implementar game over: Al colisionar, se muestra un mensaje de game over y se reinicia el juego (el cronómetro no se reinicia hasta que se empieza otra partida)
 * - [ ] Implementar niveles: Cada cierto tiempo, aumenta la dificultad
 * - [ ] Implementar power-ups: Al colisionar con un power-up, se obtiene un beneficio
 * - [ ] Implementar enemigos más inteligentes: Los enemigos persiguen al jugador
 * - [X] Implementar movimiento de los enemigos básico
 * - [ ] Implementar música (a medida que avanza el juego, a la música se le añaden más instrumentos)
 * - [ ] Implementar efectos visuales (ej: rastro del jugador)
 * - [ ] Implementar LocalStorage
 * - [ ] Al estar jugando, no se puede cambiar el nombre de usuario
 */