import { FpsController } from "./FpsController.js";
import * as Constants from "./Constants.js";
import { Tetromino } from "./Tetromino.js";
import { Controls } from "./Controls.js";

export const board = []; // El tetrominó necesita acceder al tablero, por eso se exporta

document.addEventListener("DOMContentLoaded", function() { // Cargar JS cuando el DOM esté listo
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext('2d');

    canvas.width = Constants.SQUARE_SIZE * Constants.BOARD_WIDTH;
    canvas.height = Constants.SQUARE_SIZE * Constants.BOARD_HEIGHT;

    const pieceFallingSpeed = 0.2; // Menor número = mayor velocidad. Recomendado entre 0 y 1
    let counterFalling = 0; // Contador para la velocidad de caída de las piezas

    const controlFps = new FpsController(30);
    const controls = new Controls();

    for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
        board[i] = [];
        for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
            board[i][j] = null;
        }
    }

    const tetromino = new Tetromino();
    let gameOver = false;

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
    }

    function drawUI() {
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`FPS: ${controlFps.framesPerSec}`, 10, 10);
    }

    function drawBoard() {
        for (let i = 0; i < Constants.BOARD_HEIGHT; i++) {
            for (let j = 0; j < Constants.BOARD_WIDTH; j++) {
                if (board[i][j] !== null) {
                    ctx.fillStyle = board[i][j].color;
                    ctx.fillRect(j * Constants.SQUARE_SIZE, i * Constants.SQUARE_SIZE, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
                }
            }
        }
    }

    function drawTetromino() {
        for (let i = 0; i < tetromino.squares.length; i++) {
            const square = tetromino.squares[i];
            ctx.fillStyle = square.color;
            ctx.fillRect(square.col * Constants.SQUARE_SIZE, square.row * Constants.SQUARE_SIZE, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
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
                return true;
            }
        }
        return false;
    }

    function movementTetromino() {
        // Mover izquierda o derecha
        if (controls.keys.left.isPressed && !controls.keys.left.actionDone) {
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
        else if (controls.keys.right.isPressed && !controls.keys.right.actionDone) {
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
        for (let i = 0; i < board.length; i++) {
            let lineComplete = true;
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === null) {
                    lineComplete = false;
                    break;
                }
            }
            if (lineComplete) {
                for (let j = 0; j < board[i].length; j++) {
                    board[i][j] = null;
                }
                for (let k = i; k > 0; k--) {
                    for (let j = 0; j < board[k].length; j++) {
                        board[k][j] = board[k - 1][j];
                    }
                }
            }
        }
    }

    function gameOverDetection() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== null && i < 4) {
                    alert("Game Over");
                    gameOver = true;
                    window.location.reload();
                    return;
                }
            }
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
        drawLimitLine();

        if (!collisionTetromino()) movementTetromino();
        else lineCompleteDetection();
        gameOverDetection();
    }
    
    draw();
    initEvents();
});

// TODO: Implementar el sistema de puntuación, el sistema de niveles, el sistema de piezas por bolsa, mejorar los gráficos y mejorar el control horizontal de las piezas.