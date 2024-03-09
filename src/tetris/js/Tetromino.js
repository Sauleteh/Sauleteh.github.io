import * as Constants from './Constants.js';
import { Square } from './Square.js';
import { board } from './tetris.js';

/**
 * El tetromino es la pieza que cae en el tablero. Cada tetromino está compuesto
 * por un conjunto de cuadrados y en el Tetris original hay 7 tipos de piezas.
 * 
 * Las piezas deben estar centradas en el tablero, por eso, al calcular la columna de
 * cada cuadrado, se suma la división del ancho del tablero entre un número que permita centrar la pieza.
 */
export class Tetromino
{
    constructor() {
        this.bag = this.getAllPieces();
        this.shuffleBag(this.bag);
        this.squares = this.bag.pop();
    }

    shuffleBag(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Explicación detallada del algoritmo en https://www.baeldung.com/cs/tetris-piece-rotation-algorithm
    rotate(degree) {
        if (this.centerSquare === null) { return; } // Los tetrominós sin un centro no pueden rotar (como el O)

        const beta = degree * Math.PI / 180;
        const rotatedSquares = [];
        
        for (let i = 0; i < this.squares.length; i++) {
            const square = this.squares[i];
            const x = square.col - this.centerSquare.col;
            const y = square.row - this.centerSquare.row;

            const col = Math.round(x * Math.cos(beta) - y * Math.sin(beta) + this.centerSquare.col);
            const row = Math.round(x * Math.sin(beta) + y * Math.cos(beta) + this.centerSquare.row);

            rotatedSquares.push(new Square(row, col, square.color, square.center));
        }

        // Comprobar si la rotación es válida (no colisiona con otras piezas o con el tablero)

        // Si la pieza se sale del tablero verticalmente o choca con un cuadrado, no es una rotación válida
        for (let i = 0; i < rotatedSquares.length; i++) {
            const square = rotatedSquares[i];
            if (square.row < 0 || square.row >= Constants.BOARD_HEIGHT || board[square.row][square.col] !== null) {
                return;
            }
        }

        // Si la pieza se sale del tablero horizontalmente o choca con un cuadrado, intentar moverla para que entre en el tablero
        let tries = 0;
        for (let i = 0; i < rotatedSquares.length; i++) {
            if (tries > 2) { return; } // Si se intenta mover la pieza más de 2 veces, no es una rotación válida (el tetrominó choca en ambos lados y por tanto no tiene espacio para rotar)

            const square = rotatedSquares[i];
            if (square.col < 0 || square.col >= Constants.BOARD_WIDTH || board[square.row][square.col] !== null) {
                const offset = square.col < 0 ? 1 : -1;
                tries++;
                for (let j = 0; j < rotatedSquares.length; j++) {
                    rotatedSquares[j].col += offset;
                }
                i = -1;
            }
        }

        this.squares = rotatedSquares;
    }

    rotateClockwise() { this.rotate(90); }
    rotateCounterClockwise() { this.rotate(-90); }

    // Recoge la siguiente pieza de la bolsa
    next() {
        this.checkBag();
        this.squares = this.bag.pop();
    }

    // Recoloca la pieza en su lugar original
    resetPosition() {
        // Los tipo de pieza están asociados a su color, por lo que se puede saber qué tipo de pieza es mediante el color del primer cuadrado
        switch (this.squares[0].color) {
            case Constants.TETROMINO.I: this.squares = this.pieceI(); break;
            case Constants.TETROMINO.J: this.squares = this.pieceJ(); break;
            case Constants.TETROMINO.L: this.squares = this.pieceL(); break;
            case Constants.TETROMINO.O: this.squares = this.pieceO(); break;
            case Constants.TETROMINO.S: this.squares = this.pieceS(); break;
            case Constants.TETROMINO.T: this.squares = this.pieceT(); break;
            case Constants.TETROMINO.Z: this.squares = this.pieceZ(); break;
        }
    }

    // Comprueba si la bolsa de piezas está vacía, la rellena en tal caso y la mezcla
    checkBag() {
        if (this.bag.length === 0) {
            this.bag = this.getAllPieces();
            this.shuffleBag(this.bag);
        }
    }

    randomPiece() {
        const pieces = this.getAllPieces();
        return pieces[Math.floor(Math.random() * pieces.length)];
    }

    getAllPieces() {
        const pieces = [
            this.pieceI(),
            this.pieceJ(),
            this.pieceL(),
            this.pieceO(),
            this.pieceS(),
            this.pieceT(),
            this.pieceZ()
        ];
        return pieces;
    }

    pieceI() {
        return [
            new Square(2, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.CYAN),
            new Square(2, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.CYAN),
            new Square(2, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.CYAN, true),
            new Square(2, 3 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.CYAN)
        ];
    }

    pieceJ() {
        return [
            new Square(0, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.BLUE),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.BLUE),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.BLUE, true),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.BLUE)
        ];
    }

    pieceL() {
        return [
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.ORANGE),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.ORANGE, true),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.ORANGE),
            new Square(0, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.ORANGE)
        ];
    }

    pieceO() {
        return [
            new Square(0, 0 + Math.ceil(Constants.BOARD_WIDTH / 3), Constants.COLORS.YELLOW),
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 3), Constants.COLORS.YELLOW),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 3), Constants.COLORS.YELLOW),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 3), Constants.COLORS.YELLOW)
        ];
    }

    pieceS() {
        return [
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.GREEN, true),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.GREEN),
            new Square(2, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.GREEN),
            new Square(2, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.GREEN)
        ];
    }

    pieceT() {
        return [
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.PURPLE),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.PURPLE),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.PURPLE, true),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.PURPLE)
        ];
    }

    pieceZ() {
        return [
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.RED),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.RED, true),
            new Square(2, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.RED),
            new Square(2, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), Constants.COLORS.RED)
        ];
    }

    get centerSquare() {
        for (let i = 0; i < this.squares.length; i++) {
            const square = this.squares[i];
            if (square.center) {
                return square;
            }
        }
        return null; // Los tetrominós sin un centro no pueden rotar
    }
}