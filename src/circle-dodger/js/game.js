import { CircleFigure } from "./CircleFigure.js";
import { FPSControllerV2 } from "./FPSControllerV2.js";
import { RectangleFigure } from "./RectangleFigure.js";
import { Direction } from "./Direction.js";
import { Chronometer } from "./Chronometer.js";
import * as Constants from "./Constants.js";

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector("canvas.board");
    const ctx = canvas.getContext("2d");
    const chronoText = document.querySelector("label.chronometer");
    const levelText = document.querySelector("label.level");
    const cbClickInsteadOfHolding = document.querySelector("#cbClickInsteadOfHolding");
    const inputName = document.querySelector("#inputName");
    const status = document.querySelector("#scoreboarddiv span.statusCheck");

    canvas.onselectstart = function() { return false; } // Evitar que se seleccione texto al hacer click y arrastrar
    canvas.width = 800;
    canvas.height = 600;

    const fpsController = new FPSControllerV2(60);
    const chronoObj = new Chronometer();

    let player = null;
    let isMouseDownOnPlayer = false;
    let isMouseClickOnPlayer = false;
    let nameSelected = "";

    let enemies = [];

    let isGameOver = false;
    let isGameStarted = false;
    let level = 1;
    let enemySpeedMultiplier = 1;
    let isLevelTwoEnemyAdded = false;
    let warningInterval = null; // Intervalo para cambiar el estado del warning
    let warningState = false; // Estado del warning para hacer el efecto de parpadeo

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

    function initOptions() {
        cbClickInsteadOfHolding.addEventListener("change", function() {
            document.activeElement.blur();
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_CLICK_INSTEAD_OF_HOLDING, cbClickInsteadOfHolding.checked);
        });

        inputName.addEventListener("input", function() {
            inputName.value = inputName.value.replace(/\W/g, ""); // \W = [^a-zA-Z0-9_]
            if (isGameStarted) return; // No se puede cambiar el nombre si se está jugando
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_NAME, inputName.value);
        });
    }

    function getScoreboard() {
        fetch("https://gayofo.com/api/circledodger/scoreboard", { // Obtener la tabla de puntuaciones de las 3 dificultades
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            status.textContent = "Online";
            status.style.color = "green";
            return response.json();
        }).then(data => { // TODO: Comprobar que funciona
            // console.log(data);
            const scoreList = document.querySelectorAll("#scoreboarddiv ol li");
            // console.log(actualList);
            for (let i = 0; i < data.length; i++) { // Por cada puntuación...
                const actualListItem = scoreList[i];
                actualListItem.querySelector("span.name").textContent = data[i].username;
                
                const msTime = data[i].score;
                const miliseconds = chronoObj.zeroPad(Math.floor(msTime) % 1000, 3);
                const seconds = chronoObj.zeroPad(Math.floor(msTime / 1000) % 60, 2);
                const minutes = chronoObj.zeroPad(Math.floor(msTime / 1000 / 60), 2);
                actualListItem.querySelector("span.score").textContent = `${minutes}:${seconds}.${miliseconds}`;
            }
        }).catch(error => {
            console.log("No se pudo conectar con el servidor:", error);
            status.textContent = "Offline";
            status.style.color = "red";
        })
    }

    function onClickListener(e) {
        // console.log("Click event");

        // Si se hace click en el jugador, se activa/desactiva la variable para moverlo
        if (e.button === 0 && player.isPointInside(e.offsetX, e.offsetY)) isMouseClickOnPlayer = !isMouseClickOnPlayer;
    }

    function onMouseDown(e) {
        // console.log("Mouse down event");

        // Si al pulsar, el ratón está sobre el jugador, se activa la variable para moverlo
        if (e.button === 0 && player.isPointInside(e.offsetX, e.offsetY)) isMouseDownOnPlayer = true;
    }

    function onMouseUp(e) {
        // console.log("Mouse up event");
        if (e.button === 0) isMouseDownOnPlayer = false;
    }

    function onMouseMove(e) {
        // console.log("Mouse move event");

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
                    nameSelected = inputName.value;
                    enableOptions(false);
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
        if (level === 2 && !isLevelTwoEnemyAdded) {
            enemies.push({ figure: new RectangleFigure(canvas.width / 2, canvas.height / 2, 40, 40, "red"), direction: new Direction(2, 6) });
            isLevelTwoEnemyAdded = true;
        }
        enemies.forEach(enemy => {
            if (level === 1) enemySpeedMultiplier = Math.max(1, Math.min(5, (chronoObj.getElapsedTime() / 1000 / 5))); // A los 25s de juego, el multiplicador será 5
            else if (level === 2) enemySpeedMultiplier = Math.max(4, Math.min(5, 5 - ((chronoObj.getElapsedTime() - 30000) / 1000 / 5))); // En 5s, el multiplicador pasará de 5 a 4
            //console.log(enemySpeedMultiplier);
            enemy.figure.x += enemy.direction.dX * enemySpeedMultiplier;
            enemy.figure.y += enemy.direction.dY * enemySpeedMultiplier;

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
        level = 1;
        enemySpeedMultiplier = 1;
        isLevelTwoEnemyAdded = false;
        warningInterval = null;
        warningState = false;
        player = new CircleFigure(canvas.width / 2, canvas.height / 2, 35, "blue");
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
        submitScore(msTime);
        enableOptions(true);
    }

    function submitScore(msTime) {
        // console.log(msTime, nameSelected);
        if (nameSelected === "") {
            return new Promise((resolve, reject) => reject("No se ha introducido un nombre o la dificultad es personalizada"));
        }
        else {
            // Al recibir la respuesta, mostrar el botón de continuar en vez de cargando
            console.log("Enviando puntuación al servidor...")
            return fetch("https://gayofo.com/api/circledodger/scoreboard/" + nameSelected, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "time": msTime })
            }).then(() => {
                console.log("Puntuación enviada correctamente");
                getScoreboard();
            }).catch(error => {
                console.log("No se pudo conectar con el servidor:", error);
            })
        }
    }

    function updateLevel() {
        if (chronoObj.getElapsedTime() < 30000) level = 1; // 0-30s
        else if (chronoObj.getElapsedTime() < 60000) level = 2; // 30-60s
        else if (chronoObj.getElapsedTime() < 90000) level = 3; // 60-90s
        else if (chronoObj.getElapsedTime() < 120000) level = 4; // 90-120s
        else level = 5; // 120s en adelante

        levelText.textContent = `Nivel ${level}`;
    }

    function drawEnemyWarning() {
        // Si se está en el nivel 1 a partir de los 27s, se mostrará un signo de exclamación indicando que aparecerá un nuevo enemigo
        if (level === 1 && !isLevelTwoEnemyAdded && chronoObj.getElapsedTime() > 27000) {
            if (warningInterval === null) warningInterval = setInterval(() => warningState = !warningState, 250);
            ctx.font = "40px Arial";
            if (warningState) ctx.fillStyle = "red";
            else ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("!", canvas.width / 2, canvas.height / 2);
        }
        else {
            clearInterval(warningInterval);
            warningInterval = null;
        }
    }

    function restoreLocalStorage() {
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_CLICK_INSTEAD_OF_HOLDING) !== null) {
            cbClickInsteadOfHolding.checked = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_CLICK_INSTEAD_OF_HOLDING) === "true";
        }
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_NAME) !== null) {
            inputName.value = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_NAME);
        }
    }

    function enableOptions(isEnabled) {
        cbClickInsteadOfHolding.disabled = !isEnabled;
        inputName.disabled = !isEnabled;
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        console.log(fpsController.elapsed);
        
        clearCanvas();
        drawPlayer();
        drawEnemies();
        
        if (isGameStarted) {
            drawEnemyWarning();
            checkCollisions();
            if (isGameOver) { // Mientras no se juega...
                console.log("Game over!");
                onGameOver();
                resetGame();
            }
            else { // Mientras se juega...
                updateEnemies();
                updateLevel();
            }
        }

        fpsController.updateLastTime(now);
    }

    initOptions();
    restoreLocalStorage();
    resetGame();
    getScoreboard();
    draw();
});

/** TODO list
 * - [?] PRIORITARIO: Delta time
 * - [X] Implementar cronómetro
 * - [X] Implementar backend
 *       - [X] Guardar puntuaciones
 *       - [X] Consultar puntuaciones
 * - [X] Implementar game over: Al colisionar, se muestra un mensaje de game over y se reinicia el juego (el cronómetro no se reinicia hasta que se empieza otra partida)
 * - [ ] Implementar niveles: Cada cierto tiempo, aumenta la dificultad
 *       - [X] Nivel 1 (0-30s): De 1 a 5 de multiplicador de velocidad de enemigos (máx. 5 a los 25s)
 *       - [X] Nivel 2 (30-60s): Bajada de multiplicador de velocidad de enemigos a 4 (transición de 5s) + un nuevo enemigo + power-downs
 *       - [ ] Nivel 3 (60-90s): Aparición de áreas circulares que matan al jugador si entra en ellas cuando se activen
 *             - Propiedades área circular: Tiempo de activación 3s, intervalo de aparición 6s, radio 60
 *       - [ ] Nivel 4 (90-120s): Las áreas circulares ocurren con mayor frecuencia y a mayor velocidad
 *             - Propiedades área circular: Tiempo de activación 2s, intervalo de aparición 4s, radio 60
 *       - [ ] Nivel 5 (120s en adelante): Subida de multiplicador de velocidad de enemigos de 4 a 6 (transición de 10s) + áreas circulares más grandes
 *             - Propiedades área circular: Tiempo de activación 2s, intervalo de aparición 4s, radio 80
 * - [ ] Implementar power-ups: Al colisionar con un power-up, se obtiene un beneficio
 *       - [ ] Cada 15 segundos (y durante 10 segundos), aparece un power-up en una posición aleatoria
 *             - Power-up 1: Disminuye el radio del jugador (permanente)
 *             - Power-up 2: Disminuye el tamaño de los enemigos (permanente)
 *             - Power-up 3: Disminuye en 2 el multiplicador de velocidad de los enemigos (durante 8 segundos) cuando le des a la Z
 *             - Power-up 4: El tiempo se detiene (durante 3 segundos) cuando le des a la X
 *       - Los tres primeros power-ups que aparecen se pueden escoger en las opciones
 *       - Todos los power-ups son acumulables
 * - [ ] Implementar power-downs: Al colisionar con un power-down, se obtiene una penalización
 *       - [ ] Cada 30 segundos (y durante 5 segundos), aparece un power-down en la posición contraria al jugador
 *             - Power-down 1: Aumenta el radio del jugador (durante 10 segundos)
 *             - Power-down 2: Aumenta el tamaño de los enemigos (durante 10 segundos)
 *             - Power-down 3: El jugador se convierte en un cuadrado (durante 10 segundos)
 *             - Power-down 4: Los enemigos tienen atracción gravitatoria hacia el jugador (durante 5 segundos), es decir, los enemigos se moverán un poquito hacia la posición del jugador
 * - [X] Implementar movimiento de los enemigos básico
 * - [ ] Implementar música (a medida que avanza el juego, a la música se le añaden más instrumentos)
 * - [ ] Implementar efectos visuales (ej: rastro del jugador)
 * - [X] Implementar LocalStorage
 * - [X] Al estar jugando, no se puede cambiar el nombre de usuario
 */