/**
 * Nueva versión para el cálculo de delta time para mis juegos.
 * Créditos: https://stackoverflow.com/questions/25612452/html5-canvas-game-loop-delta-time-calculations (markE)
 * @param {number} desiredFPS - El número de FPS deseado para el juego.
 */
export class FPSControllerV2
{
    constructor(desiredFPS)
    {
        this.requiredElapsed = 1000 / desiredFPS;
        this.lastTime = 0;
        this.elapsed = 0;
    }

    /**
     * Comprueba si se debe continuar con el bucle del juego.
     * @param {*} now - El tiempo actual obtenido desde requestAnimationFrame.
     * @returns {boolean} - Devuelve true si se debe continuar con el bucle del juego.
     * Si es true, al terminar este método y lo que venga después, se debe actualizar
     * this.lastTime con el valor de now (utilizar updateLastTime para ello).
     */
    shouldContinue(now) {
        if (!this.lastTime) this.lastTime = now;
        this.elapsed = now - this.lastTime;
        return this.elapsed > this.requiredElapsed
    }

    /**
     * Actualiza el valor de lastTime con el valor obtenido de requestAnimationFrame.
     * @param {*} now - El tiempo actual obtenido desde requestAnimationFrame.
     */
    updateLastTime(now) {
        this.lastTime = now;
    }

    get deltaTime() {
        return this.elapsed / 30;
    }
}