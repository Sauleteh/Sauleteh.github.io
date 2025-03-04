import { Point } from './Point.js';

export class Car
{
    /**
     * Representa un coche en el juego.
     * @param {string} name - El nombre del conductor.
     * @param {Point} coords - Las coordenadas XY del coche.
     * @param {number} direction - La dirección del coche en grados. 0 grados es la derecha, 90 grados es arriba, 180 grados es la izquierda y 270 grados es abajo.
     * @param {number} width - El ancho del coche.
     * @param {number} height - La altura del coche.
     * @param {MenuImage} image - El objeto que contiene la información de la imagen del coche.
     * @param {number} color - El color del coche como número del 0 al 359, pues se usa para shiftear el color de la imagen del coche.
     * @param {number} speedPower - Poder de velocidad del coche, es decir, lo máximo que puede acelerar el coche.
     * @param {number} accelerationPower - Poder de aceleración del coche, es decir, lo rápido que acelera el coche. Cuanto más alto, más rápido acelera.
     * @param {number} brakingPower - Poder multiplicativo de frenado del coche. Cuanto más alto, más rápido y mejor frena el coche.
     * @param {number} turnForce - Fuerza de giro del coche.
     * @param {number} turnForceThreshold - Velocidad a la que debe llegar el coche para alcanzar la máxima fuerza de giro (ya que cuanta más velocidad, más giro hasta llegado a este límite).
     * @param {number} driftingTurnMultiplier - Al derrapar, se multiplica la fuerza de giro del coche por este valor.
     * @param {number} boostMultiplier - Multiplicador de velocidad al usar el turbo del coche.
     * @param {number} boostDuration - Duración del turbo del coche en milisegundos.
     */
    constructor(name, coords, direction, width, height, image, color, speedPower, accelerationPower, brakingPower, turnForce, turnForceThreshold, driftingTurnMultiplier, boostMultiplier, boostDuration) {
        if (width <= 0 || height <= 0) throw new Error('El ancho y la altura del coche deben ser mayores que 0.');
        if (speedPower < 0.5) throw new Error('El poder de velocidad del coche debe ser mayor o igual a 0.5.');
        if (accelerationPower < 1.1) throw new Error('El poder de aceleración del coche debe ser mayor o igual a 1.1.');
        if (brakingPower <= 0) throw new Error('El poder de frenado del coche debe ser mayor que 0.');
        if (turnForce <= 0) throw new Error('La fuerza de giro del coche debe ser mayor que 0.');
        if (turnForceThreshold <= 0) throw new Error('El umbral de velocidad de la fuerza de giro del coche debe ser mayor que 0.');
        if (driftingTurnMultiplier < 1.0) throw new Error('El multiplicador de fuerza de giro al derrapar del coche debe ser mayor o igual a 1.0.');
        if (boostMultiplier <= 0) throw new Error('El multiplicador de velocidad al usar el turbo del coche debe ser mayor que 0.');
        if (boostDuration <= 0) throw new Error('La duración del turbo del coche debe ser mayor que 0.');
        if (width * height <= 300) throw new Error('El tamaño del coche es demasiado pequeño.');

        this.name = name;
        this.coords = coords;
        this.direction = direction;
        this.width = width;
        this.height = height;
        this.image = image;
        this.color = color;
        this.speedPower = speedPower;
        this.accelerationPower = accelerationPower;
        this.brakingPower = brakingPower;
        this.turnForce = turnForce;
        this.turnForceThreshold = turnForceThreshold;
        this.driftingTurnMultiplier = driftingTurnMultiplier;
        this.boostMultiplier = boostMultiplier;
        this.boostDuration = boostDuration;

        this.particleSize = Math.round(this.height * this.width / 100 - 3);
        this.particleRandomness = Math.ceil(this.particleSize / 2) + 1;

        this.id = null; // Identificador del coche para el online
        this.speed = new Point(0, 0); // Las coordenadas XY del coche (Es una clase Point)
        this.lastCoords = new Point(coords.x, coords.y); // Las últimas coordenadas XY del coche que hubo en el frame anterior (Es una clase Point)
        this.lastDirection = direction;
        this.isDrifting = false;
        this.isAccelerating = false; // True si está acelerando, false si está frenando (si no está haciendo ninguna de las dos, su estado no cambia, se queda en el estado que ya tiene)
        this.isInsideCircuit = true;
        this.driftCancelMax = 20; // Número de frames que se deben mantener en línea recta para dejar de derrapar
        this.driftCancelCounter = this.driftCancelMax; // Si este contador llega a un número determinado después de tener el coche en línea recta un número de frames dado, se considera que se está dejando de derrapar (no empieza en 0 para que no se considere que se está dejando de derrapar al principio)
        this.boostCounter = 1; // Número de turbos disponibles. Al principio, todos los coches comienzan con un turbo disponible
        this.boostLastUsed = 0; // Último momento en el que se usó el turbo (0 si no se está usando, mayor que 0 en caso contrario)
        this.isPressingAccelerateOrBrake = false; // True si se está pulsando el acelerador o el freno, false en caso contrario
        this.isPressingHorn = false; // True si se está pulsando el claxon, false en caso contrario
    }

    //! IMPORTANTE: No añadir métodos de obtención de datos aquí, no se enviarán al servidor. Para añadir métodos de obtención de datos, añadirlos en el archivo CarUtils.js.
}