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
}