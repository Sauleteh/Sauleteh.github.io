/**
 * Un coche es un rectángulo.
 * @param {Point} coords - Las coordenadas XY del coche.
 * @param {number} direction - La dirección del coche en grados.
 * @param {number} width - El ancho del coche.
 * @param {number} height - La altura del coche.
 * @param {string} color - El color del coche.
 * @param {Point} speed - La velocidad del coche como un vector 2D.
 */
export class Car
{
    constructor(coords, direction, width, height, color, speed) {
        this.coords = coords;
        this.direction = direction;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }
}