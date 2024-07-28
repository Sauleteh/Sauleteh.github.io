/**
 * Un cuadrado está posicionado en cada combinación de fila y columna de un tablero.
 * 
 * Existen tres capas en el tablero del buscaminas: 
 * - La capa inferior donde se encuentra el contenido
 * - La capa media donde se sabe si está revelado o no
 * - La capa superior donde se encuentran las banderas
 * 
 * Si el cuadrado está revelado, se muestra el contenido,
 * si no, se muestra la bandera si está puesta.
 * 
 * @param {number} row - Fila del cuadrado
 * @param {number} col - Columna del cuadrado
 * @param {number} content - Contenido del cuadrado (0-8 para números, -1 para la mina)
 * @param {boolean} revealed - Si el cuadrado está revelado
 * @param {boolean} flagged - Si el cuadrado está con bandera
 */
export class Square
{
    constructor(row, col, content, revealed, flagged) {
        this.row = row;
        this.col = col;
        this.content = content;
        this.revealed = revealed;
        this.flagged = flagged;
    }
}