/**
 * Un coche es un rectángulo.
 * @param {Point} coords - Las coordenadas XY del coche.
 * @param {number} direction - La dirección del coche en grados. 0 grados es la derecha, 90 grados es arriba, 180 grados es la izquierda y 270 grados es abajo.
 * @param {number} width - El ancho del coche.
 * @param {number} height - La altura del coche.
 * @param {string} color - El color del coche.
 * @param {Point} speed - La velocidad del coche como un vector 2D.
 * @param {number} accelerationPower - Poder al acelerar el coche.
 * @param {number} brakingPower - Poder al frenar el coche.
 * @param {number} turnForce - Fuerza de giro del coche.
 * @param {number} turnForceThreshold - Velocidad a la que debe llegar el coche para alcanzar la máxima fuerza de giro (ya que cuanta más velocidad, más giro hasta llegado a este límite).
 * @param {number} driftingTurnMultiplier - Al derrapar, se multiplica la fuerza de giro del coche por este valor.
 * @param {number} smokeParticleSize - Tamaño de las partículas de humo del coche.
 * @param {number} smokeParticleRandomness - Aleatoriedad de movimiento de las partículas del humo del coche.
 */
export class Car
{
    constructor(coords, direction, width, height, color, speed, accelerationPower, brakingPower, turnForce, turnForceThreshold, driftingTurnMultiplier, smokeParticleSize, smokeParticleRandomness) {
        this.coords = coords;
        this.direction = direction;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.accelerationPower = accelerationPower;
        this.brakingPower = brakingPower;
        this.turnForce = turnForce;
        this.turnForceThreshold = turnForceThreshold;
        this.driftingTurnMultiplier = driftingTurnMultiplier;
        this.smokeParticleSize = smokeParticleSize;
        this.smokeParticleRandomness = smokeParticleRandomness;

        this.lastDirection = direction;
        this.isDrifting = false;
        this.isAccelerating = false; // True si está acelerando, false si está frenando (si no está haciendo ninguna de las dos, su estado no cambia, se queda en el estado que ya tiene)
        this.isInsideCircuit = true;
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
        return Math.abs(((diff < 0 ? 360 : 0) + diff) - 180) <= 90;
    }
}