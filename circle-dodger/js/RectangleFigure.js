import { CircleFigure } from './CircleFigure.js';

/**
 * Clase que define una figura rectangular.
 * @param {number} x - La posición en el eje x de la figura (esquina superior izquierda).
 * @param {number} y - La posición en el eje y de la figura (esquina superior izquierda).
 * @param {number} width - El ancho de la figura.
 * @param {number} height - La altura de la figura.
 * @param {string} color - El color de la figura.
 */
export class RectangleFigure
{
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    /**
     * Método que comprueba si un punto está dentro de la figura.
     * @param {number} pX 
     * @param {number} pY 
     */
    isPointInside(pX, pY) {
        return pX >= this.x && pX <= this.x + this.width && pY >= this.y && pY <= this.y + this.height;
    }

    /**
     * Método que comprueba si la figura colisiona con otra figura.
     * @param {CircleFigure|RectangleFigure} figure 
     */
    isCollidingWith(figure) {
        if (figure instanceof CircleFigure) {
            let closestX = Math.max(this.x, Math.min(figure.x, this.x + this.width));
            let closestY = Math.max(this.y, Math.min(figure.y, this.y + this.height));
            return Math.sqrt(Math.pow(figure.x - closestX, 2) + Math.pow(figure.y - closestY, 2)) < figure.radius;
        }
        else if (figure instanceof RectangleFigure) {
            return this.x < figure.x + figure.width && this.x + this.width > figure.x && this.y < figure.y + figure.height && this.y + this.height > figure.y;
        }
    }

    /**
     * Método que comprueba si la figura está fuera del canvas.
     * @param {HTMLCanvasElement} canvas 
     */
    isOutOfCanvas(canvas) {
        return this.x < 0 || this.x + this.width > canvas.width || this.y < 0 || this.y + this.height > canvas.height;
    }
}