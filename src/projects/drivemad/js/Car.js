/**
 * Un coche es un rectángulo.
 * @param {Point} coords - Las coordenadas XY del coche.
 * @param {number} direction - La dirección del coche en grados. 0 grados es la derecha, 90 grados es arriba, 180 grados es la izquierda y 270 grados es abajo.
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
        this.lastDirection = direction;
    }

    get absoluteSpeed() {
        return Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
    }
}