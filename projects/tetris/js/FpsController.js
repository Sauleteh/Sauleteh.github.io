/*
 * Clase encargada de controlar todo lo relacionado con los FPS.
 * Hecha a partir del código en https://github.com/midudev/javascript-100-proyectos/blob/main/02-arkanoid-game/index.html
 */
export class FpsController
{
    constructor(max) {
        this.fpsCap = max; // FPS máximos
        this.msPrev = window.performance.now();
        this.msFPSPrev = window.performance.now() + 1000;
        this.msPerFrame = 1000 / this.fpsCap;
        this.frames = 0;
        this.framesPerSec = this.fpsCap; // Se puede utilizar como delta time

        this.msNow = window.performance.now();
        this.msPassed = 0;
        this.excessTime = 0;
    }

    /**
     * Comprobar si se debe dibujar el frame y actualizar las variables de control.
     * @returns true si se debe dibujar el frame o false en caso contrario.
     */
    shouldDrawFrame() {
        this.msNow = window.performance.now();
        this.msPassed = this.msNow - this.msPrev;

        if (this.msPassed < this.msPerFrame) return false;

        this.excessTime = this.msPassed % this.msPerFrame;
        this.msPrev = this.msNow - this.excessTime;
        
        this.frames++;

        if (this.msFPSPrev < this.msNow)
        {
            this.msFPSPrev = window.performance.now() + 1000;
            this.framesPerSec = this.frames;
            this.frames = 0;
        }

        return true;
    }
}