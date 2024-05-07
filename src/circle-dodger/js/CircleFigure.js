import { RectangleFigure } from './RectangleFigure.js';

/**
 * Clase que define una figura circular.
 * @param {number} x - La posición en el eje x de la figura.
 * @param {number} y - La posición en el eje y de la figura.
 * @param {number} radius - El radio de la figura.
 * @param {string} color - El color de la figura.
 */
export class CircleFigure
{
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    /**
     * Método que comprueba si un punto está dentro de la figura.
     * @param {number} pX 
     * @param {number} pY 
     */
    isPointInside(pX, pY) {
        return Math.sqrt(Math.pow(pX - this.x, 2) + Math.pow(pY - this.y, 2)) < this.radius;
    }

    /**
     * Método que comprueba si la figura colisiona con otra figura.
     * @param {CircleFigure|RectangleFigure} figure 
     */
    isCollidingWith(figure) {
        if (figure instanceof CircleFigure) {
            return Math.sqrt(Math.pow(this.x - figure.x, 2) + Math.pow(this.y - figure.y, 2)) < this.radius + figure.radius;
        }
        else if (figure instanceof RectangleFigure) {
            let closestX = Math.max(figure.x, Math.min(this.x, figure.x + figure.width));
            let closestY = Math.max(figure.y, Math.min(this.y, figure.y + figure.height));
            return Math.sqrt(Math.pow(this.x - closestX, 2) + Math.pow(this.y - closestY, 2)) < this.radius;
        }
    }

    /**
     * Método que comprueba si la figura está fuera del canvas.
     * @param {HTMLCanvasElement} canvas 
     */
    isOutOfCanvas(canvas) {
        return this.x - this.radius < 0 || this.x + this.radius > canvas.width || this.y - this.radius < 0 || this.y + this.radius > canvas.height;
    }
}