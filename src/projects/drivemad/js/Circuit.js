import { Point, PointWithDirection } from './Point.js';

/**
 * Clase que representa un circuito para competir.
 * Las líneas que forman el circuito son segmentos: cada segmento puede ser una línea recta o un arco de círculo.
 * Para crear segmentos, utilizar las funciones estáticas.
 * Tener en cuenta que la creación del circuito se hace delimitando el centro del circuito.
 * Muy importante que, antes de añadir segmentos, se indique punto de inicio.
*/
export class Circuit {
    constructor(width) {
        this.segments = []; // Las líneas que forman el circuito
        this.width = width; // Ancho del circuito en píxeles
        this.startPoint = null; // Punto de inicio del circuito
    }

    addSegment(segment) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }
        else this.segments.push(segment);
    }

    // Dependiendo del tipo de segmento, se debe comprobar de una forma u otra
    isCarInside(x, y) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.type === 'straight') {
                // Comprobar si el punto está dentro de la línea recta
            } else if (segment.type === 'arc') {
                // Comprobar si el punto está dentro del arco de círculo
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
                widthSin: this.width * Math.sin(currentPoint.direction * Math.PI / 180) / 2,
                widthCos: this.width * Math.cos(currentPoint.direction * Math.PI / 180) / 2
            }
        }
    }

    // Curva: radio en píxeles y ángulo en grados
    arc(radius, angle) {
        return {
            type: 'arc',
            data: {
                coords: new Point(0, 0),
                radius: radius,
                startAngle: 0,
                endAngle: angle
            }
        }
    }
}