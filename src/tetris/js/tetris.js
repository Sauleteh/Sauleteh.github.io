import { FpsController } from "./FpsController.js";
import * as Constants from "./Constants.js";
import { Tetromino } from "./Tetromino.js";
import { Controls } from "./Controls.js";
import { KonamiCode } from "./KonamiCode.js";
import { Square } from "./Square.js";

export const board = []; // El tetrominó necesita acceder al tablero, por eso se exporta

document.addEventListener("DOMContentLoaded", function() { // Cargar JS cuando el DOM esté listo
    const canvas = document.querySelector("canvas.board");
    const canvasHold = document.querySelector("canvas.hold");
    const canvasNext = document.querySelector("canvas.next");
    const ctx = canvas.getContext('2d');
    const ctxHold = canvasHold.getContext('2d');
    const ctxNext = canvasNext.getContext('2d');
    const $spriteSquares = document.querySelector("#spriteSquares");
    const $niceVideo = document.querySelector("#niceVideo");
    const $spriteArrow = document.querySelector("#spriteArrow");
    const status = document.querySelector("#scoreboarddiv span.statusCheck");

    const cbEffects = document.querySelector("#cbEffLine");
    const cbExperimental = document.querySelector("#cbExpOpt");
    const selSkin = document.querySelector("#skinSelect");
    const konamiCode = new KonamiCode();
    konamiCode.addListener();

    canvas.width = Constants.SQUARE_SIZE * Constants.BOARD_WIDTH;
    canvas.height = Constants.SQUARE_SIZE * Constants.BOARD_HEIGHT;

    canvasHold.width = Constants.SQUARE_SIZE * 5;
    canvasHold.height = Constants.SQUARE_SIZE * 5;

    canvasNext.width = Constants.SQUARE_SIZE * 5; 
    canvasNext.height = Constants.SQUARE_SIZE * 5;

    let pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED; // Menor número = mayor velocidad. Recomendado entre 0 y 1
    let counterFalling = 0; // Contador para la velocidad de caída de las piezas
    let counterGround = 0; // Contador para cuando una pieza toque el suelo
    let groundResetTimes = 0; // Veces que la pieza ha reseteado el temporizador de tocar el suelo

    const controlFps = new FpsController(Constants.DEFAULT_FPS_CAP);
    const controls = new Controls();
    let counterMovementDelay = 0; // Contador para el retraso de movimiento horizontal de las piezas

    for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
            board[i][j] = null;
        }
    }

    const tetromino = new Tetromino();
    let holdSquares = null; // Cuadrados guardados en el cuadro de guardado
    let canHold = true; // Indica si se puede guardar un tetrominó o no. Se usa para evitar que se guarde más de una vez en un solo movimiento
    let floatingPixels = []; // Píxeles flotantes que aparecen cuando se completa una línea

    let gameOver = false;
    const name = ['', '', ''];
    let nameIndex = 0;
    let nameConfirmed = false;
    let counterNameArrowOffset = 0; // Contador para el desplazamiento del cursor de nombre verticalmente (animación)
    let nameArrowDirection = 1; // Dirección del cursor de nombre (1: hacia abajo, -1: hacia arriba)

    let startGame = false;
    const fakeBoard = [];

    // Creación del tablero falso para el fondo de la pantalla de inicio
    for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
        fakeBoard[i] = [];
        for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
            fakeBoard[i][j] = new Square(i * Constants.SQUARE_SIZE, j * Constants.SQUARE_SIZE, Math.floor(Math.random() * Object.keys(Constants.COLORS).length));
        }
    }

    let gamePaused = false;
    let score = 0;
    let level = 1;
    let linesCompleted = 0;
    let combo = -1;
    let tetrominoPlaced = false; // Indica si el tetrominó actual ya fue colocado en el tablero (para el combo)
    let backToBack = false; // Indica si se hizo un back-to-back

    ctx.imageSmoothingEnabled = false; // Desactivar suavizado de imágenes
    ctxHold.imageSmoothingEnabled = false;
    ctxNext.imageSmoothingEnabled = false;

    function resetGroundDelay() {
        let isOnGround = false;
        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            if (square.row + 1 >= Constants.BOARD_HEIGHT || board[square.row + 1][square.col] !== null) {
                isOnGround = true;
                break;
            }
        }
        if (groundResetTimes < Constants.GROUND_RESET_LIMIT && isOnGround) {
            counterGround = 0;
            groundResetTimes++;
        }
    }

    function initEvents() {
        document.addEventListener("keydown", function(event) {
            const { key } = event;
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
            controls.checkControls(key, "up");
        });

        $niceVideo.addEventListener("play", () => {
            function step() {
                ctx.drawImage($niceVideo, 0, 0, canvas.width, canvas.height);
                
                let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < frame.data.length; i += 4) {
                    let r = frame.data[i];
                    let g = frame.data[i + 1];
                    let b = frame.data[i + 2];
                    if (r < 142 && r > 70 && g <= 255 && g > 160 && b < 120 && b > 20) {
                        frame.data[i + 3] = 0; // Alpha
                    }
                }
                ctx.putImageData(frame, 0, 0);
                drawEntireBoard()

                if ($niceVideo.ended) return;
                requestAnimationFrame(step);
            }
            
            requestAnimationFrame(step);
        });

        cbEffects.addEventListener("click", function() {
            document.activeElement.blur();
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_EFFECT, cbEffects.checked);
        });

        cbExperimental.addEventListener("click", function() {
            document.activeElement.blur();
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_EXPERIMENTAL, cbExperimental.checked);
        });

        selSkin.addEventListener("change", function() {
            document.activeElement.blur();
            const selectedSkin = selSkin.options[selSkin.selectedIndex].value;
            $spriteSquares.src = `./assets/squares_${selectedSkin}.png`;
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_STYLE, selectedSkin);
        });

        fetch("http://gayofo.com:3000/api/tetris/scoreboard", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            status.textContent = "Online";
            status.style.color = "green";
            return response.json();
        }).then(data => {
            const scoreboardListItems = document.querySelectorAll("#scoreboarddiv ol li");
            for (let i = 0; i < scoreboardListItems.length; i++) {
                const actualListItem = scoreboardListItems[i];
                actualListItem.querySelector("span.name").textContent = data[i].username.toUpperCase();
                actualListItem.querySelector("span.score").textContent = data[i].score;
            }
        }).catch(error => {
            console.log("No se pudo conectar con el servidor:", error);
            
            status.textContent = "Offline";
            status.style.color = "red";
        })
    }

    function cleanCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxHold.clearRect(0, 0, canvasHold.width, canvasHold.height);
        ctxNext.clearRect(0, 0, canvasNext.width, canvasNext.height);
    }

    function drawUI() {
        ctx.font = "7px PressStart2P";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(`FPS: ${controlFps.framesPerSec}`, 10, 13);
        ctx.textAlign = "right";
        ctx.fillText(`Score: ${score}`, canvas.width - 10, 13);
        ctx.fillText(`Nivel: ${level}`, canvas.width - 10, 26);
    }

    function drawBoard() {
        for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
            for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
                if (board[i][j] !== null) {
                    const square = board[i][j];
                    //ctx.fillStyle = board[i][j].color;
                    //ctx.fillRect(j * Constants.SQUARE_SIZE, i * Constants.SQUARE_SIZE, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
                    ctx.drawImage(
                        $spriteSquares,
                        square.color * 16, // Posición X del cuadrado en la imagen
                        0, // Posición Y del cuadrado en la imagen
                        16, // An cho del cuadrado en la imagen
                        16, // Alto del cuadrado en la imagen
                        j * Constants.SQUARE_SIZE, // Posición X del cuadrado
                        i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                        Constants.SQUARE_SIZE, // Ancho del cuadrado
                        Constants.SQUARE_SIZE // Alto del cuadrado
                    )
                }
            }
        }
    }

    function drawTetromino() {
        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            //ctx.fillStyle = square.color;
            //ctx.fillRect(square.col * Constants.SQUARE_SIZE, square.row * Constants.SQUARE_SIZE, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
            ctx.drawImage(
                $spriteSquares,
                square.color * 16, // Posición X del cuadrado en la imagen
                0, // Posición Y del cuadrado en la imagen
                16, // Ancho del cuadrado en la imagen
                16, // Alto del cuadrado en la imagen
                square.col * Constants.SQUARE_SIZE, // Posición X del cuadrado
                square.row * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                Constants.SQUARE_SIZE, // Ancho del cuadrado
                Constants.SQUARE_SIZE // Alto del cuadrado
            )
        }
    }

    function drawLimitLine() {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 4 * Constants.SQUARE_SIZE);
        ctx.lineTo(Constants.BOARD_WIDTH * Constants.SQUARE_SIZE, 4 * Constants.SQUARE_SIZE);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Comprueba si el tetromino colisiona con el suelo o con otra pieza
     * @param {*} ignore si debe ignorar los frames de espera para colocar la pieza en el tablero (true cuando se pide un hard drop, false en cualquier otro caso)
     * @returns {boolean} true si hay colisión o false en caso contrario
     */
    function collisionTetromino(ignore) {
        if (!ignore) {
            if (counterGround < Constants.GROUND_RESET_THRESHOLD * controlFps.framesPerSec) {
                let isOnGround = false;
                for (let i = 0; i < tetromino.squares.length; i++) {
                    const square = tetromino.squares[i];
                    if (square.row + 1 >= Constants.BOARD_HEIGHT || board[square.row + 1][square.col] !== null) {
                        isOnGround = true;
                        break;
                    }
                }
                if (isOnGround) counterGround++;
                return false;
            }
            else counterGround = 0;
        }

        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            if (square.row + 1 >= Constants.BOARD_HEIGHT || board[square.row + 1][square.col] !== null) {
                for (let j = 0; j < tetromino.squares.length; j++) {
                    const square = tetromino.squares[j];
                    board[square.row][square.col] = square;
                }
                tetromino.next();
                groundResetTimes = 0;
                counterGround = 0;
                canHold = true;
                tetrominoPlaced = true;
                return true;
            }
        }
        return false;
    }

    function movementTetromino() {
        // Mover izquierda o derecha
        if (controls.keys.left.isPressed) {
            counterMovementDelay++;
            if (!(counterMovementDelay < Constants.MOVEMENT_DELAY_THRESHOLD && controls.keys.left.actionDone)) {
                let canMove = true;
                for (let i = 0; i < tetromino.squares.length; i++) {
                    const square = tetromino.squares[i];
                    if (square.col - 1 < 0 || board[square.row][square.col - 1] !== null) {
                        canMove = false;
                        break;
                    }
                }

                if (canMove) {
                    resetGroundDelay();
                    for (let i = 0; i < tetromino.squares.length; i++) {
                        tetromino.squares[i].col--;
                    }
                    controls.keys.left.actionDone = true;
                }
            }
        }
        else if (controls.keys.right.isPressed) {
            counterMovementDelay++;
            if (!(counterMovementDelay < Constants.MOVEMENT_DELAY_THRESHOLD && controls.keys.right.actionDone)) {
                let canMove = true;
                for (let i = 0; i < tetromino.squares.length; i++) {
                    const square = tetromino.squares[i];
                    if (square.col + 1 >= Constants.BOARD_WIDTH || board[square.row][square.col + 1] !== null) {
                        canMove = false;
                        break;
                    }
                }

                if (canMove) {
                    resetGroundDelay();
                    for (let i = 0; i < tetromino.squares.length; i++) {
                        tetromino.squares[i].col++;
                    }
                    controls.keys.right.actionDone = true;
                }
            }
        }
        else if (!controls.keys.left.isPressed && !controls.keys.right.isPressed) {
            counterMovementDelay = 0;
        }

        // Rotar la pieza en sentido horario o antihorario
        if (controls.keys.rotateClockwise.isPressed && !controls.keys.rotateClockwise.actionDone) {
            tetromino.rotateClockwise();
            resetGroundDelay();
            controls.keys.rotateClockwise.actionDone = true;
        }
        else if (controls.keys.rotateCounterClockwise.isPressed && !controls.keys.rotateCounterClockwise.actionDone) {
            tetromino.rotateCounterClockwise();
            resetGroundDelay();
            controls.keys.rotateCounterClockwise.actionDone = true;
        }

        // Hard drop
        if (controls.keys.dropHard.isPressed && !controls.keys.dropHard.actionDone) {
            let numRows = 0;
            while (!collisionTetromino(true)) {
                for (let i = 0; i < tetromino.squares.length; i++) {
                    tetromino.squares[i].row++;
                }
                numRows++;
            }
            score += numRows * 2; // 2 puntos por cada fila bajada
            controls.keys.dropHard.actionDone = true;
        }

        // Esperar para bajar la pieza (o no esperar si se está pidiendo hacer un soft drop)
        if (!controls.keys.dropSoft.isPressed && counterFalling < pieceFallingSpeed * controlFps.framesPerSec) {
            counterFalling++;
            return;
        }
        else counterFalling = 0;

        // Bajar la pieza
        let canMove = true;
        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            if (square.row >= Constants.BOARD_HEIGHT - 1 || board[square.row + 1][square.col] !== null) canMove = false;
        }
        if (canMove) {
            for (let i = 0; i < tetromino.squares.length; i++) {
                tetromino.squares[i].row++;
            }
            if (controls.keys.dropSoft.isPressed) score += 1; // 1 punto por cada fila bajada con soft drop
        }
    }

    function lineCompleteDetection() {
        let lines = 0;
        for (let i = 0; i < board.length; i++) {
            let lineComplete = true;
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === null) {
                    lineComplete = false;
                    break;
                }
            }
            if (lineComplete) {
                lines++;
                linesCompleted++;
                
                // Animar la línea completada
                if (cbEffects.checked) {
                    for (let j = 0; j < board[i].length; j++) {
                        floatingPixels.push({
                            x: board[i][j].col * Constants.SQUARE_SIZE + Constants.SQUARE_SIZE / 2,
                            y: board[i][j].row * Constants.SQUARE_SIZE + Constants.SQUARE_SIZE / 2,
                            velocidadX: Math.random() * 4 - 2,
                            velocidadY: Math.random() * -4 - 2,
                            color: Constants.COLOR_TO_HEX[board[i][j].color]
                        });
                    }
                }

                // Limpiar la línea completada
                for (let j = 0; j < board[i].length; j++) {
                    board[i][j] = null;
                }

                // Bajar las piezas que estén por encima de la línea completada
                for (let k = i; k > 0; k--) {
                    for (let j = 0; j < board[k].length; j++) {
                        board[k][j] = board[k - 1][j];
                    }
                }
            }
        }
        
        switch (lines) { // Puntos por líneas completadas
            case 1: {
                score += 100 * level;
                if (isBoardCleared()) score += 800 * level; // Perfect clear single-line
                break;
            }
            case 2: {
                score += 300 * level;
                if (isBoardCleared()) score += 1200 * level; // Perfect clear double-line
                break;
            }
            case 3: {
                score += 500 * level;
                if (isBoardCleared()) score += 1800 * level; // Perfect clear triple-line
                break;
            }
            case 4: {
                score += 800 * level * (backToBack ? 1.5 : 1); // Back-to-back: 1.5x puntos
                if (isBoardCleared()) score += (backToBack ? 3200 : 2000) * level; // Perfect clear tetris (con o sin back-to-back)
                if (cbExperimental.checked) $niceVideo.play();
                break;
            }
        }

        if (tetrominoPlaced) {
            if (lines > 0) {
                combo++;
                score += 50 * combo * level; // Puntos por combo
            }
            else combo = -1;

            if (lines === 4) backToBack = true;
            else backToBack = false;

            tetrominoPlaced = false;
        }

        level = Math.floor(linesCompleted / 10) + 1; // Cada 10 líneas, se sube de nivel

        // Sistema de velocidad de caída de las piezas
        if (level <= 1) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED; // Primer nivel
        else if (level <= 10) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED / (level * 0.6); // Niveles 2-10
        else if (level >= 11 && level <= 12) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED / (10 * 0.65); // A partir del 10 no cambia en cada nivel
        else if (level >= 13 && level <= 15) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED / (13 * 0.72); // Nivel 13
        else if (level >= 16 && level <= 18) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED / (16 * 0.8); // Nivel 16
        else if (level >= 19 && level <= 28) pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED / (19 * 0.9); // Nivel 19
        else if (level >= 29) pieceFallingSpeed = 0; // Nivel 29: velocidad máxima, a este punto se le llama "Kill Screen"
    }

    function gameOverDetection() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== null && i < 4) {
                    gameOver = true;
                    return;
                }
            }
        }
    }

    function drawGhostTetromino() {
        const squares = tetromino.squares.map(square => ({ ...square })); // Clonar los cuadrados del tetrominó
        
        // Bajamos los cuadrados del tetrominó fantasma hasta que colisione con algo
        let canMove = true;
        while (canMove) {
            for (let i = 0; i < squares.length; i++) {
                const square = squares[i];
                if (square.row + 1 >= Constants.BOARD_HEIGHT || board[square.row + 1][square.col] !== null) {
                    canMove = false;
                }
            }
            if (canMove)
            {
                for (let i = 0; i < squares.length; i++) {
                    squares[i].row++;
                }
            }
        }

        // Dibujamos el tetrominó fantasma
        for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            ctx.drawImage(
                $spriteSquares,
                square.color * 16, // Posición X del cuadrado en la imagen
                16, // Posición Y del cuadrado en la imagen
                16, // Ancho del cuadrado en la imagen
                16, // Alto del cuadrado en la imagen
                square.col * Constants.SQUARE_SIZE, // Posición X del cuadrado
                square.row * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                Constants.SQUARE_SIZE, // Ancho del cuadrado
                Constants.SQUARE_SIZE // Alto del cuadrado
            )
        }
    }

    function drawHold() {
        ctxHold.font = "9px PressStart2P";
        ctxHold.fillStyle = "white";
        ctxHold.textAlign = "center";
        ctxHold.fillText(`Guardado`, canvasHold.width / 2, 16);

        if (holdSquares !== null) {
            // Desplazamos los cuadrados del tetrominó guardado al punto de origen para poder centrarlos
            moveSquaresToOrigin(holdSquares);

            // Número de cuadrados horizontales y verticales del tetrominó guardado
            let numSquaresHorizontally = 0;
            holdSquares.forEach(square => {
                if (square.col > numSquaresHorizontally) numSquaresHorizontally = square.col;
            });
            numSquaresHorizontally++;
            
            let numSquaresVertically = 0;
            holdSquares.forEach(square => {
                if (square.row > numSquaresVertically) numSquaresVertically = square.row;
            });
            numSquaresVertically++;

            // Dibujamos el tetrominó guardado
            for (let i = 0; i < holdSquares.length; i++) {
                const square = holdSquares[i];

                ctxHold.drawImage(
                    $spriteSquares,
                    square.color * 16, // Posición X del cuadrado en la imagen
                    0, // Posición Y del cuadrado en la imagen
                    16, // Ancho del cuadrado en la imagen
                    16, // Alto del cuadrado en la imagen
                    square.col * Constants.SQUARE_SIZE + Math.round(((canvasNext.width - numSquaresHorizontally * Constants.SQUARE_SIZE) / 2)), // Posición X del cuadrado
                    square.row * Constants.SQUARE_SIZE + Math.round(((canvasNext.height - numSquaresVertically * Constants.SQUARE_SIZE) / 2)), // Posición Y del cuadrado
                    Constants.SQUARE_SIZE, // Ancho del cuadrado
                    Constants.SQUARE_SIZE // Alto del cuadrado
                )
            }
        }
    }

    function drawNext() {
        ctxNext.font = "9px PressStart2P";
        ctxNext.fillStyle = "white";
        ctxNext.textAlign = "center";
        ctxNext.fillText(`Siguiente`, canvasNext.width / 2, 16);


        tetromino.checkBag(); // La bolsa de piezas se rellena si está vacía
        const nextSquares = tetromino.bag[tetromino.bag.length - 1].map(square => ({ ...square })); // Clonar los cuadrados del siguiente tetrominó
        
        // Desplazamos los cuadrados del siguiente tetrominó al punto de origen para poder centrarlos
        moveSquaresToOrigin(nextSquares);

        // Número de cuadrados horizontales y verticales del siguiente tetrominó
        let numSquaresHorizontally = 0;
        nextSquares.forEach(square => {
            if (square.col > numSquaresHorizontally) numSquaresHorizontally = square.col;
        });
        numSquaresHorizontally++;
        
        let numSquaresVertically = 0;
        nextSquares.forEach(square => {
            if (square.row > numSquaresVertically) numSquaresVertically = square.row;
        });
        numSquaresVertically++;

        // Dibujamos el siguiente tetrómino
        for (let i = 0; i < nextSquares.length; i++) {
            const square = nextSquares[i];

            ctxNext.drawImage(
                $spriteSquares,
                square.color * 16, // Posición X del cuadrado en la imagen
                0, // Posición Y del cuadrado en la imagen
                16, // Ancho del cuadrado en la imagen
                16, // Alto del cuadrado en la imagen
                square.col * Constants.SQUARE_SIZE + Math.round(((canvasNext.width - numSquaresHorizontally * Constants.SQUARE_SIZE) / 2)), // Posición X del cuadrado
                square.row * Constants.SQUARE_SIZE + Math.round(((canvasNext.height - numSquaresVertically * Constants.SQUARE_SIZE) / 2)), // Posición Y del cuadrado
                Constants.SQUARE_SIZE, // Ancho del cuadrado
                Constants.SQUARE_SIZE // Alto del cuadrado
            )
        }
    }

    function moveSquaresToOrigin(squares) {
        // Hacia arriba
        let canMoveTop = true;
        while (canMoveTop) {
            for (let i = 0; i < squares.length; i++) {
                const square = squares[i];
                if (square.row <= 0) {
                    canMoveTop = false;
                }
            }
            if (canMoveTop)
            {
                for (let i = 0; i < squares.length; i++) {
                    squares[i].row--;
                }
            }
        }

        // Hacia la izquierda
        let canMoveLeft = true;
        while (canMoveLeft) {
            for (let i = 0; i < squares.length; i++) {
                const square = squares[i];
                if (square.col <= 0) {
                    canMoveLeft = false;
                }
            }
            if (canMoveLeft)
            {
                for (let i = 0; i < squares.length; i++) {
                    squares[i].col--;
                }
            }
        }
    }

    function isBoardCleared() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== null) return false;
            }
        }
        return true;
    }

    function holdTetromino() {
        // Guardar el tetrominó actual
        if (controls.keys.hold.isPressed && !controls.keys.hold.actionDone && canHold) {
            tetromino.resetPosition(); // Reseteamos la posición del tetrominó a guardar para que se dibuje correctamente en el cuadro de guardado
            if (holdSquares === null) { // Si no hay tetrominó guardado, guardamos el actual y sacamos uno nuevo
                holdSquares = tetromino.squares.map(square => ({ ...square }));
                tetromino.next();
            }
            else { // Si ya había un tetrominó guardado, intercambiamos el actual con el guardado
                const temp = holdSquares;
                holdSquares = tetromino.squares;
                tetromino.squares = temp;
                tetromino.resetPosition(); // Colocamos el tetrominó reemplazado en su lugar original
            }
            canHold = false;
            controls.keys.hold.actionDone = true;
        }
    }

    function pauseDetection() {
        if (controls.keys.pause.isPressed && !controls.keys.pause.actionDone) {
            gamePaused = !gamePaused;
            controls.keys.pause.actionDone = true;
        }
    }

    function drawPauseUI() {
        ctx.font = "24px PressStart2P";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Juego", canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText("pausado", canvas.width / 2, canvas.height / 2 + 15);
    }

    function drawAnimation() {
        for (let i = 0; i < floatingPixels.length; i++) {
            const pixel = floatingPixels[i];
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x, pixel.y, 2, 2);
            pixel.x += pixel.velocidadX;
            pixel.y += pixel.velocidadY;
            pixel.velocidadY += 0.1;
            pixel.velocidadX *= 0.99;
            if (pixel.y > canvas.height || pixel.x < 0 || pixel.x > canvas.width) {
                floatingPixels.splice(i, 1);
            }
        }
    }

    function drawGameOverScreen() {
        ctx.font = "22px PressStart2P";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`GAME OVER`, canvas.width / 2, canvas.height / 2 - 200);

        // Dibujar el subrayado de las letras
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        const paddingEdges = 1/1.8; // Factor de tamaño con respecto al ancho del subrayado para los extremos
        const paddingBetween = 1/5; // Factor de tamaño con respecto al ancho del subrayado para los espacios entre letras
        const numberLetters = 3;
        const lineWidth = canvas.width / (2*paddingEdges + numberLetters + (numberLetters-1)*paddingBetween);
        ctx.font = "50px PressStart2P";
        for (let i = 0; i < numberLetters; i++) {
            ctx.beginPath(); // Subrayados
            ctx.moveTo(lineWidth*paddingEdges + lineWidth*i + lineWidth*paddingBetween*i, canvas.height / 2);
            ctx.lineTo(lineWidth*paddingEdges + lineWidth*(i+1) + lineWidth*paddingBetween*i, canvas.height / 2);
            ctx.stroke();
            ctx.closePath();

            ctx.fillText(name[i], lineWidth*paddingEdges + lineWidth*i + lineWidth*paddingBetween*i + lineWidth/2 + 3, canvas.height / 2 - 5); // Letras a escribir
        }

        ctx.drawImage(
            $spriteArrow,
            0, // Posición X en la imagen
            0, // Posición Y en la imagen
            16, // Ancho en la imagen
            16, // Alto en la imagen
            lineWidth*paddingEdges + lineWidth*nameIndex + lineWidth*paddingBetween*nameIndex + lineWidth/2 - 13, // Posición X
            canvas.height / 2 - 100 + counterNameArrowOffset / controlFps.framesPerSec, // Posición Y
            25, // Ancho
            25 // Alto
        )

        if (counterNameArrowOffset / controlFps.framesPerSec >= 10) nameArrowDirection = -1;
        else if (counterNameArrowOffset / controlFps.framesPerSec <= 0) nameArrowDirection = 1;
        counterNameArrowOffset += nameArrowDirection * 30;

        ctx.font = "14px PressStart2P";
        ctx.textAlign = "left";
        ctx.fillText(`Score:`, lineWidth*paddingEdges, canvas.height / 6 * 4);
        ctx.fillText(`Nivel:`, lineWidth*paddingEdges, canvas.height / 6 * 4 + 20);
        ctx.fillText(`Líneas:`, lineWidth*paddingEdges, canvas.height / 6 * 4 + 40);

        ctx.textAlign = "right";
        ctx.fillText(`${score}`, lineWidth*paddingEdges + lineWidth*numberLetters + lineWidth*paddingBetween*numberLetters - 10, canvas.height / 6 * 4);
        ctx.fillText(`${level}`, lineWidth*paddingEdges + lineWidth*numberLetters + lineWidth*paddingBetween*numberLetters - 10, canvas.height / 6 * 4 + 20);
        ctx.fillText(`${linesCompleted}`, lineWidth*paddingEdges + lineWidth*numberLetters + lineWidth*paddingBetween*numberLetters - 10, canvas.height / 6 * 4 + 40);

        ctx.font = "12px PressStart2P";
        ctx.textAlign = "center";
        ctx.fillText("Presiona ENTER", canvas.width / 2, canvas.height / 8 * 7);
        ctx.fillText("para continuar", canvas.width / 2, canvas.height / 8 * 7 + 15);
    }

    function manageNameInput() {
        if (controls.keys.deleteLetter.isPressed && !controls.keys.deleteLetter.actionDone) {
            if (nameIndex > 0) {
                nameIndex--;
                name[nameIndex] = '';
            }

            controls.keys.deleteLetter.actionDone = true;
        }
        else if (controls.keys.writeLetter.isPressed && !controls.keys.writeLetter.actionDone && controls.lastKeyPressed.length === 1) {
            if (nameIndex < 3 && name[nameIndex].length < 1) {
                name[nameIndex] = controls.lastKeyPressed.toUpperCase();
                nameIndex++;
            }

            controls.keys.writeLetter.actionDone = true;
        }

        if (controls.keys.enter.isPressed && !controls.keys.enter.actionDone) {
            if (name[0] !== '' && name[1] !== '' && name[2] !== '' && !nameConfirmed && gameOver && nameIndex === 3) {
                fetch("http://gayofo.com:3000/api/tetris/scoreboard/" + name.join(''), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "score": score, "date": new Date().toISOString().slice(0, 19).replace('T', ' ') })
                }).then(() => {
                    window.location.reload();
                }).catch(error => {
                    console.log("No se pudo conectar con el servidor:", error);    
                    window.location.reload();
                })
                nameConfirmed = true;
            }
            controls.keys.enter.actionDone = true;
        }
    }

    function drawSavingScore() {
        ctx.font = "14px PressStart2P";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Guardando`, canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText(`puntuación...`, canvas.width / 2, canvas.height / 2 + 10);
    }

    function drawStartScreen() {
        ctx.font = "26px PressStart2P";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`TETRIS`, canvas.width / 2, canvas.height / 2 - 80);

        ctx.font = "14px PressStart2P";
        ctx.fillText(`Presiona ENTER`, canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText(`para comenzar`, canvas.width / 2, canvas.height / 2 + 90);
    }

    function manageStartGame() {
        if (controls.keys.enter.isPressed && !controls.keys.enter.actionDone) {
            startGame = true;
            controls.keys.enter.actionDone = true;
        }
    }

    /**
     * Conjunto de funciones para dibujar el tablero y todo lo relacionado con él
     */
    function drawEntireBoard() {
        drawUI();
        drawBoard();
        drawGhostTetromino();
        drawTetromino();
        drawLimitLine();
        drawAnimation();
    }

    function drawRandomFakeBoard() {
        for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
            for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
                const square = fakeBoard[i][j];
                //ctx.fillStyle = board[i][j].color;
                //ctx.fillRect(j * Constants.SQUARE_SIZE, i * Constants.SQUARE_SIZE, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
                ctx.drawImage(
                    $spriteSquares,
                    square.color * 16, // Posición X del cuadrado en la imagen
                    0, // Posición Y del cuadrado en la imagen
                    16, // Ancho del cuadrado en la imagen
                    16, // Alto del cuadrado en la imagen
                    j * Constants.SQUARE_SIZE, // Posición X del cuadrado
                    i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                    Constants.SQUARE_SIZE, // Ancho del cuadrado
                    Constants.SQUARE_SIZE // Alto del cuadrado
                )
            }
        }
    }

    function restoreLocalStorage() {
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_EFFECT) !== null) {
            cbEffects.checked = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_EFFECT) === "true";
        }
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_EXPERIMENTAL) !== null) {
            cbExperimental.checked = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_EXPERIMENTAL) === "true";
        }
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_STYLE) !== null) {
            selSkin.value = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_STYLE);
            $spriteSquares.src = `./assets/squares_${selSkin.value}.png`;
        }
        if (localStorage.getItem(Constants.STORAGE_KEYS.OPTION_KONAMICODE) !== null) {
            const konamiCode = localStorage.getItem(Constants.STORAGE_KEYS.OPTION_KONAMICODE) === "true";
            if (konamiCode) document.querySelector(".hide").classList.remove("hide");
        }
        // TODO: Añadir los nuevos 2 botones de opciones
    }

    function draw() {
        window.requestAnimationFrame(draw);

        if (!controlFps.shouldDrawFrame()) return;
        
        cleanCanvas();
        
        if (!startGame) {
            ctx.globalAlpha = 0.1;
            drawRandomFakeBoard();
            ctx.globalAlpha = 1;
            drawStartScreen();
            manageStartGame();
        }
        else if (!gameOver) {
            pauseDetection();
            if (gamePaused) {
                drawPauseUI();   
                return;
            }

            drawEntireBoard();
            drawHold();
            drawNext();

            holdTetromino();
            movementTetromino();
            collisionTetromino(false);
            lineCompleteDetection();
            gameOverDetection();
        }
        else {
            if (!nameConfirmed) {
                ctx.globalAlpha = 0.1;
                drawBoard();
                ctx.globalAlpha = 1;
                drawGameOverScreen();
                manageNameInput();
            }
            else {
                ctx.globalAlpha = 0.1;
                drawBoard();
                ctx.globalAlpha = 1;
                drawSavingScore();
            }
        }
    }
    
    draw();
    initEvents();
    restoreLocalStorage();
});

// TODO: Ver las siguientes 3 piezas a caer en vez de solo la siguiente