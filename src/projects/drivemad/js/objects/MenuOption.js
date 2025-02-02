/**
 * Clase que representa una opción para el menú (label, clickable).
 */
export class MenuOption {
    /**
     * Opción representada como una etiqueta de texto.
     * @param {string} label Etiqueta a mostrar
     * @param {*} handler Función a ejecutar al hacer clic en la opción
     * @param {number} x Posición X del texto en la esquina superior izquierda
     * @param {number} y Posición Y del texto en la esquina superior izquierda
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

/**
 * Clase que representa un botón para el menú (botón sin label con imagen, clickable).
 */
export class MenuButton {
    /**
     * Opción representada como un botón.
     * @param {number} x Posición X del botón en la esquina superior izquierda
     * @param {number} y Posición Y del botón en la esquina superior izquierda
     * @param {number} width Ancho del botón
     * @param {number} height Alto del botón
     * @param {*} handler Función a ejecutar al hacer clic en el botón
     * @param {MenuImage} image Imagen a mostrar en el botón
     */
    constructor(x, y, width, height, handler, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.handler = handler;
        this.image = image;
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}

/**
 * Clase que representa una imagen (información de la imagen, no clickable).
 */
export class MenuImage {
    /**
     * Una imagen asociada a una opción de menú.
     * @param {number} x Es el valor de la coordenada X de la esquina superior izquierda de la imagen en el sprite
     * @param {number} y Es el valor de la coordenada Y de la esquina superior izquierda de la imagen en el sprite
     * @param {number} width Es el ancho de la imagen en el sprite
     * @param {number} height Es el alto de la imagen en el sprite
     * @param {string} sprite Es el ID del conjunto de imágenes (sprite) que contiene la imagen
     */
    constructor(x, y, width, height, sprite) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
    }
}