import { CARS } from "./Constants.js";

/**
 * Clase que tiene como función ayudar a la clase Car para realizar cálculos relacionados con las variables de los coches.
 */
export class CarUtils {
    constructor() {}

    absoluteSpeed(car) {
        return Math.sqrt(Math.pow(car.speed.x, 2) + Math.pow(car.speed.y, 2));
    }

    speedAngle(car) {
        const speedAngleFake = Math.atan2(car.speed.y, car.speed.x) * 180 / Math.PI; // De 0 a 180 y luego de -180 a 0
        return (((speedAngleFake < 0) ? 360 : 0) + speedAngleFake); // Transformamos el ángulo a 0-360
    }

    isSpeedNegative(car) {
        const diff = car.direction - this.speedAngle(car);
        return Math.abs(((diff < 0 ? 360 : 0) + diff) - 180) <= 90;
    }

    /**
     * Máxima velocidad teórica que puede alcanzar el coche sin tener en cuenta factores que permitan superar la velocidad máxima (como el turbo).
     * Tener en cuenta que si en cualquier momento del desarrollo cambian las funciones de cálculo de velocidad, deberá cambiarse esta función también.
     * @param {Car} car El coche.
     * @param {number} movingAirFriction La fricción del aire cuando el coche está en movimiento.
     * @returns 
     */
    maxSpeed(car, movingAirFriction) {
        return (1-movingAirFriction) / movingAirFriction * car.speedPower;
    }

    /**
     * Reinicia el coche.
     * @param {Car} car - El coche.
     * @param {PointWithDirection} startPoint - Punto de inicio del circuito.
     */
    reset(car, startPoint) {
        car.speed.x = 0;
        car.speed.y = 0;
        car.isDrifting = false;
        car.isAccelerating = false;
        car.isInsideCircuit = true;
        car.driftCancelCounter = car.driftCancelMax;
        car.boostCounter = 1;
        car.boostLastUsed = 0;
        car.isPressingAccelerateOrBrake = false;

        car.coords = structuredClone(startPoint.coords);
        car.lastCoords = structuredClone(car.coords);
        car.direction = startPoint.direction;
        car.lastDirection = car.direction;
    }

    /**
     * Reinicia todos los coches.
     * @param {Car[]} cars La lista de coches.
     * @param {PointWithDirection} startPoint Punto de inicio del circuito.
     */
    resetAll(cars, startPoint) {
        for (let i = 0; i < cars.length; i++) {
            this.reset(cars[i], startPoint);
        }
    }

    /**
     * Devuelve un coche por defecto.
     * @returns {Car} Coche por defecto.
     */
    defaultCar() {
        return structuredClone(CARS[0]);
    }
}