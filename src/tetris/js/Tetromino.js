import * as Constants from './Constants.js';
import { Square } from './Square.js';

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
        this.squares = this.randomPiece();
    }

    next() {
        this.squares = this.randomPiece();
    }

    randomPiece() {
        const pieces = [
            this.pieceI(),
            this.pieceJ(),
            this.pieceL(),
            this.pieceO(),
            this.pieceS(),
            this.pieceT(),
            this.pieceZ()
        ];

        return pieces[Math.floor(Math.random() * pieces.length)];
    }

    pieceI() {
        return [
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "cyan"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "cyan"),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "cyan"),
            new Square(1, 3 + Math.ceil(Constants.BOARD_WIDTH / 4), "cyan")
        ];
    }

    pieceJ() {
        return [
            new Square(0, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "blue"),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "blue"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "blue"),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "blue")
        ];
    }

    pieceL() {
        return [
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "orange"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "orange"),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "orange"),
            new Square(0, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "orange")
        ];
    }

    pieceO() {
        return [
            new Square(0, 0 + Math.ceil(Constants.BOARD_WIDTH / 3), "yellow"),
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 3), "yellow"),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 3), "yellow"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 3), "yellow")
        ];
    }

    pieceS() {
        return [
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "green"),
            new Square(0, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "green"),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "green"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "green")
        ];
    }

    pieceT() {
        return [
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "purple"),
            new Square(1, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "purple"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "purple"),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "purple")
        ];
    }

    pieceZ() {
        return [
            new Square(0, 0 + Math.ceil(Constants.BOARD_WIDTH / 4), "red"),
            new Square(0, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "red"),
            new Square(1, 1 + Math.ceil(Constants.BOARD_WIDTH / 4), "red"),
            new Square(1, 2 + Math.ceil(Constants.BOARD_WIDTH / 4), "red")
        ];
    }
}