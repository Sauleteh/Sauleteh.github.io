export class Chronometer
{
    constructor() {
        this.startTime = 0;
    }

    /** Guarda el tiempo de comienzo
     * @param {number} intervalId - Identificador de la función que será llamada periódicamente una vez se haga start(), es decir, el valor devuelto por setInterval(<función>, <intervalo>)
    */
    start(intervalId) {
        this.startTime = performance.now();
        this.intervalId = intervalId;
    }

    // Detiene la ejecución peródica de la función asignada en start()
    stop() { clearInterval(this.intervalId); }

    // Devuelve el tiempo transcurrido desde el inicio
    getElapsedTime() { return performance.now() - this.startTime; }

    // Convertidor de números con ceros a la izquierda
    zeroPad(num, places) { return String(num).padStart(places, '0'); }
}