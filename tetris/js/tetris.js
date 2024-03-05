import { FpsController } from "./FpsController.js";
import * as Constants from "./Constants.js";
import { Tetromino } from "./Tetromino.js";
import { Controls } from "./Controls.js";

export const board = []; // El tetrominó necesita acceder al tablero, por eso se exporta

document.addEventListener("DOMContentLoaded", function() { // Cargar JS cuando el DOM esté listo
    const canvas = document.querySelector("canvas.board");
    const canvasHold = document.querySelector("canvas.hold");
    const canvasNext = document.querySelector("canvas.next");
    const ctx = canvas.getContext('2d');
    const ctxHold = canvasHold.getContext('2d');
    const ctxNext = canvasNext.getContext('2d');
    const $spriteSquares = document.querySelector("#spriteSquares");

    canvas.width = Constants.SQUARE_SIZE * Constants.BOARD_WIDTH;
    canvas.height = Constants.SQUARE_SIZE * Constants.BOARD_HEIGHT;

    canvasHold.width = Constants.SQUARE_SIZE * 5;
    canvasHold.height = Constants.SQUARE_SIZE * 5;

    canvasNext.width = Constants.SQUARE_SIZE * 5;
    canvasNext.height = Constants.SQUARE_SIZE * 5;

    let pieceFallingSpeed = Constants.INITIAL_FALLING_SPEED; // Menor número = mayor velocidad. Recomendado entre 0 y 1
    let counterFalling = 0; // Contador para la velocidad de caída de las piezas

    const controlFps = new FpsController(30);
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

    let gameOver = false;
    let score = 0;
    let level = 1;
    let linesCompleted = 0;

    function initEvents() {
        document.addEventListener("keydown", function(event) {
            const { key } = event;
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
            controls.checkControls(key, "up");
        });
    }

    function cleanCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctxHold.clearRect(0, 0, canvasHold.width, canvasHold.height);
        ctxNext.clearRect(0, 0, canvasNext.width, canvasNext.height);
    }

    function drawUI() {
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`FPS: ${controlFps.framesPerSec}`, 10, 12);
        ctx.fillText(`Score: ${score}`, canvas.width / 1.4, 12);
        ctx.fillText(`Nivel: ${level}`, canvas.width / 1.4, 24);
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
     * @returns {boolean} true si hay colisión o false en caso contrario
     */
    function collisionTetromino() {
        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            if (square.row + 1 >= Constants.BOARD_HEIGHT || board[square.row + 1][square.col] !== null) {
                for (let j = 0; j < tetromino.squares.length; j++) {
                    const square = tetromino.squares[j];
                    board[square.row][square.col] = square;
                }
                tetromino.next();
                canHold = true;
                return true;
            }
        }
        return false;
    }

    function movementTetromino() {
        // Mover izquierda o derecha
        if (controls.keys.left.isPressed) {
            counterMovementDelay++;
            if (counterMovementDelay < Constants.MOVEMENT_DELAY_THRESHOLD && controls.keys.left.actionDone) return;

            let canMove = true;
            for (let i = 0; i < tetromino.squares.length; i++) {
                const square = tetromino.squares[i];
                if (square.col - 1 < 0 || board[square.row][square.col - 1] !== null) {
                    canMove = false;
                    break;
                }
            }

            if (canMove) {
                for (let i = 0; i < tetromino.squares.length; i++) {
                    tetromino.squares[i].col--;
                }
                controls.keys.left.actionDone = true;
            }
        }
        else if (controls.keys.right.isPressed) {
            counterMovementDelay++;
            if (counterMovementDelay < Constants.MOVEMENT_DELAY_THRESHOLD && controls.keys.right.actionDone) return;

            let canMove = true;
            for (let i = 0; i < tetromino.squares.length; i++) {
                const square = tetromino.squares[i];
                if (square.col + 1 >= Constants.BOARD_WIDTH || board[square.row][square.col + 1] !== null) {
                    canMove = false;
                    break;
                }
            }

            if (canMove) {
                for (let i = 0; i < tetromino.squares.length; i++) {
                    tetromino.squares[i].col++;
                }
                controls.keys.right.actionDone = true;
            }
        }
        else if (!controls.keys.left.isPressed && !controls.keys.right.isPressed) {
            counterMovementDelay = 0;
        }

        // Rotar la pieza en sentido horario o antihorario
        if (controls.keys.rotateClockwise.isPressed && !controls.keys.rotateClockwise.actionDone) {
            tetromino.rotateClockwise();
            controls.keys.rotateClockwise.actionDone = true;
        }
        else if (controls.keys.rotateCounterClockwise.isPressed && !controls.keys.rotateCounterClockwise.actionDone) {
            tetromino.rotateCounterClockwise();
            controls.keys.rotateCounterClockwise.actionDone = true;
        }

        // Hard drop
        if (controls.keys.dropHard.isPressed && !controls.keys.dropHard.actionDone) {
            while (!collisionTetromino()) {
                for (let i = 0; i < tetromino.squares.length; i++) {
                    tetromino.squares[i].row++;
                }
            }
            controls.keys.dropHard.actionDone = true;
        }

        // Esperar para bajar la pieza (o no esperar si se está pidiendo hacer un soft drop)
        if (!controls.keys.dropSoft.isPressed && counterFalling < pieceFallingSpeed * controlFps.framesPerSec) {
            counterFalling++;
            return;
        }
        else counterFalling = 0;

        // Bajar la pieza
        for (let i = 0; i < tetromino.squares.length; i++) {
            tetromino.squares[i].row++;
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

        // Sistema de puntuación del Tetris 1988 BPS
        switch (lines) {
            case 1: score += 40; break;
            case 2: score += 100; break;
            case 3: score += 300; break;
            case 4: score += 1200; break;
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
                    alert("Game Over\n\nPuntuación: " + score + "\nNivel: " + level + "\nLíneas completadas: " + linesCompleted);
                    gameOver = true;
                    window.location.reload();
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
        ctxHold.font = "12px Arial";
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
                    square.col * Constants.SQUARE_SIZE + ((canvasNext.width - numSquaresHorizontally * Constants.SQUARE_SIZE) / 2), // Posición X del cuadrado
                    square.row * Constants.SQUARE_SIZE + ((canvasNext.height - numSquaresVertically * Constants.SQUARE_SIZE) / 2), // Posición Y del cuadrado
                    Constants.SQUARE_SIZE, // Ancho del cuadrado
                    Constants.SQUARE_SIZE // Alto del cuadrado
                )
            }
        }
    }

    function drawNext() {
        ctxNext.font = "12px Arial";
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
                square.col * Constants.SQUARE_SIZE + ((canvasNext.width - numSquaresHorizontally * Constants.SQUARE_SIZE) / 2), // Posición X del cuadrado
                square.row * Constants.SQUARE_SIZE + ((canvasNext.height - numSquaresVertically * Constants.SQUARE_SIZE) / 2), // Posición Y del cuadrado
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

    function draw() {
        if (!gameOver) window.requestAnimationFrame(draw);
        else return;

        if (!controlFps.shouldDrawFrame()) return;

        cleanCanvas();

        drawUI();
        drawBoard();
        drawTetromino();
        drawGhostTetromino();
        drawLimitLine();

        drawHold();
        drawNext();

        holdTetromino();
        movementTetromino();
        collisionTetromino();
        lineCompleteDetection();
        gameOverDetection();
    }
    
    draw();
    initEvents();
});

// TODO: Implementar un cierto delay antes de colocar la pieza en el tablero para que el jugador pueda moverla un poco antes de que se bloquee
// TODO: Añadir una guía de controles en la pantalla