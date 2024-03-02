/**
 * La cuadrícula del tablero del juego está compuesta por cuadrados. Cada
 * cuadrado tiene su fila, columna y color.
 */
export class Square
{
    constructor(row, col, color) {
        this.row = row;
        this.col = col;
        this.color = color;
    }
}