/**
 * Clase que representa una opción para el menú.
 */
export class MenuOption {
    /**
     * 
     * @param {*} label Etiqueta a mostrar
     * @param {*} handler Función a ejecutar al hacer clic en la opción
     * @param {*} x Posición X del texto en la esquina superior izquierda
     * @param {*} y Posición Y del texto en la esquina superior izquierda
     */
    constructor(label, handler, x, y) {
        this.label = label;
        this.handler = handler;
        this.x = x;
        this.y = y;

        this.width = undefined; // Ancho del texto, se debe calcular con setTextWidth para ser actualizado
        this.height = undefined; // Alto del texto, se debe calcular con setTextHeight para ser actualizado
    }

    setTextWidth(ctx) {
        this.width = ctx.measureText(this.label).width;
    }

    setTextHeight(ctx) {
        const metrics = ctx.measureText(this.label);
        this.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }

    isPointInside(x, y) {
        if (this.width === undefined || this.height === undefined) throw new Error("Debes llamar a setTextWidth y setTextHeight antes de llamar a isPointInside");
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}