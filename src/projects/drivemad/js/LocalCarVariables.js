/**
 * Variables especiales para un coche.
 * Se ubican aquí en vez de en la clase Car para que no se envíen al servidor y que se queden únicamente en el cliente.
 */
export class LocalCarVariables {
    constructor() {
        this.smokeParticles = []; // Array de puntos "point" donde están localizadas las partículas del humo cuando se derrapa y con una variable "life" que indica la vida que le queda a la partícula para desaparecer
    }
}