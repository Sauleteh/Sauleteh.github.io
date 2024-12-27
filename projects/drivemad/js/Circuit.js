import { Point, PointWithDirection } from './Point.js';

/**
 * Clase que representa un circuito para competir.
 * Las líneas que forman el circuito son segmentos: cada segmento puede ser una línea recta o un arco de círculo.
 * Para crear segmentos, utilizar las funciones estáticas.
 * Tener en cuenta que la creación del circuito se hace delimitando el centro del circuito.
 * Muy importante que, antes de añadir segmentos, se indique punto de inicio.
*/
export class Circuit {
    constructor(circuitWidth, lineWidth) {
        this.segments = []; // Las líneas que forman el circuito
        this.circuitWidth = circuitWidth; // Ancho del circuito en píxeles
        this.lineWidth = lineWidth; // Ancho de las líneas que delimitan el circuito
        this.startPoint = null; // Punto de inicio del circuito
    }

    addSegment(segment) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }
        else this.segments.push(segment);
    }

    /**
     * Obtener el segmento en el que se encuentra el coche, o null si está fuera del circuito.
     * @param {*} car es el coche que se quiere comprobar.
     * @param {*} precision es la precisión con la que se quiere comprobar si el coche está en el segmento. 1 indica que se comprobará todo el ancho del circuito, 0.5 la mitad, etc. La precisión es relativa al centro del circuito.
     * @returns objeto segment que contiene el segmento en el que se encuentra el coche, o null si está fuera del circuito.
     */
    getCurrentSegment(car, precision = 1) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.type === 'straight') {
                // Comprobar si el punto está dentro de la línea recta
                const segmentCenter = new Point(
                    (segment.data.start.x + segment.data.end.x) / 2,
                    (segment.data.start.y + segment.data.end.y) / 2
                );

                // Diferencia entre las coordenadas del coche y la del segmento
                const translated = new Point(
                    car.coords.x - segmentCenter.x,
                    car.coords.y - segmentCenter.y
                );

                const cosAngle = Math.cos(-segment.ref.direction * Math.PI / 180);
                const sinAngle = Math.sin(-segment.ref.direction * Math.PI / 180);

                // Deshacemos la rotación del segmento
                const rotated = new Point(
                    translated.x * cosAngle - translated.y * sinAngle,
                    translated.x * sinAngle + translated.y * cosAngle
                );

                if (rotated.x >= -segment.data.length / 2 && rotated.x <= segment.data.length / 2 && rotated.y >= -this.circuitWidth * precision / 2 && rotated.y <= this.circuitWidth * precision / 2) return segment;
            }
            else if (segment.type === 'arc') {
                // Comprobar si el punto está dentro del sector circular
                const dx = car.coords.x - segment.data.arcCenter.x;
                const dy = car.coords.y - segment.data.arcCenter.y;
                const distanceSquared = dx * dx + dy * dy;

                // Si se está fuera del radio exterior o interior, ya se confirma que se está fuera
                if (distanceSquared > (segment.data.radius + this.circuitWidth * precision / 2) * (segment.data.radius + this.circuitWidth * precision / 2)) continue;
                else if (distanceSquared < (segment.data.radius - this.circuitWidth * precision / 2) * (segment.data.radius - this.circuitWidth * precision / 2)) continue;

                // Si se está dentro, calcular si el coche está en el ángulo correcto del círculo
                let pointAngle = Math.atan2(dy, dx);
                if (pointAngle < 0) pointAngle += 2 * Math.PI;

                const normalizedStartAngle = (segment.data.startAngle + 2 * Math.PI) % (2 * Math.PI);
                const normalizedEndAngle = (segment.data.endAngle + 2 * Math.PI) % (2 * Math.PI);

                if (segment.data.isClockwise) {
                    if (normalizedStartAngle < normalizedEndAngle) {
                        if (pointAngle >= normalizedStartAngle && pointAngle <= normalizedEndAngle) return segment;
                    }
                    else if (pointAngle >= normalizedStartAngle || pointAngle <= normalizedEndAngle) return segment;
                }
                else {
                    if (normalizedStartAngle < normalizedEndAngle) {
                        if (pointAngle <= normalizedStartAngle || pointAngle >= normalizedEndAngle) return segment;
                    }
                    else if (pointAngle <= normalizedStartAngle && pointAngle >= normalizedEndAngle) return segment;
                }
            }
        }
        return null;
    }

    // Comprobar si el coche está dentro del circuito
    isCarInside(car) {
        const currentSegment = this.getCurrentSegment(car);
        if (currentSegment === null) return false;
        else return true;
    }

    // Obtener el lado en el que está el coche en un segmento de arco, retornando "inside" si está en la parte interior, "outside" si está en la parte exterior. NO se comprueba si está dentro del segmento.
    getArcSide(car, segment) {
        if (segment.type !== 'arc') throw new Error('El segmento no es un arco');

        const dx = car.coords.x - segment.data.arcCenter.x;
        const dy = car.coords.y - segment.data.arcCenter.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= segment.data.radius * segment.data.radius) return 'inside';
        else return 'outside';
    }

    // Obtener el ángulo de un punto respecto al centro de un segmento de arco. NO se comprueba si está dentro del segmento.
    getArcAngle(car, segment) {
        if (segment.type !== 'arc') throw new Error('El segmento no es un arco');

        const dx = car.coords.x - segment.data.arcCenter.x;
        const dy = car.coords.y - segment.data.arcCenter.y;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        return angle * 180 / Math.PI;
    }

    // Dirección en grados
    setStartPoint(x, y, direction) {
        this.startPoint = new PointWithDirection(x, y, direction);
    }

    // Línea recta: longitud en píxeles
    straightLine(length) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }

        const currentPoint = this.segments.length === 0 ? this.startPoint : this.segments[this.segments.length-1].ref;

        const startCoords = new Point(
            currentPoint.coords.x,
            currentPoint.coords.y
        );

        const endCoords = new Point(
            Math.cos(currentPoint.direction * Math.PI / 180) * length + currentPoint.coords.x,
            Math.sin(currentPoint.direction * Math.PI / 180) * length + currentPoint.coords.y
        );

        return {
            type: 'straight',
            ref: new PointWithDirection(endCoords.x, endCoords.y, currentPoint.direction),
            data: {
                start: startCoords,
                end: endCoords,
                widthSin: this.circuitWidth * Math.sin(currentPoint.direction * Math.PI / 180) / 2,
                widthCos: this.circuitWidth * Math.cos(currentPoint.direction * Math.PI / 180) / 2,
                length: length
            }
        }
    }

    // Curva: radio en píxeles y ángulo en grados
    arc(radius, angle) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }

        const currentPoint = this.segments.length === 0 ? this.startPoint : this.segments[this.segments.length-1].ref;
        const angleDirection = angle > 0 ? -90 : 90;
        const angleSign = angle > 0 ? 1 : -1;

        const center = new Point(
            currentPoint.coords.x - Math.cos((currentPoint.direction + angleDirection) * Math.PI / 180) * radius,
            currentPoint.coords.y - Math.sin((currentPoint.direction + angleDirection) * Math.PI / 180) * radius
        );

        const reference = new Point(
            center.x + Math.cos(((currentPoint.direction + angleDirection * angleSign) + angle) * Math.PI / 180) * radius * angleSign,
            center.y + Math.sin(((currentPoint.direction + angleDirection * angleSign) + angle) * Math.PI / 180) * radius * angleSign
        );

        return {
            type: 'arc',
            ref: new PointWithDirection(reference.x, reference.y, currentPoint.direction + angle),
            data: {
                arcCenter: center,
                radius: radius,
                startAngle: (currentPoint.direction + angleDirection) * Math.PI / 180, // En radianes
                endAngle: ((currentPoint.direction + angleDirection) + angle) * Math.PI / 180, // En radianes
                isClockwise: angle > 0
            }
        }
    }
}