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

    // Dependiendo del tipo de segmento, se debe comprobar de una forma u otra
    isCarInside(car) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.type === 'straight') {
                // Comprobar si el punto está dentro de la línea recta
                const segmentCenter = new Point(
                    (segment.data.start.x + segment.data.end.x) / 2,
                    (segment.data.start.y + segment.data.end.y) / 2
                );

                const translated = new Point(
                    car.coords.x - segmentCenter.x,
                    car.coords.y - segmentCenter.y
                );

                const cosAngle = Math.cos(-segment.ref.direction * Math.PI / 180);
                const sinAngle = Math.sin(-segment.ref.direction * Math.PI / 180);

                const rotated = new Point(
                    translated.x * cosAngle - translated.y * sinAngle,
                    translated.x * sinAngle + translated.y * cosAngle
                );

                return (
                    rotated.x >= -segment.data.length / 2 && rotated.x <= segment.data.length / 2 &&
                    rotated.y >= -this.circuitWidth / 2 && rotated.y <= this.circuitWidth / 2
                );
            }
            else if (segment.type === 'arc') {
                // Comprobar si el punto está dentro del sector circular
            
            }
        }
        return false;
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
                startAngle: (currentPoint.direction + angleDirection) * Math.PI / 180,
                endAngle: ((currentPoint.direction + angleDirection) + angle) * Math.PI / 180,
                isClockwise: angle > 0,
            }
        }
    }
}