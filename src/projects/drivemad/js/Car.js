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
        this.isDrifting = false;
        this.driftCancelCounter = 0; // Si este contador llega a un número determinado después de tener el coche en línea recta un número de frames dado, se considera que se está dejando de derrapar
        this.smokeParticles = []; // Array de puntos "point" donde están localizadas las partículas del humo cuando se derrapa y con una variable "life" que indica la vida que le queda a la partícula para desaparecer
    }

    get absoluteSpeed() {
        return Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
    }

    get isSpeedNegative() {
        const negSpeedAngle = Math.atan2(this.speed.y, this.speed.x) * 180 / Math.PI; // De 0 a 180 y luego de -180 a 0
        const negSpeedReal = (((negSpeedAngle < 0) ? 360 : 0) + negSpeedAngle); // Transformamos el ángulo a 0-360
        const diff = this.direction - negSpeedReal;
        return Math.abs(((diff < 0 ? 360 : 0) + diff) - 180) <= 5;
    }
}