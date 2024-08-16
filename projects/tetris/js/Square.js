/**
 * La cuadrícula del tablero del juego está compuesta por cuadrados. Cada
 * cuadrado tiene su fila, columna y color. Además, en caso de ser el cuadrado
 * central, se debe marcar como tal para poder rotar el tetrominó correctamente.
 */
export class Square
{
    constructor(row, col, color, center = false) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.center = center;
    }
}