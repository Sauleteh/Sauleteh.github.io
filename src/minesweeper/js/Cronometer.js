export class Cronometer
{
    constructor() {
        this.startTime = 0;
    }

    start() { this.startTime = performance.now(); }
    getElapsedTime() { return performance.now() - this.startTime; }
}