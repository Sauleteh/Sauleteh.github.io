/**
 * Variables especiales para un coche.
 * Se ubican aquí en vez de en la clase Car para que no se envíen al servidor y que se queden únicamente en el cliente.
 */
export class LocalCarVariables {
    constructor(car, ctx) {
        this.init(car, ctx);
    }

    init(car, ctx) {
        this.smokeParticles = []; // Array de puntos "point" donde están localizadas las partículas del humo cuando se derrapa y con una variable "life" que indica la vida que le queda a la partícula para desaparecer
        this.boostParticles = []; // Array de puntos "point" donde están localizadas las partículas del boost y con una variable "life" que indica la vida que le queda a la partícula para desaparecer

        // Gradiente para la luz del coche por debajo
        this.neonGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, car.width); // X e Y son 0 porque se dibuja en el centro del coche el cual está desplazado en el contexto del canvas
        this.neonGlow.addColorStop(1, "transparent");
        this.neonGlow.addColorStop(0.1, `rgba(255, 255, 255, 0.5)`);
    }

    /**
     * A veces algunas propiedades de un coche cambian, por lo que se necesita actualizar las variables locales.
     * @param {*} car Es el coche que se va a actualizar.
     * @param {*} ctx Es el contexto del canvas.
     */
    reset(car, ctx) {
        this.init(car, ctx);
    }
}