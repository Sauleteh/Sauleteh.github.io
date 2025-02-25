import { MenuOption } from "./objects/MenuObjects.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    canvas.onselectstart = function () { return false; }  // Desactiva la selección de texto al hacer clic y arrastrar
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const options = [
        new MenuOption("Play online", handlePlayOnline, canvas.width / 12, 200),
        new MenuOption("Garage", handleGarage, canvas.width / 12, 250),
        new MenuOption("Circuit creator", handleCircuitCreator, canvas.width / 12, 300)
    ];

    let isEntering = false; // Si se ha confirmado que el servidor está en línea, entonces se va a entrar

    function handlePlayOnline() {
        const option = options[0];
        if (option.label === "Connecting...") return; // Si ya está conectando, no hacer nada
        
        option.label = "Connecting...";
        draw();

        const socket = new WebSocket('wss://sauleteh.gayofo.com/wss/ping');
        socket.onclose = function (event) {
            console.log(`Disconnected with event code: ${event.code}`);
            if (!isEntering) {
                option.label = "Error, retry again";
                draw();
            }
        };

        socket.onmessage = function (event) {
            if (event.data === "pong") { // Si el servidor está en línea, se puede jugar
                isEntering = true;
                stopEvents();
                window.removeScript("menu");
                window.loadScript("./js/game.js", "game");
            }
        };
    }

    function handleCircuitCreator() {
        stopEvents();
        window.removeScript("menu");
        window.loadScript("./js/creator.js", "creator");
    }

    function handleGarage() {
        stopEvents();
        window.removeScript("menu");
        window.loadScript("./js/garage.js", "garage");
    }

    function initEvents() {
        stopEvents(); // Detener eventos anteriores
        console.log("Initializing events...");
        canvas.addEventListener("click", onClickListener);
        canvas.addEventListener("mousemove", onMouseMoveListener);
    }

    function stopEvents() {
        console.log("Stopping events...");
        canvas.removeEventListener("click", onClickListener);
        canvas.removeEventListener("mousemove", onMouseMoveListener);
    }

    function onClickListener(event) {
        const x = event.offsetX;
        const y = event.offsetY;

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.isPointInside(x, y) && option.handler !== undefined) option.handler();
        }
    }

    function onMouseMoveListener() {
        draw();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
        clearCanvas();

        const x = event.offsetX;
        const y = event.offsetY;
        
        // Fondo
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial";
        ctx.fillText("Drive Mad", canvas.width / 12, 80);

        // Opciones
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "32px Arial";
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            option.setTextWidth(ctx);
            option.setTextHeight(ctx);

            if (option.isPointInside(x, y)) ctx.fillStyle = (option.handler !== undefined ? "white" : "red");
            else ctx.fillStyle = "lightgray";

            ctx.fillText(option.label, option.x, option.y);
        }

        // Footer
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "gray";
        ctx.font = "12px Arial";
        ctx.fillText("v0.2 Beta, by Sauleteh", 10, canvas.height - 30);
        ctx.fillText("Powered by Gayofo.com", 10, canvas.height - 10);

        // Cursor
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, 5, 5);
    }

    draw();
    initEvents();
};
document.addEventListener('DOMContentLoaded', handler);

/** TODO list:
 * - [ ] Dejar más bonito el menú.
 *     - [ ] El título será una imagen relacionada con el juego, más chula que un simple texto.
 *     - [ ] El fondo será una imagen del juego; por ejemplo, un coche derrapando.
 *     - [ ] El título y las opciones están a la izquierda teniendo detrás un fondo semitransparente que esté algo inclinado.
 *     - [ ] El ratón será un cursor personalizado.
 * - [X] Meter los apartados "Jugar online" y "Garaje".
 * - [X] Hacerlo de tal forma que sea muy fácil añadir más apartados y localizarlos al hacerles click.
 */