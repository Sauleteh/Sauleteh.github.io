import { Square } from "./Square.js";
import * as Constants from "./Constants.js";
import { Chronometer } from "./Chronometer.js";

document.addEventListener("DOMContentLoaded", function() { // Cargar JS cuando el DOM esté listo
    const canvas = document.querySelector("canvas.board");
    const ctx = canvas.getContext("2d");
    const $spriteSquares = document.querySelector("#spriteSquares");
    const chronoText = document.querySelector("#chronometer");
    const chronoObj = new Chronometer();

    let boardWidth = 20;
    let boardHeight = 20;
    let numOfMines = 100;
    let boardGenerated = false;
    let isRightPressed = false; // ¿Click derecho presionado?

    canvas.width = Constants.SQUARE_SIZE * boardWidth;
    canvas.height = Constants.SQUARE_SIZE * boardHeight;
    ctx.imageSmoothingEnabled = false; // Desactivar suavizado de imágenes

    const board = [];
    for (let i = 0; i < boardHeight; i++) {
        board[i] = [];
        for (let j = 0; j < boardWidth; j++) {
            board[i][j] = new Square(i, j, 0, false, false);
        }
    }

    function drawBoard() {
        console.log("Drawing board...");
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
                (randomRow < tlRow || randomRow > brRow || randomCol < tlCol || randomCol > brCol))
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

    function revealAdjacentSquares(square) {
        let tlRow = square.row; // Superior izquierda
        let tlCol = square.col;
        let brRow = square.row; // Inferior derecha
        let brCol = square.col;
        if (square.row >= 1) tlRow--;
        if (square.col >= 1) tlCol--;
        if (square.row <= boardHeight - 2) brRow++;
        if (square.col <= boardWidth - 2) brCol++;

        for (let row = tlRow; row <= brRow; row++) {
            for (let col = tlCol; col <= brCol; col++) {
                // console.log("Revealing", row, col);
                if (row === square.row && col === square.col) continue; // No comprobar el cuadrado actual
                if (board[row][col].revealed) continue; // Si ya está revelado, seguir con el siguiente
                if (board[row][col].flagged) continue; // Si está con bandera, no revelar

                board[row][col].revealed = true;
                if (board[row][col].content === 0) revealAdjacentSquares(board[row][col]); // Si es otro 0, revelar también sus adyacentes
                if (board[row][col].content === Constants.MINE_ID) {
                    // Si se revela una mina, se pierde la partida
                    onGameOver();
                }
            }
        }
    }

    function initEvents() {
        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("contextmenu", onRightClickListener, false);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
    }

    function stopEvents() {
        canvas.removeEventListener("click", onClickListener);
        canvas.removeEventListener("contextmenu", onRightClickListener, false);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
    }

    function onClickListener(event) {
        let clickedRow = Math.floor(event.offsetY / Constants.SQUARE_SIZE);
        let clickedCol = Math.floor(event.offsetX / Constants.SQUARE_SIZE);
        if (clickedRow >= boardHeight || clickedRow < 0 || clickedCol >= boardWidth || clickedCol < 0) return; // Comprobar dimensiones
        else if (board[clickedRow][clickedCol].revealed) { // Si ya está revelado, no hacemos nada
            if (isRightPressed) onLeftAndRightClickListener(event); // Si se hace click izquierdo y derecho, revelar adyacentes
            return;
        }
        else if (board[clickedRow][clickedCol].flagged) return; // Si está con bandera, no hacemos nada

        if (!boardGenerated) {
            generateBoard(board[clickedRow][clickedCol]); // Si es el primer click, generamos el tablero (nunca se debe generar una mina en el primer click, por eso se crea a partir de este click)
            chronoObj.start(setInterval(everySecond, 1000)); // Actualizar el cronómetro cada segundo (1000ms));
            boardGenerated = true;
        }

        board[clickedRow][clickedCol].revealed = true;
        
        if (board[clickedRow][clickedCol].content === 0) {
            // Si el cuadrado es 0, revelar todos los cuadrados adyacentes
            revealAdjacentSquares(board[clickedRow][clickedCol])
        }
        else if (board[clickedRow][clickedCol].content === Constants.MINE_ID) {
            // Si se hace click en una mina, se pierde la partida
            onGameOver();
        }
        
        console.log(clickedRow, clickedCol);
        drawBoard();
    }

    function onRightClickListener(event) {
        let clickedRow = Math.floor(event.offsetY / Constants.SQUARE_SIZE);
        let clickedCol = Math.floor(event.offsetX / Constants.SQUARE_SIZE);
        if (clickedRow >= boardHeight || clickedRow < 0 || clickedCol >= boardWidth || clickedCol < 0) return;
        event.preventDefault(); // Evitar que aparezca el menú contextual
        if (board[clickedRow][clickedCol].revealed) return; // Si está revelado, no se puede poner bandera


        // Se cambia el estado de la bandera
        board[clickedRow][clickedCol].flagged = !board[clickedRow][clickedCol].flagged;

        console.log(clickedRow, clickedCol);
        drawBoard();
        return false;
    }

    function onLeftAndRightClickListener(event) {
        let clickedRow = Math.floor(event.offsetY / Constants.SQUARE_SIZE);
        let clickedCol = Math.floor(event.offsetX / Constants.SQUARE_SIZE);
        if (clickedRow >= boardHeight || clickedRow < 0 || clickedCol >= boardWidth || clickedCol < 0) return; // Comprobar dimensiones
        revealAdjacentSquares(board[clickedRow][clickedCol]);

        drawBoard();
    }

    function onMouseDown(event) {
        if (event.button === 2) isRightPressed = true;
        // console.log("Mouse down", event.button)
    }

    function onMouseUp(event) {
        if (event.button === 2) isRightPressed = false;
        // console.log("Mouse up", event.button)
    }

    function onGameOver() {
        console.log("Game over");
        stopEvents();
        chronoObj.stop();
    }

    function everySecond() {
        const msTime = chronoObj.getElapsedTime();
        const seconds = chronoObj.zeroPad(Math.floor(msTime / 1000) % 60, 2);
        const minutes = chronoObj.zeroPad(Math.floor(msTime / 1000 / 60), 2);
        chronoText.textContent = `${minutes}:${seconds}`;
    }

    // Inicializar el juego
    drawBoard();
    initEvents();
});

/** TODO: list
 * - Si se hace click en un cuadrado con mina, se pierde la partida
 * - Si todos los cuadrados que no son minas han sido revelados, se gana la partida
 * - Si se pierde la partida, mostrar los cuadrados sin revelar y qué había en las casillas con banderas
 * - El easter egg es esquizofrénico
 * - En el backend implementar la fecha allí, ya no se hará desde el cliente
 * - El input de nombre también se comprobará el regex en el backend
 */