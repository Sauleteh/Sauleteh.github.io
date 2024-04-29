import * as Game from "./game.js";
import * as Constants from "./Constants.js";
import { Chronometer } from "./Chronometer.js";

export class Easter
{
    constructor(activated) {
        this.activated = activated;
        this.mouseX = 0;
        this.mouseY = 0;
        this.bass = 0;
        this.bassForegroundColor = 0;
        this.mouseDown = false;
        this.canDoAction = true;
        this.audioMuffled = null;
        this.audioNormal = null;
        this.volumeMuffled = null;
        this.volumeNormal = null;
        this.analyser = null;
        this.dataArray = null;
        this.animPixels = [];
        this.chronoRevealSquare = new Chronometer();
    }

    setActivated(activated) {
        console.log("Easter egg activated: " + activated);
        this.activated = activated;
        this.manageActivation(); // TODO: Descomentar
    }

    manageActivation() {
        if (this.activated) {
            Game.$spriteSquares.src = `./assets/imgs/squares_easter.png`;
            Game.canvas.addEventListener("mousemove", this.mouseMovementListener);
            Game.canvas.addEventListener("mousedown", this.mouseDownListener);
            Game.canvas.addEventListener("mouseup", this.mouseUpListener);
            
            // Inicializar la música con el efecto muffled
            const audioContextMuffled = new AudioContext();
            this.audioMuffled = new Audio("./assets/audio/BSR_OST_General_Release_Muffled.mp3");
            const sourceMuffled = audioContextMuffled.createMediaElementSource(this.audioMuffled);
            this.volumeMuffled = audioContextMuffled.createGain();
            this.volumeMuffled.gain.value = 1;
            sourceMuffled.connect(this.volumeMuffled);
            this.volumeMuffled.connect(audioContextMuffled.destination);
            
            // Inicializar la música normal
            const audioContextNormal = new AudioContext();
            this.audioNormal = new Audio("./assets/audio/BSR_OST_General_Release.mp3");
            const sourceNormal = audioContextNormal.createMediaElementSource(this.audioNormal);
            this.volumeNormal = audioContextNormal.createGain();
            this.volumeNormal.gain.value = 0;

            // Crear el analizador para obtener la frecuencia del bajo
            this.analyser = audioContextNormal.createAnalyser();
            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            sourceNormal.connect(this.volumeNormal);
            this.volumeNormal.connect(this.analyser);
            this.analyser.connect(audioContextNormal.destination);

            // Reproducir la música
            if (audioContextMuffled.state === "suspended") audioContextMuffled.resume();
            this.audioMuffled.play();
            if (audioContextNormal.state === "suspended") audioContextNormal.resume();
            this.audioNormal.play();

            // Dibujar el Easter egg
            if (document.readyState === "complete") this.drawEaster();
            else setTimeout(() => { this.drawEaster(); }, 1000); // Esperar a que se cargue el documento para que el tablero exista

        }
        else {
            Game.$spriteSquares.src = `./assets/imgs/squares.png`;
            Game.canvas.removeEventListener("mousemove", this.mouseMovementListener);
            Game.canvas.removeEventListener("mousedown", this.mouseDownListener);
            Game.canvas.removeEventListener("mouseup", this.mouseUpListener);

            Game.canvas.style.backgroundColor = ""; // Color por defecto
            Game.ctx.setTransform(1, 0, 0, 1, 0, 0);
            Game.ctx.scale(1, 1);

            this.audioMuffled.pause(); // Parar la música
            this.audioMuffled.currentTime = 0;
            this.audioNormal.pause();
            this.audioNormal.currentTime = 0;

            setTimeout(() => { window.drawBoard(); }, document.readyState === "complete" ? 100 : 1000); // Esperar a que se cargue el documento para que el tablero exista
        }
    }

    drawEaster = () => {
        if (!this.activated) return;
        // console.log("Dibujando Easter egg");

        Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
        Game.ctx.save();

        if (Game.isGameOver || !Game.boardGenerated) { // Mientras no se esté jugando, poner la música con el efecto muffled
            this.volumeMuffled.gain.value = 1;
            this.volumeNormal.gain.value = 0;
            Game.canvas.style.backgroundColor = "#222222";
        }
        else {
            // Si se está en el juego, aplicar efectos antes del dibujado del tablero
            this.volumeMuffled.gain.value = 0;
            this.volumeNormal.gain.value = 2;

            // Obtener la frecuencia del bajo y aplicarla al color de fondo
            this.analyser.getByteFrequencyData(this.dataArray);
            this.bass = this.dataArray.reduce((acc, val) => acc + val, 0) / this.dataArray.length;

            Game.canvas.style.backgroundColor = `rgb(0, ${this.bass*2}, ${this.bass*2})`; // Es más cian cuanto más potente sea el bajo

            const myScale = Math.max(this.bass / 18, 1.5); // Cuanto más potente sea el bajo, más zoom
            Game.ctx.translate(-this.mouseX * (myScale - 1), -this.mouseY * (myScale - 1));
            Game.ctx.scale(myScale, myScale);
        }

        window.drawBoard();
        if (!(Game.isGameOver || !Game.boardGenerated)) // Si se está en el juego, aplicar efectos post-dibujado del tablero
        {
            // Partículas de colores alrededor del cursor
            this.animPixels.push({ // Derecha
                x: this.mouseX,
                y: this.mouseY,
                speedX: 0.1,
                speedY: 0.1,
                size: Math.random() * 3 + 1,
                color: this.getRandomColor()
            });

            // Partículas aleatorias por el tablero
            this.animPixels.push({ // Derecha
                x: Math.random() * Game.canvas.width,
                y: Math.random() * Game.canvas.height,
                speedX: -0.1,
                speedY: 0.1,
                size: Math.random() * 3 + 1,
                color: this.getRandomColor()
            });

            // Efecto de click
            if (this.mouseDown && this.canDoAction) {
                this.canDoAction = false;

                // Añadimos partículas a la pool de partículas
                for (let i = 0; i < Constants.SQUARE_SIZE + 1; i++) {
                    // Arriba y abajo
                    const velXud = Math.cos(3 * Math.PI / 4 - (Math.PI / 2 / (Constants.SQUARE_SIZE + 1) * i)) * 0.1;
                    const velYud = Math.sin(3 * Math.PI / 4 - (Math.PI / 2 / (Constants.SQUARE_SIZE + 1) * i)) * 0.1;
                    
                    // Izquierda y derecha
                    const velXlr = Math.cos(5 * Math.PI / 4 - (Math.PI / 2 / (Constants.SQUARE_SIZE + 1) * i)) * 0.1;
                    const velYlr = Math.sin(5 * Math.PI / 4 - (Math.PI / 2 / (Constants.SQUARE_SIZE + 1) * i)) * 0.1;

                    this.animPixels.push({ // Superior
                        x: Math.floor((this.mouseX) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + i,
                        y: Math.floor((this.mouseY) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1),
                        speedX: velXud,
                        speedY: -velYud,
                        size: Math.random() * 3 + 1,
                        color: this.getRandomColor()
                    });

                    this.animPixels.push({ // Izquierda
                        x: Math.floor((this.mouseX) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1),
                        y: Math.floor((this.mouseY) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + i,
                        speedX: velXlr,
                        speedY: velYlr,
                        size: Math.random() * 3 + 1,
                        color: this.getRandomColor()
                    });

                    this.animPixels.push({ // Inferior
                        x: Math.floor((this.mouseX) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + i,
                        y: Math.floor((this.mouseY) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + Constants.SQUARE_SIZE + 1,
                        speedX: velXud,
                        speedY: velYud,
                        size: Math.random() * 3 + 1,
                        color: this.getRandomColor()
                    });

                    this.animPixels.push({ // Derecha
                        x: Math.floor((this.mouseX) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + Constants.SQUARE_SIZE + 1,
                        y: Math.floor((this.mouseY) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1) + i,
                        speedX: -velXlr,
                        speedY: velYlr,
                        size: Math.random() * 3 + 1,
                        color: this.getRandomColor()
                    });
                }
            }

            // Animamos las partículas
            Game.ctx.globalAlpha = 0.5;
            for (let i = 0; i < this.animPixels.length; i++) {
                const pixel = this.animPixels[i];
                Game.ctx.fillStyle = pixel.color;
                Game.ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
                pixel.x += pixel.speedX;
                pixel.y += pixel.speedY;
                pixel.speedY += Math.random() * 0.1 - 0.05;
                pixel.speedX += Math.random() * 0.1 - 0.05;

                if (pixel.y > Game.canvas.height || pixel.x < 0 || pixel.x > Game.canvas.width) {
                    this.animPixels.splice(i, 1);
                }
            }
            Game.ctx.globalAlpha = 1;

            // Color al estilo de una discoteca
            this.bassForegroundColor += this.bass <= 50 ? this.bass / 25 : this.bass / 10;
            Game.ctx.fillStyle = `hsl(${this.bassForegroundColor}, 100%, 50%)`;
            Game.ctx.globalAlpha = 0.1;
            Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
            Game.ctx.globalAlpha = 1;

            // Efecto de luz en la casilla sobre la que se esté
            Game.ctx.fillStyle = "white";
            Game.ctx.globalAlpha = 0.2;
            Game.ctx.fillRect(
                Math.floor((this.mouseX) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1), 
                Math.floor((this.mouseY) / (Constants.SQUARE_SIZE + 1)) * (Constants.SQUARE_SIZE + 1), 
                Constants.SQUARE_SIZE, 
                Constants.SQUARE_SIZE
            );
            Game.ctx.globalAlpha = 1;

            Game.ctx.fillStyle = "red";
            Game.ctx.globalAlpha = Math.max(this.chronoRevealSquare.getElapsedTime() / 10000 - 0.2, 0);
            Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
            Game.ctx.globalAlpha = 1;
            if (this.chronoRevealSquare.getElapsedTime() > 10000) window.onGameOver();
        }

        Game.ctx.restore();
        
        window.requestAnimationFrame(this.drawEaster);
    }

    mouseMovementListener = (event) => {
        //console.log("Mouse movement detected: " + event.offsetX + ", " + event.offsetY);
        this.mouseX = event.offsetX;
        this.mouseY = event.offsetY;
    }

    mouseDownListener = (event) => {
        console.log("Mouse click detected: " + event.offsetX + ", " + event.offsetY);
        this.mouseDown = true;
    }

    mouseUpListener = (event) => {
        console.log("Mouse click detected: " + event.offsetX + ", " + event.offsetY);
        this.mouseDown = false;
        this.canDoAction = true;
    }

    getRandomColor = () => {
        return ["#00FFFF", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#00AAAA", "#FFFF00"][Math.floor(Math.random() * 7)];
    }
}