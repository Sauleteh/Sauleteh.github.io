import { Square } from "./Square.js";
import * as Constants from "./Constants.js";

document.addEventListener("DOMContentLoaded", function() { // Cargar JS cuando el DOM esté listo
    const canvas = document.querySelector("canvas.board");
    const ctx = canvas.getContext("2d");
    const $spriteSquares = document.querySelector("#spriteSquares");

    let boardWidth = 20;
    let boardHeight = 20;
    let numOfMines = 100;
    let boardGenerated = false;

    canvas.width = Constants.SQUARE_SIZE * boardWidth;
    canvas.height = Constants.SQUARE_SIZE * boardHeight;
    ctx.imageSmoothingEnabled = false; // Desactivar suavizado de imágenes

    const board = [];
    for (let i = 0; i < boardHeight; i++) {
        board[i] = [];
        for (let j = 0; j < boardWidth; j++) {
            board[i][j] = new Square(i, j, 0, true, false);
        }
    }
    board[8][3].revealed = false;

    function drawBoard() {
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                const square = board[i][j];

                // 1. Dibujamos el revelado
                ctx.drawImage(
                    $spriteSquares,
                    (square.revealed ? Constants.SQUARE_TYPES.REVEALED : Constants.SQUARE_TYPES.UNREVEALED) * Constants.IMG_SQUARE_SIZE, // Posición X del cuadrado en la imagen
                    0, // Posición Y del cuadrado en la imagen
                    Constants.IMG_SQUARE_SIZE, // An cho del cuadrado en la imagen
                    Constants.IMG_SQUARE_SIZE, // Alto del cuadrado en la imagen
                    j * Constants.SQUARE_SIZE, // Posición X del cuadrado
                    i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                    Constants.SQUARE_SIZE, // Ancho del cuadrado
                    Constants.SQUARE_SIZE // Alto del cuadrado
                );

                // 2. Si es revelado, dibujamos el contenido, si no, dibujamos si está con bandera o no
                if (square.revealed) {
                    // Cuando se revela un cuadrado, hay 3 opciones: un vacío (0), un número (1-8) o una mina
                    if (square.content !== 0) { // El número 0 no se dibuja
                        ctx.drawImage(
                            $spriteSquares,
                            Constants.NUMBER_TO_TYPE[square.content] * Constants.IMG_SQUARE_SIZE, // Posición X del cuadrado en la imagen
                            0, // Posición Y del cuadrado en la imagen
                            Constants.IMG_SQUARE_SIZE, // An cho del cuadrado en la imagen
                            Constants.IMG_SQUARE_SIZE, // Alto del cuadrado en la imagen
                            j * Constants.SQUARE_SIZE, // Posición X del cuadrado
                            i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                            Constants.SQUARE_SIZE, // Ancho del cuadrado
                            Constants.SQUARE_SIZE // Alto del cuadrado
                        );
                    }
                }
                else if (!square.revealed && square.flagged) {
                    ctx.drawImage(
                        $spriteSquares,
                        Constants.SQUARE_TYPES.FLAG * Constants.IMG_SQUARE_SIZE, // Posición X del cuadrado en la imagen
                        0, // Posición Y del cuadrado en la imagen
                        Constants.IMG_SQUARE_SIZE, // An cho del cuadrado en la imagen
                        Constants.IMG_SQUARE_SIZE, // Alto del cuadrado en la imagen
                        j * Constants.SQUARE_SIZE, // Posición X del cuadrado
                        i * Constants.SQUARE_SIZE, // Posición Y del cuadrado
                        Constants.SQUARE_SIZE, // Ancho del cuadrado
                        Constants.SQUARE_SIZE // Alto del cuadrado
                    );
                }
            }
        }
    }

    function generateBoard(initialSquare) {
        // Generación de las minas
        let totalMines = numOfMines;
        let fails = 0;
        let maxFails = boardWidth * boardHeight * (Math.floor(totalMines / 10) + 1);

        // Intentar generar todas las minas, pero evitar también un loop infinito
        while (totalMines > 0 && fails < maxFails) {
            let randomRow = Math.floor(Math.random() * boardHeight);
            let randomCol = Math.floor(Math.random() * boardWidth);

            // Obtener los cuadrados adyacentes del cuadrado inicial
            let tlRow = initialSquare.row; // Superior izquierda
            let tlCol = initialSquare.col;
            let brRow = initialSquare.row; // Inferior derecha
            let brCol = initialSquare.col;
            if (initialSquare.row >= 1) tlRow--;
            if (initialSquare.col >= 1) tlCol--;
            if (initialSquare.row <= boardHeight - 2) brRow++;
            if (initialSquare.col <= boardWidth - 2) brCol++;

            if (board[randomRow][randomCol].content !== Constants.MINE_ID &&
                (randomRow < tlRow || randomRow > brRow) &&
                (randomCol < tlCol || randomCol > brCol))
            {
                board[randomRow][randomCol].content = Constants.MINE_ID;
                totalMines--;
            }
            else {
                fails++;
                continue;
            }
        }

        if (totalMines > 0) { // Reintentar si no se han podido generar todas las minas
            console.error("No se han podido generar todas las minas, reintentando...");
            generateBoard(initialSquare);
            return;
        }

        // Comprobamos los cuadrados adyacentes para dibujar los números
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                if (board[i][j].content === Constants.MINE_ID) {
                    let tlRow = i; // Superior izquierda
                    let tlCol = j;
                    let brRow = i; // Inferior derecha
                    let brCol = j;
                    if (i >= 1) tlRow--;
                    if (j >= 1) tlCol--;
                    if (i <= boardHeight - 2) brRow++;
                    if (j <= boardWidth - 2) brCol++;

                    for (let row = tlRow; row <= brRow; row++) {
                        for (let col = tlCol; col <= brCol; col++) {
                            if (row === i && col === j) continue; // No comprobar el cuadrado actual

                            if (board[row][col].content !== Constants.MINE_ID) {
                                board[row][col].content++;
                            }
                        }
                    }
                }
            }
        }
    }

    function initEvents() {
        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("contextmenu", onRightClickListener, false);
    }

    function onClickListener(event) {
        let clickedRow = Math.floor(event.offsetY / Constants.SQUARE_SIZE);
        let clickedCol = Math.floor(event.offsetX / Constants.SQUARE_SIZE);
        if (clickedRow >= boardHeight || clickedRow < 0 || clickedCol >= boardWidth || clickedCol < 0) return; // Comprobar dimensiones
        else if (board[clickedRow][clickedCol].revealed) return; // Si ya está revelado, no hacemos nada
        else if (board[clickedRow][clickedCol].flagged) return; // Si está con bandera, no hacemos nada

        if (!boardGenerated) {
            generateBoard(board[clickedRow][clickedCol]); // Si es el primer click, generamos el tablero (nunca se debe generar una mina en el primer click, por eso se crea a partir de este click)
            boardGenerated = true;
        }

        board[clickedRow][clickedCol].revealed = true;
        
        console.log(clickedRow, clickedCol);
        drawBoard();
    }

    function onRightClickListener(event) {
        let clickedRow = Math.floor(event.offsetY / Constants.SQUARE_SIZE);
        let clickedCol = Math.floor(event.offsetX / Constants.SQUARE_SIZE);
        if (clickedRow >= boardHeight || clickedRow < 0 || clickedCol >= boardWidth || clickedCol < 0) return;

        event.preventDefault(); // Evitar que aparezca el menú contextual

        // Si el cuadrado no está revelado, se puede poner bandera
        if (!board[clickedRow][clickedCol].revealed) board[clickedRow][clickedCol].flagged = !board[clickedRow][clickedCol].flagged;

        console.log(clickedRow, clickedCol);
        drawBoard();
        return false;
    }

    // Inicializar el juego
    drawBoard();
    initEvents();
});

/** TODO: list
 * - Bug: Pasa algo con la generación de minas, nunca se generan las minas en las posiciones ortogonales del primer click
 * - Si se hace click en un cuadrado con mina, se pierde la partida
 * - Si todos los cuadrados que no son minas han sido revelados, se gana la partida
 * - Si se revela un cuadrado 0, se revelan todos los cuadrados... ¿adyacentes, ortogonales? ¿Solo los 0, o también los números?
 */