import { CircleFigure } from "./CircleFigure.js";
import { FPSControllerV2 } from "./FPSControllerV2.js";
import { RectangleFigure } from "./RectangleFigure.js";
import { Direction } from "./Direction.js";

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector("canvas.board");
    const ctx = canvas.getContext("2d");

    const cbClickInsteadOfHolding = document.querySelector("#cbClickInsteadOfHolding");

    canvas.onselectstart = function() { return false; } // Evitar que se seleccione texto al hacer click y arrastrar
    canvas.width = 800;
    canvas.height = 600;

    const fpsController = new FPSControllerV2(60);

    const player = new CircleFigure(canvas.width / 2, canvas.height / 2, 40, "blue");
    let isMouseDownOnPlayer = false;
    let isMouseClickOnPlayer = false;

    const enemies = [
        { figure: new RectangleFigure(100, 100, 50, 50, "red"), direction: new Direction(1, 1) },
        { figure: new RectangleFigure(200, 200, 50, 50, "red"), direction: new Direction(-1, -1) },
        { figure: new RectangleFigure(300, 300, 50, 50, "red"), direction: new Direction(1, -1) },
        { figure: new RectangleFigure(400, 400, 50, 50, "red"), direction: new Direction(-1, 1) }
    ];

    function initEvents() {
        //stopEvents(); // Detener eventos anteriores
        console.log("Initializing events...");
        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mousemove", onMouseMove);
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
            }
        }
        else {
            // Al mantener en el jugador, se mueve hacia la posición del mouse mientras se mantenga presionado
            if (isMouseDownOnPlayer) {
                player.x = e.offsetX;
                player.y = e.offsetY;
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
                //alert("¡Has perdido!");
                //window.location.reload();
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

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;

        clearCanvas();
        drawPlayer();
        drawEnemies();

        checkCollisions();
        updateEnemies();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
});

/** TODO list
 * - [?] PRIORITARIO: Delta time
 * - [ ] Implementar cronómetro
 * - [ ] Implementar backend
 *       - [ ] Guardar puntuaciones
 *       - [ ] Consultar puntuaciones
 * - [ ] Implementar game over: Al colisionar, se muestra un mensaje de game over y se reinicia el juego (el cronómetro no se reinicia hasta que se empieza otra partida)
 * - [ ] Implementar niveles: Cada cierto tiempo, aumenta la dificultad
 * - [ ] Implementar power-ups: Al colisionar con un power-up, se obtiene un beneficio
 * - [ ] Implementar enemigos más inteligentes: Los enemigos persiguen al jugador
 * - [X] Implementar movimiento de los enemigos básico
 * - [ ] Implementar música (a medida que avanza el juego, a la música se le añaden más instrumentos)
 * - [ ] Implementar efectos visuales (ej: rastro del jugador)
 * - [ ] Implementar LocalStorage
 * - [ ] Al estar jugando, no se puede cambiar el nombre de usuario
 */