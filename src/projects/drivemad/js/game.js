import { FPSControllerV2 } from "./objects/FPSControllerV2.js";
import { Point } from "./objects/Point.js";
import { Controls } from "./objects/Controls.js";
import { Circuit } from "./objects/Circuit.js";
import { CarUtils } from "./objects/CarUtils.js";
import { LocalCarVariables } from "./objects/LocalCarVariables.js";
import { GAMEMODES, STORAGE_KEYS, CARS } from "./objects/Constants.js";
import { SpriteManager } from "./objects/SpriteManager.js";
import { MenuImage } from "./objects/MenuObjects.js";

const handler = function() {
    document.removeEventListener('DOMContentLoaded', handler);

    const sfxEngineCtx = new window.AudioContext();
    const sfxEngineSrc = sfxEngineCtx.createBufferSource();
    fetch("./assets/audio/car_engine.wav")
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => sfxEngineCtx.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        sfxEngineSrc.buffer = audioBuffer;
        sfxEngineSrc.loop = true;
        sfxEngineSrc.start();
        sfxEngineSrc.connect(sfxEngineCtx.destination);
    });

    const musicCtx = new window.AudioContext();
    const musicAnalyser = musicCtx.createAnalyser();
    musicAnalyser.fftSize = 256;
    const musicBufferLength = musicAnalyser.frequencyBinCount;
    const musicDataArray = new Uint8Array(musicBufferLength);
    const musicSrc = musicCtx.createBufferSource();
    fetch("./assets/audio/music/MOON_Hydrogen.wav")
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => musicCtx.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        musicSrc.buffer = audioBuffer;
        musicSrc.loop = true;
        musicSrc.start();
        musicSrc.connect(musicAnalyser);
        musicAnalyser.connect(musicCtx.destination);
    });

    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    // Inicialización de variables base para el juego
    const fpsController = new FPSControllerV2(60);
    const controls = new Controls();
    const camera = new Point(0, 0); // La cámara tiene el mismo tamaño que el canvas y la coordenada que se especifica es su esquina superior izquierda. Su movimiento horizontal está invertido (+x => Izq.) y su movimiento vertical es igual al del canvas (+y => Abajo)
    let canvasScale = 1; // Escala a aplicar en el canvas
    let musicBassPower = 0; // Potencia del bajo de la música

    const socketFrameUpdateNumber = 1; // Cada cuántos frames se envía la actualización de posición al servidor
    let socketFrameUpdateCounter = 0; // Contador de frames para enviar la actualización de posición al servidor
    const controlsFramePressedNumber = 30 // Cuántos frames son necesarios para detectar que si se deja de pulsar una acción, se deje de enviar al servidor
    let controlsFramePressedCounter = 0; // Contador de frames para detectar que si se deja de pulsar una acción, se deje de enviar al servidor    
    
    const cars = []; // Contiene todos los coches, ya sea del usuario, IA o de otros jugadores
    const aiCars = []; // Contiene solo los coches de la IA
    const localCarVariables = []; // Variables para los coches, pero que no se envían al servidor. El elemento i son las variables del coche i en el array de coches.
    const carUtils = new CarUtils();
    let circuit = Circuit.defaultCircuit(); // Circuito por defecto para jugar mientras se espera a que empiece la carrera

    // Constantes de juego
    const movingAirFriction = 0.1;
    const idleAirFriction = 0.008;
    const outsideCircuitMultiplier = 0.8;
    const smokeParticleMaxLife = 10; // Vida máxima de las partículas de humo
    const boostParticleMaxLife = 7; // Vida máxima de las partículas del boost
    const wheelWearLimit = 150; // Límite de rastros del suelo
    const turnSensitiveLimit = 6; // Frames para alcanzar la máxima sensibilidad de giro

    // Variables de juego
    const wheelWear = [[], []]; // Dos arrays, una para cada rueda donde se guarda los distintos puntos "point" donde ha estado la rueda y "isNewSegment" si es un nuevo segmento de derrape o no
    let createNewWheelWearSegment = false; // True si se debe crear un nuevo segmento de desgaste de ruedas, false en caso contrario
    let boostAirParticles = []; // Array de Point. Partículas de aire que aparecen al usar el boost. A diferencia de las partículas del turbo, estas no tienen vida límite sino que desaparecen al salirse del canvas
    let turnSensitiveCounter = 0; // La sensibilidad del giro aumenta cuanto más tiempo se mantiene pulsada la tecla de giro

    // Variables de detalles para el circuito
    let musicCircuitEdges = []; // Array de offsets de líneas que aparecen en los bordes del circuito sincronizados con la música
    let musicEdgesLimiter = 0; // Contador para limitar el número de pulsos que aparecen en el circuito
    const musicEdgesMaxOffset = 50;
    const musicEdgesMaxLimiter = 20; // Cuántos frames como mínimo entre pulsos para no saturar los detalles

    let waitCountdownCount = undefined; // Contador de tiempo para empezar la carrera
    let waitCountdownInterval = undefined; // Intervalo para contar el tiempo restante para empezar la carrera
    let startCountdownCount = undefined; // Contador de tiempo para empezar la carrera
    let startCountdownInterval = undefined; // Intervalo para contar el tiempo restante para empezar la carrera
    let canMove = true; // Si es false, no se puede mover el coche
    let gamemode = undefined; // Modo de juego actual

    // Variables especiales para cada modo de juego
    // Modo de juego carrera
    const segmentsVisited = new Set(); // Para que cuente la vuelta como válida, se deben visitar todos los segmentos del circuito
    let lapsCompleted = 0; // Vueltas completadas por el coche
    let lapsToComplete = undefined; // Vueltas necesarias para completar la carrera
    let circuitDisplayInfo = undefined; // Objeto que contiene el nombre (name), la longitud (length) del circuito y si está invertido

    // Inicialización para el jugador
    let userCar = carUtils.defaultCar();
    carUtils.reset(userCar, circuit.startPoint);
    cars.push(userCar);
    localCarVariables.push(new LocalCarVariables());

    // Inicialización para la IA
    for (let i = 0; i < 10; i++) {
        const aiCar = carUtils.defaultCar();
        aiCar.name = `Bores ${i+1}`;
        aiCar.speedPower *= Math.random() * 0.5 + 0.5; // La velocidad de la IA es aleatoria entre 0.5 y 1
        carUtils.reset(aiCar, circuit.startPoint);
        aiCars.push(aiCar);
        cars.push(aiCar);
        localCarVariables.push(new LocalCarVariables());
    }

    // MARK: Conexión server
    const socket = new WebSocket('wss://sauleteh.gayofo.com/wss/drivemad');
    socket.onopen = function () {
        console.log("Connected to WebSocket server");
        // Registrar el coche en el servidor
        const message = JSON.stringify({
            type: "login",
            content: userCar
        });
        socket.send(message);
    };

    socket.onclose = function (event) {
        console.log(`Disconnected with event code: ${event.code}`);
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log(data);

        if (data.type === "login_id" && data.code === 0) {
            // Aquí se recibe el id del usuario proporcionado por el servidor
            userCar.id = data.content;
        }
        else if (data.type === "login_new_car" && data.code === 0) {
            // Aquí se reciben los coches recién conectados al servidor o la lista de coches si se acaba de entrar
            cars.push(data.content);
            localCarVariables.push(new LocalCarVariables());
        }
        else if (data.type === "move" && data.code === 0) {
            // Aquí se reciben las actualizaciones de posición de los coches
            const index = cars.findIndex(car => car.id === data.content.id);
            if (index !== -1) cars[index] = data.content;
        }
        else if (data.type === "logout" && data.code === 0) {
            // Aquí se recibe el id del coche que se ha desconectado
            const index = cars.findIndex(car => car.id === data.content);
            if (index !== -1) {
                cars.splice(index, 1);
                localCarVariables.splice(index, 1);
            }
        }
        else if (data.type === "wait_countdown_start" && data.code === 0) {
            // Cuando se actualiza el tiempo de espera para empezar la carrera, se recibe el tiempo restante
            if (!data.content) throw new Error("The countdown time received is undefined");

            // Si lo que se ha producido es una actualización del tiempo, se para el intervalo anterior
            if (waitCountdownInterval) clearInterval(waitCountdownInterval);

            waitCountdownCount = data.content;
            waitCountdownInterval = setInterval(() => {
                if (--waitCountdownCount <= 0) {
                    clearInterval(waitCountdownInterval);
                    waitCountdownCount = 0;
                    waitCountdownInterval = undefined;
                }
            }, 1000);
        }
        else if (data.type === "wait_countdown_stop" && data.code === 0) {
            // Cuando se para el tiempo de forma indefinida, se recibe el tiempo restante, que debería ser undefined
            if (data.content) throw new Error("The countdown time received is not undefined");
            else if (!waitCountdownInterval) throw new Error("The countdown interval is not defined");
            
            clearInterval(waitCountdownInterval);
            waitCountdownCount = undefined;
            waitCountdownInterval = undefined;
        }
        else if (data.type === "game_prepare" && data.code === 0) {
            // Cuando se inicia la preparación de la carrera, se recibe "gamemode" y "circuit"
            if (waitCountdownInterval) { // Si el servidor ha solicitado que el cliente se prepare antes de terminar el tiempo de espera, se para el intervalo
                clearInterval(waitCountdownInterval);
                waitCountdownInterval = undefined;
            }
            waitCountdownCount = undefined; // En cualquier caso, se pone el contador a undefined

            resetGamemodeVariables();

            if (data.content.gamemode === GAMEMODES.RACE) {
                const circuitData = data.content.circuit;
                circuit = new Circuit(circuitData.data.circuitWidth, circuitData.data.lineWidth);
                circuit.setStartPoint(circuitData.data.startPoint);
                circuit.addInfoSegments(circuitData.data.segments);
                lapsToComplete = data.content.laps;
                circuitDisplayInfo = {
                    name: circuitData.name,
                    length: circuitData.length,
                    inverted: data.content.inverted
                }
                if (data.content.inverted) {
                    // Si está el circuito invertido, se invierte la dirección de salida después de añadir los segmentos para que lo único que gire sean los coches
                    circuit.startPoint.direction += 180;
                    circuit.startPoint.direction = circuit.startPoint.direction % 360;
                }
            }
            else throw new Error("Unknown gamemode");

            gamemode = data.content.gamemode;
            canMove = false;
            carUtils.resetAll(cars, circuit.startPoint);

            const message = JSON.stringify({
                type: "prepared",
                content: userCar.id
            });
            socket.send(message);
        }
        else if (data.type === "game_start" && data.code === 0) {
            // Cuando se recibe la señal de iniciar la carrera, se recibe este evento sin recibir nada
            if (waitCountdownInterval) throw new Error("The wait countdown is not stopped");
            else if (startCountdownInterval) throw new Error("The start countdown is not stopped");
            else if (waitCountdownCount || startCountdownCount) throw new Error("There is a countdown count already running");

            startCountdownCount = 10;
            startCountdownInterval = setInterval(() => {
                if (--startCountdownCount <= 0) {
                    clearInterval(startCountdownInterval);
                    startCountdownCount = undefined;
                    startCountdownInterval = undefined;
                    canMove = true;
                }
            }, 1000);

        }
        else if (data.type === "game_stop" && data.code === 0) {
            // Cuando se cancela la carrera por falta de jugadores, ya sea mientras estaba en preparación o en curso, se recibe este evento con el tiempo restante, que debería ser undefined
            if (data.content) throw new Error("The countdown time received is not undefined");
            else if (waitCountdownInterval || waitCountdownCount) throw new Error("The wait countdown is not stopped");

            resetGamemodeVariables();
            gamemode = undefined;
            circuit = Circuit.defaultCircuit();
            carUtils.resetAll(cars, circuit.startPoint);
            canMove = true;
        }
        else if (data.type === "game_end" && data.code === 0) {
            // Cuando se acaba la carrera, se recibe este evento sin recibir nada
            resetGamemodeVariables();
            gamemode = undefined;
            circuit = Circuit.defaultCircuit();
            carUtils.resetAll(cars, circuit.startPoint);
        }
        else console.error(`Unknown message: ${data}`);
    };

    function resetGamemodeVariables() {
        segmentsVisited.clear();
        lapsCompleted = 0;
        lapsToComplete = undefined;
        circuitDisplayInfo = undefined;
    }

    function initEvents() {
        document.addEventListener("keydown", function(event) {
            const { key } = event;
            if (document.activeElement === canvas && (key === " " || key === "ArrowUp" || key === "ArrowDown")) event.preventDefault();
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
            if (document.activeElement === canvas && (key === " " || key === "ArrowUp" || key === "ArrowDown")) event.preventDefault();
            controls.checkControls(key, "up");
        });

        window.onblur = function() { // Pausar el sonido al cambiar de pestaña
            sfxEngineSrc.disconnect();
        };

        window.onfocus = function() { // Reanudar el sonido al volver a la pestaña
            sfxEngineSrc.connect(sfxEngineCtx.destination);
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // MARK: Dibujado
    function drawCars() {
        cars.forEach(car => {
            ctx.save();
            ctx.filter = `hue-rotate(${car.color}deg)`;
            ctx.translate(car.coords.x + camera.x, car.coords.y + camera.y);
            ctx.rotate(car.direction * Math.PI / 180);
            ctx.drawImage( // La imagen se hace con el ancho y alto al revés para que aparezca mirando hacia la derecha (0 grados)
                SpriteManager.getSpriteByName(car.image.sprite),
                car.image.x, // Posición X del coche en la imagen
                car.image.y, // Posición Y del coche en la imagen
                car.image.width, // Ancho del coche en la imagen
                car.image.height, // Alto del coche en la imagen
                -car.height / 2, // Posición X del coche
                -car.width / 2, // Posición Y del coche
                car.height, // Ancho del coche
                car.width // Alto del coche
            );
            ctx.restore();
        });
    }

    function drawDriftParticles() {
        ctx.fillStyle = "gray";
        ctx.strokeStyle = "lightgray";
        ctx.lineWidth = userCar.particleSize;
        for (let i = 0; i < wheelWear.length; i++)
        {
            if (wheelWear[i].length > 1) {
                ctx.beginPath();
                ctx.moveTo(wheelWear[i][0].point.x + camera.x, wheelWear[i][0].point.y + camera.y);
                for (let j = 1; j < wheelWear[i].length; j++) {
                    if (wheelWear[i][j].isNewSegment) { // Si es un nuevo segmento, se pinta el punto anterior y se empieza un nuevo segmento
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(wheelWear[i][j].point.x + camera.x, wheelWear[i][j].point.y + camera.y);
                    }
                    else ctx.lineTo(wheelWear[i][j].point.x + camera.x, wheelWear[i][j].point.y + camera.y);
                }
                ctx.stroke();
            }
        }

        cars.forEach((car, index) => {
            for (let i = 0; i < localCarVariables[index].smokeParticles.length; i++) {
                const smokeParticle = localCarVariables[index].smokeParticles[i];
                ctx.fillRect(
                    smokeParticle.point.x - car.particleSize / 2 + camera.x,
                    smokeParticle.point.y - car.particleSize / 2 + camera.y,
                    car.particleSize * smokeParticle.life / smokeParticleMaxLife,
                    car.particleSize * smokeParticle.life / smokeParticleMaxLife
                );
            }
        });
        ctx.lineWidth = 1;
    }

    function drawBoostEffects() {
        // Fuego que sale del tubo de escape
        cars.forEach((car, index) => {
            const localCarVars = localCarVariables[index];
            for (let i = 0; i < localCarVars.boostParticles.length; i++) {
                const boostParticle = localCarVars.boostParticles[i];
                ctx.fillStyle = `rgba(
                    ${Math.min(255, 255 * (boostParticleMaxLife - boostParticle.life + 1) / boostParticleMaxLife)},
                    ${Math.min(255, 255 * (boostParticleMaxLife - boostParticle.life - 1) / boostParticleMaxLife)},
                    0,
                    ${Math.min(1, boostParticle.life / boostParticleMaxLife + 0.1)}
                )`;
                ctx.fillRect(
                    boostParticle.point.x - car.particleSize / 2 + camera.x,
                    boostParticle.point.y - car.particleSize / 2 + camera.y,
                    car.particleSize * ((boostParticleMaxLife - boostParticle.life) / boostParticleMaxLife + 0.5),
                    car.particleSize * ((boostParticleMaxLife - boostParticle.life) / boostParticleMaxLife + 0.5)
                );
            }
        });

        // Partículas de aire que salen al usar el boost
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        for (let i = 0; i < boostAirParticles.length; i++) {
            const boostAirParticle = boostAirParticles[i];
            ctx.fillRect(
                boostAirParticle.x - userCar.particleSize / 2,
                boostAirParticle.y - userCar.particleSize / 2,
                userCar.particleSize,
                userCar.particleSize
            );
        }
    }

    function drawCircuit() {
        // Dibujar suelo del circuito
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.min(0.5, musicBassPower / 1200)})`;
        ctx.lineWidth = circuit.circuitWidth;
        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];            

            ctx.beginPath();
            if (segment.type === 'straight') {
                ctx.moveTo(segment.data.start.x + camera.x, segment.data.start.y + camera.y);
                ctx.lineTo(segment.data.end.x + camera.x, segment.data.end.y + camera.y);
            }
            else if (segment.type === 'arc') {
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
            }
            ctx.stroke();
        }

        // Dibujar línea de meta
        ctx.strokeStyle = circuit.hasCrossedFinishLine(userCar) ? "white" : "red";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
            circuit.leftFinishLine.x + camera.x,
            circuit.leftFinishLine.y + camera.y
        );
        ctx.lineTo(
            circuit.rightFinishLine.x + camera.x,
            circuit.rightFinishLine.y + camera.y
        );
        ctx.stroke();

        // Brillo que debe tener los bordes de la pista dependiendo de la música
        const brightness = (0.5 + Math.min(0.5, musicBassPower / 500)) * 255;

        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];        

            if (segment.type === 'straight') {
                // Bordes de la pista
                ctx.lineWidth = circuit.lineWidth;

                if (segmentsVisited.has(segment.id)) ctx.strokeStyle = "white";
                else ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

                const calculatedSin = segment.data.widthSin * circuit.circuitWidth / 2;
                const calculatedCos = segment.data.widthCos * circuit.circuitWidth / 2;

                ctx.beginPath();
                ctx.moveTo(
                    segment.data.start.x - calculatedSin + camera.x,
                    segment.data.start.y + calculatedCos + camera.y
                );
                ctx.lineTo(
                    segment.data.end.x - calculatedSin + camera.x,
                    segment.data.end.y + calculatedCos + camera.y
                );
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(
                    segment.data.start.x + calculatedSin + camera.x,
                    segment.data.start.y - calculatedCos + camera.y
                );
                ctx.lineTo(
                    segment.data.end.x + calculatedSin + camera.x,
                    segment.data.end.y - calculatedCos + camera.y
                );
                ctx.stroke();

                // Línea central de la pista
                ctx.strokeStyle = "white";
                ctx.lineWidth = Math.max(1, musicBassPower / 20);

                ctx.beginPath();
                ctx.moveTo(segment.data.start.x + camera.x, segment.data.start.y + camera.y);
                ctx.lineTo(segment.data.end.x + camera.x, segment.data.end.y + camera.y);
                ctx.stroke();
            }
            else if (segment.type === 'arc') {
                // Bordes de la pista
                ctx.lineWidth = circuit.lineWidth;
                if (segmentsVisited.has(segment.id)) ctx.strokeStyle = "white";
                else ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius - circuit.circuitWidth / 2,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius + circuit.circuitWidth / 2,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();

                // Línea central de la pista
                ctx.strokeStyle = "white";
                ctx.lineWidth = Math.max(1, musicBassPower / 20);

                ctx.beginPath();
                ctx.arc(
                    segment.data.arcCenter.x + camera.x,
                    segment.data.arcCenter.y + camera.y,
                    segment.data.radius,
                    segment.data.startAngle,
                    segment.data.endAngle,
                    !segment.data.isClockwise
                );
                ctx.stroke();
            }
        }
        ctx.lineWidth = 1;
    }

    function drawMusicCircuitEdges() {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        musicCircuitEdges.forEach(edge => {
            const edgeStart = circuit.lineWidth / 2 + edge;
            ctx.globalAlpha = 1 - edge / musicEdgesMaxOffset; // La opacidad disminuye cuanto más se aleja

            for (let i = 0; i < circuit.segments.length; i++) {
                const segment = circuit.segments[i];

                if (segment.type === 'straight') {
                    const calculatedSin = segment.data.widthSin * (circuit.circuitWidth / 2 + edgeStart);
                    const calculatedCos = segment.data.widthCos * (circuit.circuitWidth / 2 + edgeStart);

                    ctx.beginPath();
                    ctx.moveTo(
                        segment.data.start.x - calculatedSin + camera.x,
                        segment.data.start.y + calculatedCos + camera.y
                    );
                    ctx.lineTo(
                        segment.data.end.x - calculatedSin + camera.x,
                        segment.data.end.y + calculatedCos + camera.y
                    );
                    ctx.stroke();
    
                    ctx.beginPath();
                    ctx.moveTo(
                        segment.data.start.x + calculatedSin + camera.x,
                        segment.data.start.y - calculatedCos + camera.y
                    );
                    ctx.lineTo(
                        segment.data.end.x + calculatedSin + camera.x,
                        segment.data.end.y - calculatedCos + camera.y
                    );
                    ctx.stroke();
                }
                else if (segment.type === 'arc') {
                    ctx.beginPath();
                    ctx.arc(
                        segment.data.arcCenter.x + camera.x,
                        segment.data.arcCenter.y + camera.y,
                        Math.max(0, segment.data.radius - circuit.circuitWidth / 2 - edgeStart),
                        segment.data.startAngle, segment.data.endAngle,
                        !segment.data.isClockwise
                    );
                    ctx.stroke();
    
                    ctx.beginPath();
                    ctx.arc(
                        segment.data.arcCenter.x + camera.x,
                        segment.data.arcCenter.y + camera.y,
                        segment.data.radius + circuit.circuitWidth / 2 + edgeStart,
                        segment.data.startAngle, segment.data.endAngle,
                        !segment.data.isClockwise
                    );
                    ctx.stroke();
                }
            }
        });
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1.0;
    }

    function drawUsername() {
        // Dibujar debajo del coche el nombre de usuario
        cars.forEach(car => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(car.name, car.coords.x + camera.x, car.coords.y + camera.y + car.width + 12);
        });
    }

    function drawUserInterface() {        
        // Cuenta atrás para la espera de jugadores en la sala
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (waitCountdownCount) ctx.fillText(`${waitCountdownCount} seconds`, canvas.width / 2, canvas.height / 10);
        else if (!gamemode) ctx.fillText(`Waiting for players`, canvas.width / 2, canvas.height / 10);

        if (startCountdownCount) {
            // Cuenta atrás para empezar la carrera al cargar el circuito
            if (startCountdownCount === 1) ctx.fillStyle = "lime";
            else if (startCountdownCount === 2) ctx.fillStyle = "yellow";
            else ctx.fillStyle = "red";
            ctx.font = "bold 82px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(startCountdownCount, canvas.width / 2, canvas.height / 4);

            // Información del circuito (solo aparece antes de la cuenta atrás)
            if (startCountdownCount > 5) {
                if (gamemode === GAMEMODES.RACE) {
                    ctx.fillStyle = "black";
                    ctx.font = "bold 42px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const border = 2;
                    const text = circuitDisplayInfo.name + (circuitDisplayInfo.inverted ? " (Inverted)" : "");
                    
                    // Bordes del nombre del circuito
                    ctx.fillText(text, canvas.width / 2 - border, canvas.height / 2);
                    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - border);
                    ctx.fillText(text, canvas.width / 2 + border, canvas.height / 2);
                    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + border);

                    // Nombre del circuito
                    ctx.fillStyle = "white";
                    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

                    // Bordes de la longitud del circuito
                    ctx.fillStyle = "black";
                    ctx.font = "bold 28px Arial";
                    ctx.fillText(circuitDisplayInfo.length, canvas.width / 2 - border, canvas.height / 2 + 50);
                    ctx.fillText(circuitDisplayInfo.length, canvas.width / 2, canvas.height / 2 + 50 - border);
                    ctx.fillText(circuitDisplayInfo.length, canvas.width / 2 + border, canvas.height / 2 + 50);
                    ctx.fillText(circuitDisplayInfo.length, canvas.width / 2, canvas.height / 2 + 50 + border);

                    // Longitud del circuito
                    ctx.fillStyle = "white";
                    ctx.fillText(circuitDisplayInfo.length, canvas.width / 2, canvas.height / 2 + 50);
                }
            }
        }

        // Velocidad
        const speedSpriteOn = new MenuImage(32, 0, 48, 8, "spriteUI");
        const speedSpriteOff = new MenuImage(32, 8, 48, 8, "spriteUI");
        const scale = 4;

        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const fillPercentage = carUtils.absoluteSpeed(userCar) / carUtils.maxSpeed(userCar, movingAirFriction); // Porcentaje al que debe estar rellenada la barra (de 0 a 1)
        const pixelsToFill = Math.round(speedSpriteOn.width * fillPercentage); // Píxeles a rellenar de la barra
        const pixelsToFillOff = speedSpriteOff.width - pixelsToFill; // Píxeles a no rellenar de la barra
        const topLeft = new Point( // Localización de la esquina superior izquierda de la barra
            canvas.width / 1.5,
            canvas.height / 1.12
        );

        ctx.globalAlpha = 0.8;

        // Barra llenada
        ctx.drawImage(
            SpriteManager.getSpriteByName(speedSpriteOn.sprite),
            speedSpriteOn.x, // Posición X del item en la imagen
            speedSpriteOn.y, // Posición Y del item en la imagen
            pixelsToFill, // Ancho del item en la imagen
            speedSpriteOn.height, // Alto del item en la imagen
            Math.floor(topLeft.x), // Posición X del item
            Math.floor(topLeft.y), // Posición Y del item
            pixelsToFill * scale, // Ancho del item en el canvas
            speedSpriteOn.height * scale // Alto del item en el canvas
        );

        // El restante de la barra, sin llenarla
        ctx.drawImage(
            SpriteManager.getSpriteByName(speedSpriteOff.sprite),
            speedSpriteOff.x + pixelsToFill, // Posición X del item en la imagen
            speedSpriteOff.y, // Posición Y del item en la imagen
            pixelsToFillOff, // Ancho del item en la imagen
            speedSpriteOff.height, // Alto del item en la imagen
            Math.floor(topLeft.x + pixelsToFill * scale), // Posición X del item
            Math.floor(topLeft.y), // Posición Y del item
            pixelsToFillOff * scale, // Ancho del item en el canvas
            speedSpriteOff.height * scale // Alto del item en el canvas
        );
        
        ctx.fillText(
            `${(carUtils.absoluteSpeed(userCar) * 5).toFixed(1)} km/h`,
            topLeft.x + speedSpriteOn.width * scale + 10,
            topLeft.y + speedSpriteOn.height * scale / 2
        );

        // Turbo
        ctx.textAlign = "right";
        ctx.fillText(
            userCar.boostCounter,
            topLeft.x - 10,
            topLeft.y + speedSpriteOn.height * scale / 2
        );

        ctx.globalAlpha = 1.0;

        if (gamemode === GAMEMODES.RACE) {
            const minimapSize = 180;
            const circuitScale = 10;
            const minimapTopLeft = new Point(
                30,
                canvas.height - minimapSize - 30
            );

            // Fondo del minimapa
            ctx.fillStyle = "rgba(30, 30, 30, 0.5)";
            ctx.fillRect(minimapTopLeft.x, minimapTopLeft.y, minimapSize, minimapSize);

            // Circuito en el minimapa
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            for (let i = 0; i < circuit.segments.length; i++) {
                const segment = circuit.segments[i];
                ctx.beginPath();
                if (segment.type === 'straight') {
                    ctx.moveTo(
                        segment.data.start.x / circuitScale + minimapTopLeft.x + minimapSize / 2 - circuit.startPoint.coords.x / circuitScale,
                        segment.data.start.y / circuitScale + minimapTopLeft.y + minimapSize / 2 - circuit.startPoint.coords.y / circuitScale
                    );
                    ctx.lineTo(
                        segment.data.end.x / circuitScale + minimapTopLeft.x + minimapSize / 2 - circuit.startPoint.coords.x / circuitScale,
                        segment.data.end.y / circuitScale + minimapTopLeft.y + minimapSize / 2 - circuit.startPoint.coords.y / circuitScale
                    );
                }
                else if (segment.type === 'arc') {
                    ctx.arc(
                        segment.data.arcCenter.x / circuitScale + minimapTopLeft.x + minimapSize / 2 - circuit.startPoint.coords.x / circuitScale,
                        segment.data.arcCenter.y / circuitScale + minimapTopLeft.y + minimapSize / 2 - circuit.startPoint.coords.y / circuitScale,
                        segment.data.radius / circuitScale,
                        segment.data.startAngle,
                        segment.data.endAngle,
                        !segment.data.isClockwise
                    );
                }
                ctx.stroke();
            }
            ctx.lineWidth = 1;

            // Vueltas completadas
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(
                `Laps: ${lapsCompleted} / ${lapsToComplete ? lapsToComplete : "?"}`,
                minimapTopLeft.x + minimapSize / 2,
                minimapTopLeft.y - 10
            );
        }
    }

    // eslint-disable-next-line no-unused-vars
    function drawDebug() {
        cars.forEach(car => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(175, 175, 175)";
            ctx.arc(car.coords.x + camera.x, car.coords.y + camera.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(car.coords.x + camera.x, car.coords.y + camera.y);
            ctx.lineTo(car.coords.x + car.speed.x * 5 + camera.x, car.coords.y + car.speed.y * 5 + camera.y);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(car.coords.x + Math.cos(car.direction * Math.PI / 180) * 20 + camera.x, car.coords.y + Math.sin(car.direction * Math.PI / 180) * 20 + camera.y);
            ctx.lineTo(car.coords.x + Math.cos((car.direction + 10) * Math.PI / 180) * 10 + camera.x, car.coords.y + Math.sin((car.direction + 10) * Math.PI / 180) * 10 + camera.y);
            ctx.lineTo(car.coords.x + Math.cos((car.direction - 10) * Math.PI / 180) * 10 + camera.x, car.coords.y + Math.sin((car.direction - 10) * Math.PI / 180) * 10 + camera.y);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.moveTo(car.coords.x + Math.cos((car.direction + car.height/1.2) * Math.PI / 180) * -car.width/1.2 + camera.x, car.coords.y + Math.sin((car.direction + car.height/1.2) * Math.PI / 180) * -car.width/1.2 + camera.y);
            ctx.lineTo(car.coords.x + Math.cos((car.direction - car.height/1.2) * Math.PI / 180) * -car.width/1.2 + camera.x, car.coords.y + Math.sin((car.direction - car.height/1.2) * Math.PI / 180) * -car.width/1.2 + camera.y);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = "yellow";
            ctx.arc(
                car.coords.x + Math.cos((car.direction + car.height/5) * Math.PI / 180) * -car.width/1.05 + camera.x,
                car.coords.y + Math.sin((car.direction + car.height/5) * Math.PI / 180) * -car.width/1.05 + camera.y,
                4, 0, 2 * Math.PI
            );
            ctx.fill();
        });

        for (let i = 0; i < circuit.segments.length; i++) {
            ctx.strokeStyle = "gray";
            ctx.beginPath();
            if (circuit.segments[i].type === 'straight') {
                ctx.moveTo(circuit.segments[i].data.start.x + camera.x, circuit.segments[i].data.start.y + camera.y);
                ctx.lineTo(circuit.segments[i].data.end.x + camera.x, circuit.segments[i].data.end.y + camera.y);
                ctx.stroke();
                ctx.strokeStyle = "rgb(0, 255, 255)";
                ctx.beginPath();
                ctx.arc((circuit.segments[i].data.start.x + circuit.segments[i].data.end.x)/2 + camera.x, (circuit.segments[i].data.start.y + circuit.segments[i].data.end.y)/2 + camera.y, 6, 0, 2 * Math.PI);
            }
            else if (circuit.segments[i].type === 'arc') {
                ctx.arc(circuit.segments[i].data.arcCenter.x + camera.x, circuit.segments[i].data.arcCenter.y + camera.y, circuit.segments[i].data.radius, circuit.segments[i].data.startAngle, circuit.segments[i].data.endAngle, !circuit.segments[i].data.isClockwise);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(circuit.segments[i].data.arcCenter.x + camera.x, circuit.segments[i].data.arcCenter.y + camera.y, 6, 0, 2 * Math.PI);
            }
            ctx.stroke();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(circuit.segments[i].ref.coords.x + camera.x, circuit.segments[i].ref.coords.y + camera.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }

        console.log(`
                    Id: ${userCar.id}\n
                    Pos: (${userCar.coords.x.toFixed(3)}, ${userCar.coords.y.toFixed(3)})\n
                    Direction: ${userCar.direction.toFixed(3)}º [${userCar.lastDirection.toFixed(3)}º] [${turnSensitiveCounter}]\n
                    Speed: (${userCar.speed.x.toFixed(3)}, ${userCar.speed.y.toFixed(3)}) ${carUtils.isSpeedNegative(userCar) ? "-" : "+"}[${carUtils.absoluteSpeed(userCar).toFixed(3)}] <= ${carUtils.maxSpeed(userCar, movingAirFriction).toFixed(3)}\n
                    Speed angle: ${carUtils.speedAngle(userCar).toFixed(3)}º\n
                    Drifting: ${userCar.isDrifting} [${userCar.driftCancelCounter}]\n
                    Camera: (${camera.x.toFixed(3)}, ${camera.y.toFixed(3)})\n
                    IsCarInsideCircuit: ${circuit.isCarInside(userCar)}\n
                    Remaining boosts: ${userCar.boostCounter} [${userCar.boostLastUsed}]\n
                    DeltaTime: ${fpsController.deltaTime.toFixed(3)}`
        ); // Debug
    }

    // MARK: Control de juego
    function checkAiNextMove() {
        for (let i = 0; i < aiCars.length; i++) {
            const aiCar = aiCars[i];

            let precision = 0.1;
            let segment = circuit.getCurrentSegment(aiCar, precision);
            while (segment === null && precision < 1) {
                precision += 0.1;
                if (precision > 1) precision = 1;
                segment = circuit.getCurrentSegment(aiCar, precision);
            }

            const rads = aiCar.direction * Math.PI / 180;
            aiCar.speed.x += Math.cos(rads) * aiCar.speedPower;
            aiCar.speed.y += Math.sin(rads) * aiCar.speedPower;
            aiCar.isAccelerating = true;
            aiCar.isPressingAccelerateOrBrake = true;

            if (segment !== null) {
                if (Math.abs(segment.ref.direction - aiCar.direction) !== 0) {
                    aiCar.direction = (aiCar.direction % 360 + 360) % 360; // Normaliza los ángulos al rango [0, 360)
                    segment.ref.direction = (segment.ref.direction % 360 + 360) % 360;
                    let diffClockwise = (segment.ref.direction - aiCar.direction + 360) % 360; // Calcula la diferencia en ambos sentidos

                    let arcDivider = 1;
                    let sideMultiplier = 1;
                    let angleMultiplier = null;
                    let diffCircuitClockwise = null;
                    if (segment.type === "arc") {
                        arcDivider = Math.max(0.5, segment.data.radius / 400); // Ajuste para que el coche no se salga del círculo

                        const side = circuit.getArcSide(aiCar, segment);
                        if (side === "inside") sideMultiplier = 0.5;
                        else if (side === "outside") sideMultiplier = 1.5;

                        let currentAngle = circuit.getArcAngle(aiCar, segment) + (segment.data.isClockwise ? 90 : -90);
                        currentAngle = (currentAngle % 360 + 360) % 360;
                        diffCircuitClockwise = (currentAngle - aiCar.direction + 360) % 360;
                        let diffCircuitCounterClockwise = (aiCar.direction - currentAngle + 360) % 360;

                        angleMultiplier = Math.min(diffCircuitClockwise, diffCircuitCounterClockwise);
                    }

                    if ((segment.type === "arc" && segment.data.isClockwise && angleMultiplier === diffCircuitClockwise) || (segment.type === "straight" && diffClockwise <= 180)) { // Girar derecha
                        aiCar.direction += aiCar.turnForce * precision * fpsController.deltaTime / arcDivider * sideMultiplier * (angleMultiplier !== null ? Math.min(aiCar.speedPower * 1.5, angleMultiplier) : 1);
                        aiCar.direction = aiCar.direction % 360;
                        if (aiCar.direction < 0) aiCar.direction += 360;
                    }
                    else if ((segment.type === "arc" && !segment.data.isClockwise && angleMultiplier !== diffCircuitClockwise) || (segment.type === "straight" && diffClockwise > 180)) { // Girar izquierda
                        aiCar.direction -= aiCar.turnForce * precision * fpsController.deltaTime / arcDivider * sideMultiplier * (angleMultiplier !== null ? Math.min(aiCar.speedPower * 1.5, angleMultiplier) : 1);
                        aiCar.direction = aiCar.direction % 360;
                        if (aiCar.direction < 0) aiCar.direction += 360;
                    }
                }
            }
        }
    }

    function checkCarControls() {
        if (!canMove) return;

        if (controls.keys.drift.isPressed && !controls.keys.drift.actionDone) {
            if (carUtils.isSpeedNegative(userCar)) return; // Si la velocidad es negativa, no se puede derrapar
            userCar.isDrifting = true;
            controls.keys.drift.actionDone = true;
        }

        if (controls.keys.accelerate.isPressed) {
            const rads = userCar.direction * Math.PI / 180;
            let accelerationMultiplier = Math.min(1, Math.max(0.1, (carUtils.absoluteSpeed(userCar) / carUtils.maxSpeed(userCar, movingAirFriction) * userCar.accelerationPower))); // El multiplicador está entre 0.1 y 1 para poder arrancar el coche
            if (!userCar.isInsideCircuit) accelerationMultiplier = 1; // Si está fuera del circuito, no se aplica la multiplicación de la aceleración

            userCar.speed.x += Math.cos(rads) * userCar.speedPower * accelerationMultiplier;
            userCar.speed.y += Math.sin(rads) * userCar.speedPower * accelerationMultiplier;
            userCar.isAccelerating = true;
            userCar.isPressingAccelerateOrBrake = true;
        }
        else if (controls.keys.brake.isPressed) {
            if (carUtils.isSpeedNegative(userCar)) userCar.isDrifting = false; // Si la velocidad es negativa, no se puede derrapar
            const rads = userCar.direction * Math.PI / 180;

            userCar.speed.x -= Math.cos(rads) * userCar.brakingPower;
            userCar.speed.y -= Math.sin(rads) * userCar.brakingPower;
            userCar.isAccelerating = false;
            userCar.isPressingAccelerateOrBrake = true;
        }
        else userCar.isPressingAccelerateOrBrake = false;
        
        if (controls.keys.left.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                turnSensitiveCounter++;
                userCar.direction -= (!userCar.isAccelerating && carUtils.isSpeedNegative(userCar) ? -1 : 1) * // Comprobar marcha atrás
                    (userCar.turnForce * (userCar.isDrifting ? userCar.driftingTurnMultiplier : 1)) * // El giro es mayor si se está derrapando
                    (carUtils.absoluteSpeed(userCar) < userCar.turnForceThreshold ? carUtils.absoluteSpeed(userCar) / userCar.turnForceThreshold : 1) * // El giro es menor si la velocidad es baja
                    (Math.min(turnSensitiveCounter / Math.floor(turnSensitiveLimit * fpsController.deltaTime), 1)) * // El giro aumenta cuanto más tiempo se mantiene pulsada la tecla de giro
                    fpsController.deltaTime;
                userCar.direction = userCar.direction % 360;
                if (userCar.direction < 0) userCar.direction += 360;
            }
        }
        else if (controls.keys.right.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                turnSensitiveCounter++;
                userCar.direction += (!userCar.isAccelerating && carUtils.isSpeedNegative(userCar) ? -1 : 1) * // Comprobar marcha atrás
                    (userCar.turnForce * (userCar.isDrifting ? userCar.driftingTurnMultiplier : 1)) * // El giro es mayor si se está derrapando
                    (carUtils.absoluteSpeed(userCar) < userCar.turnForceThreshold ? carUtils.absoluteSpeed(userCar) / userCar.turnForceThreshold : 1) * // El giro es menor si la velocidad es baja
                    (Math.min(turnSensitiveCounter / Math.floor(turnSensitiveLimit * fpsController.deltaTime), 1)) * // El giro aumenta cuanto más tiempo se mantiene pulsada la tecla de giro
                    fpsController.deltaTime;
                userCar.direction = userCar.direction % 360;
                if (userCar.direction < 0) userCar.direction += 360;
            }
        }
        else {
            turnSensitiveCounter = 0;
        }

        if (controls.keys.boost.isPressed && !controls.keys.boost.actionDone && userCar.boostCounter > 0) {
            userCar.boostCounter--;
            userCar.boostLastUsed = Date.now();
            controls.keys.boost.actionDone = true;
        }

        const isControlsPressed = (
            (controls.keys.drift.isPressed && !controls.keys.drift.actionDone) ||
            controls.keys.accelerate.isPressed ||
            controls.keys.brake.isPressed ||
            controls.keys.left.isPressed ||
            controls.keys.right.isPressed ||
            (controls.keys.boost.isPressed && !controls.keys.boost.actionDone && userCar.boostCounter > 0)
        );

        if (controlsFramePressedCounter <= Math.floor(controlsFramePressedNumber * fpsController.deltaTime)) {
            if (isControlsPressed) controlsFramePressedCounter = 0;
            else controlsFramePressedCounter++;

            socketFrameUpdateCounter++;
            if (socketFrameUpdateCounter >= Math.floor(socketFrameUpdateNumber * fpsController.deltaTime)) {
                const message = JSON.stringify({
                    type: "move",
                    content: userCar
                });
                if (userCar.id !== null) socket.send(message);
                socketFrameUpdateCounter = 0;
            }
        }
        else if (isControlsPressed) controlsFramePressedCounter = 0; // Si después de estar sin pulsar las teclas se vuelve a pulsar, se reinicia el contador
    }

    function applySpeed() {
        cars.forEach(car => {
            car.lastCoords.x = car.coords.x;
            car.lastCoords.y = car.coords.y;
            car.coords.x += car.speed.x * fpsController.deltaTime;
            car.coords.y += car.speed.y * fpsController.deltaTime;
        });
    }

    function checkIsColliding() {
        const currentSegment = circuit.getCurrentSegment(userCar);
        if (currentSegment !== null && gamemode === GAMEMODES.RACE) segmentsVisited.add(currentSegment.id); // Si se está en modo carrera, se añade el segmento a los segmentos visitados
        userCar.isInsideCircuit = currentSegment !== null;
    }

    function checkLapCompletion() {
        if (gamemode !== GAMEMODES.RACE) return;

        // Primero se comprueba si se visitaron todos los segmentos y, en tal caso, se comprueba también si se cruzó la línea de meta
        if (circuit.segments.length === segmentsVisited.size) {
            if (circuit.hasCrossedFinishLine(userCar)) {
                segmentsVisited.clear();
                lapsCompleted++;

                if (lapsCompleted >= lapsToComplete) {
                    const message = JSON.stringify({
                        type: "finished",
                        content: userCar.id
                    });
                    if (userCar.id !== null) socket.send(message);
                }
            }
        }
    }

    function applyRotationToSpeed() {
        cars.forEach(car => {
            if (car.lastDirection != car.direction) {
                // https://matthew-brett.github.io/teaching/rotation_2d.html
                let rads = (car.direction - car.lastDirection) / (car.isDrifting ? 50 : 1) * Math.PI / 180;
                let rotationMatrix = [
                    car.speed.x * Math.cos(rads) - car.speed.y * Math.sin(rads),
                    car.speed.x * Math.sin(rads) + car.speed.y * Math.cos(rads)
                ];
                car.speed.x = rotationMatrix[0];
                car.speed.y = rotationMatrix[1];
                car.lastDirection = car.direction;
            }
        });
    }

    function applyBoostMultiplier() {
        cars.forEach(car => {
            if (car.boostLastUsed !== 0) { // Si se ha usado el turbo...
                if (Date.now() - car.boostDuration >= car.boostLastUsed) {
                    car.boostLastUsed = 0;
                }
                else {
                    car.speed.x *= car.boostMultiplier;
                    car.speed.y *= car.boostMultiplier;
                }
            }
        });
    }

    function checkIsDrifting() {
        cars.forEach(car => {
            if (car.isDrifting) {
                // Comprobamos si se sigue derrapando
                if (car.lastDirection === car.direction) {
                    car.driftCancelCounter++;
                    if (car.driftCancelCounter >= car.driftCancelMax * fpsController.deltaTime) {
                        car.isDrifting = false;
                    }
                }
                else car.driftCancelCounter = 0;
            }
        });
    }

    function applyFriction() {
        cars.forEach(car => {
            const negativeSpeed = new Point(-car.speed.x, -car.speed.y);

            // Fricción con el aire
            const angleFriction = Math.min(90, Math.abs(carUtils.speedAngle(car) - car.direction)) / 15 + 1; // La fricción con el aire aumenta cuanto más girado esté el coche (más cuerpo de coche se expone al aire)
            car.speed.x += (car.isPressingAccelerateOrBrake ? movingAirFriction : (angleFriction * idleAirFriction)) * negativeSpeed.x;
            car.speed.y += (car.isPressingAccelerateOrBrake ? movingAirFriction : (angleFriction * idleAirFriction)) * negativeSpeed.y;

            // Fricción con el suelo
            if (!car.isInsideCircuit) {
                car.speed.x *= outsideCircuitMultiplier;
                car.speed.y *= outsideCircuitMultiplier;
            }

            // Si la velocidad es muy baja, se establece a 0 (threshold de 0.01)
            if (!car.isPressingAccelerateOrBrake && carUtils.absoluteSpeed(car) < 0.01) {
                car.speed.x = 0;
                car.speed.y = 0;
            }
        });
    }

    function updateSmokeParticles() {
        cars.forEach((car, index) => {
            // Se actualiza la vida de cada partícula
            for (let i = localCarVariables[index].smokeParticles.length-1; i >= 0; i--) {
                localCarVariables[index].smokeParticles[i].life--;
                if (localCarVariables[index].smokeParticles[i].life <= 0) localCarVariables[index].smokeParticles.splice(i, 1);
            }
            
            if (car.isDrifting) {
                // Si se está derrapando, salen partículas de las ruedas traseras
                const leftWheel = new Point(
                    car.coords.x + Math.cos((car.direction + car.height/1.2) * Math.PI / 180) * -car.width/1.2,
                    car.coords.y + Math.sin((car.direction + car.height/1.2) * Math.PI / 180) * -car.width/1.2
                );

                const rightWheel = new Point(
                    car.coords.x + Math.cos((car.direction - car.height/1.2) * Math.PI / 180) * -car.width/1.2,
                    car.coords.y + Math.sin((car.direction - car.height/1.2) * Math.PI / 180) * -car.width/1.2
                );

                localCarVariables[index].smokeParticles.push({ // Rueda izquierda
                    point: new Point(
                        leftWheel.x + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2,
                        leftWheel.y + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2
                    ),
                    life: smokeParticleMaxLife
                });
                localCarVariables[index].smokeParticles.push({ // Rueda derecha
                    point: new Point(
                        rightWheel.x + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2,
                        rightWheel.y + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2
                    ),
                    life: smokeParticleMaxLife
                });

                if (car === userCar) {
                    if (Math.abs(carUtils.speedAngle(car) - car.direction) > 25 && carUtils.absoluteSpeed(car) > 1) { // Solo se crea el desgaste de las ruedas si el ángulo de la velocidad con respecto a la dirección del coche es mayor de cierto grado
                        wheelWear[0].push({
                            point: leftWheel,
                            isNewSegment: createNewWheelWearSegment
                        });
                        wheelWear[1].push({
                            point: rightWheel,
                            isNewSegment: createNewWheelWearSegment
                        });
                        createNewWheelWearSegment = false;
                    }
                    else createNewWheelWearSegment = true;
                }
            }
            else {
                if (car === userCar) { // Si no está derrapando, ir borrando el desgaste de las ruedas
                    createNewWheelWearSegment = true;
                    wheelWear[0].shift();
                    wheelWear[1].shift();
                }
            }

            // Derrapando o no, si se alcanza el límite de desgaste de las ruedas, se va borrando el desgaste para ahorrar recursos
            if (car === userCar) {
                if (wheelWear[0].length >= wheelWearLimit) {
                    wheelWear[0].shift();
                    wheelWear[1].shift();
                }
            }
        });
    }

    function updateBoostEffects() {
        // Fuego que sale del tubo de escape
        cars.forEach((car, index) => {
            const localCarVars = localCarVariables[index];

            // Se actualiza la vida de cada partícula
            for (let i = localCarVars.boostParticles.length-1; i >= 0; i--) {
                localCarVars.boostParticles[i].life--;
                if (localCarVars.boostParticles[i].life <= 0) localCarVars.boostParticles.splice(i, 1);
            }
            
            if (car.boostLastUsed !== 0) {
                // Si se está usando el turbo, salen partículas del tubo de escape
                const pipe = new Point(
                    car.coords.x + Math.cos((car.direction + car.height/5) * Math.PI / 180) * -car.width/1.05,
                    car.coords.y + Math.sin((car.direction + car.height/5) * Math.PI / 180) * -car.width/1.05
                );

                // Partículas de fuego con poca dispersión
                localCarVars.boostParticles.push({
                    point: new Point(
                        pipe.x + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2,
                        pipe.y + Math.floor(Math.random() * car.particleRandomness) - car.particleRandomness/2
                    ),
                    life: boostParticleMaxLife
                });

                // Partículas de fuego con mucha dispersión
                localCarVars.boostParticles.push({
                    point: new Point(
                        pipe.x + Math.floor(Math.random() * car.particleRandomness * 3) - car.particleRandomness/2*3,
                        pipe.y + Math.floor(Math.random() * car.particleRandomness * 3) - car.particleRandomness/2*3
                    ),
                    life: boostParticleMaxLife
                });
            }
        });

        // Partículas de aire que se mueven al revés que el coche al usar el turbo
        if (userCar.boostLastUsed === 0) boostAirParticles = []; // Si no se está usando el turbo, no existen partículas de aire
        else {
            for (let i = 0; i < boostAirParticles.length; i++) {
                const boostAirParticle = boostAirParticles[i];

                // Las partículas que se vayan fuera del canvas serán borradas
                if (
                    boostAirParticle.x < (0 + userCar.speed.x) / canvasScale ||
                    boostAirParticle.x > (canvas.width + userCar.speed.x) / canvasScale ||
                    boostAirParticle.y < (0 + userCar.speed.y) / canvasScale ||
                    boostAirParticle.y > (canvas.height + userCar.speed.y) / canvasScale
                ) {
                    boostAirParticles.splice(i, 1);
                    i--;
                    continue;
                }

                // Actualizar la posición de las partículas de aire para que se muevan en dirección contraria a la del coche
                const negativeSpeed = new Point(-userCar.speed.x, -userCar.speed.y);
                boostAirParticle.x += negativeSpeed.x * 2;
                boostAirParticle.y += negativeSpeed.y * 2;
            }

            // Si se está usando el turbo, crear partículas de aire
            if (carUtils.absoluteSpeed(userCar) > 2) {
                const newParticle = new Point(
                    Math.random() * (canvas.width + userCar.speed.x) / canvasScale,
                    Math.random() * (canvas.height + userCar.speed.y) / canvasScale
                );
                boostAirParticles.push(newParticle);
            }
            else boostAirParticles.splice(0, 1); // Si la velocidad es muy baja, se borran todas las partículas de aire
        }
    }

    // En cada frame, la cámara se sitúa en el centro del coche del jugador
    function updateCamera() {
        let shakingValue = carUtils.absoluteSpeed(userCar) * (userCar.boostLastUsed === 0 ? 1 : 2) / 8; // Si se está usando el turbo, el valor de shaking es el doble
        camera.x = -userCar.coords.x + canvas.width / 2 / canvasScale - userCar.speed.x * 5 - Math.floor(Math.random() * shakingValue) + shakingValue / 2;
        camera.y = -userCar.coords.y + canvas.height / 2 / canvasScale - userCar.speed.y * 5 - Math.floor(Math.random() * shakingValue) + shakingValue / 2;
    }

    function updatePlaybackRate() {
        const speedRatio = carUtils.absoluteSpeed(userCar) / carUtils.maxSpeed(userCar, movingAirFriction);
        sfxEngineSrc.playbackRate.value = 0.2 + Math.min(1, speedRatio) * 2.5 + (speedRatio > 1 ? (speedRatio % 0.2) * 3 : 0); // El pitch máximo se obtiene al llegar a la máxima velocidad del coche. Si se consigue ir más rápido que la velocidad máxima, el pitch hace un efecto de rebote
    }

    /**
     * Crea, elimina y actualiza los "pulsos" de los bordes del circuitos que van al ritmo de la música.
     */
    function updateMusicCircuitEdges() {
        for (let i = 0; i < musicCircuitEdges.length; i++) {
            // Si se alcanza el offset máximo, se elimina el pulso. Si no, se aumenta el offset
            if (musicCircuitEdges[i] >= musicEdgesMaxOffset) musicCircuitEdges.splice(i, 1);
            else musicCircuitEdges[i] += 2;
        }

        // Añadir un pulso si la potencia del bajo supera un cierto umbral
        if (musicBassPower / 100 > 2 && musicEdgesLimiter * fpsController.deltaTime >= musicEdgesMaxLimiter) {
            musicCircuitEdges.push(0);
            musicEdgesLimiter = 0;
        }

        if (musicEdgesLimiter * fpsController.deltaTime < musicEdgesMaxLimiter) musicEdgesLimiter++;
    }

    function updateMusicBassPower() {
        musicAnalyser.getByteFrequencyData(musicDataArray);
    
        let bassPower = 0;
        let bassRange = 10; // Aproximadamente las primeras 10 bandas (ajustar según la FFT)
        
        for (let i = 0; i < bassRange; i++) {
            bassPower += musicDataArray[i];
        }
        
        bassPower /= bassRange; // Promedio
        musicBassPower = bassPower;
    }

    /**
     * Aplica la escala al canvas
     */
    function setScale() {
        ctx.save();
        ctx.scale(canvasScale, canvasScale);
    }

    /**
     * Restaura la escala del canvas
     */
    function restoreScale() {
        ctx.restore();
    }
    
    /**
     * Actualiza la escala del canvas dependiendo de varios factores
     */
    function updateScale() {
        // Si se está usando el turbo, la cámara se aleja con respecto a la velocidad
        if (userCar.boostLastUsed !== 0) {
            const speedRatio = carUtils.absoluteSpeed(userCar) / carUtils.maxSpeed(userCar, movingAirFriction);
            canvasScale = 1 - (speedRatio - 1) / 10;
        }
        else canvasScale = 1;
    }

    function restoreLocalStorage() {
        if (localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX) !== null) {
            const index = parseInt(localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_INDEX));
            Object.assign(userCar, structuredClone(CARS[index]));
            carUtils.reset(userCar, circuit.startPoint);
        }

        if (localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT) !== null) {
            const colorShift = parseInt(localStorage.getItem(STORAGE_KEYS.ACTUAL_CAR_COLOR_SHIFT));
            userCar.color = colorShift;
        }
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        
        clearCanvas();
        setScale();

        drawCircuit();
        drawMusicCircuitEdges();
        drawDriftParticles();
        drawCars();
        drawBoostEffects();
        drawUsername();
        // drawDebug();

        restoreScale();
        drawUserInterface(); // La interfaz de usuario no se escala

        checkAiNextMove();
        checkCarControls();
        checkIsDrifting();
        checkIsColliding();
        checkLapCompletion();

        applyRotationToSpeed();
        applyBoostMultiplier();
        applyFriction();
        applySpeed();

        updateSmokeParticles();
        updateBoostEffects();
        updatePlaybackRate();
        updateMusicCircuitEdges();
        updateMusicBassPower();
        updateScale();
        updateCamera();

        fpsController.updateLastTime(now);
    }

    restoreLocalStorage();
    initEvents();
    draw();
};
document.addEventListener('DOMContentLoaded', handler);

/** MARK: TODO list
 * - [ ] Implementar modos de juego
 *     - [X] El juego será solo online, podrán unirse tantas personas como quieran en una sola sala.
 *     - [X] Entre juego y juego, se estará un par de minutos en la sala de espera.
 *         - [X] Si hay más de X personas, el contador se reducirá a un número mucho menor.
 *     - [X] Cuando se termine el tiempo de sala de espera, empezará un modo de juego aleatorio.
 *     - [ ] Modo de juego resistencia: Aguanta el mayor tiempo posible en un circuito proceduralmente generado donde tu coche irá cada vez más rápido.
 *     - [Comprobar que funciona] Modo de juego carrera: Llega antes que cualquier otro a la meta después de X vueltas.
 *     - [ ] Modo de juego supervivencia: Sé el último en pie en el circuito empujando a tus rivales. Al completar una vuelta ganas un super empuje.
 *     - [ ] Modo de juego time trial: Completa el circuito en el menor tiempo posible bajo un tiempo límite y sé el que tarde menos en completarlo.
 *     - [ ] Excepto si está expresamente indicado, los circuitos están previamente definidos (¿feedback de circuitos?).
 * - [ ] Tienes que poder pitar.
 * - [ ] Condiciones meteorológicas.
 * - [X] Mejorar la UI.
 *     - [X] Mostrar una barra de velocidad junto con los km/h y turbos restantes
 *     - [X] La cuenta atrás al empezar una partida es más vistosa.
 *     - [X] La cuenta atrás de esperar a más personas para empezar la partida debe estar centrada arriba del todo.
 *     - [X] Mostrar un minimapa del circuito abajo a la izquierda junto con las vueltas restantes.
 * - [X] Implementar sistema de frenado en vez de que al frenar se sume el vector de freno (que no es suficiente potencia para frenados más grandes).
 * - [X] Implementar el sistema de derrape.
 *     - [X] Se hará con el botón espacio.
 *     - [X] Al pulsar (no mantener) el botón, se empezará el modo derrape.
 *     - [X] Para dejar de derrapar, se debe estar conduciendo en línea recta sin girar durante un corto período de tiempo.
 *     - [X] Derrapar te permite girar más fuerte, pero cuanto más girado estás con respecto a tu dirección de la velocidad, más velocidad pierdes.
 *     - [X] Dejar rastro del neumático en el suelo.
 *     - [X] El rastro del derrape no debe tener el shaking de las partículas.
 *     - [X] Si se sigue derrapando durante un cierto tiempo, empezar a borrar el rastro igualmente aunque no haya terminado de derrapar.
 * - [X] Implementar el sistema de boost.
 *     - [X] Se hace mediante un botón.
 *     - [X] La forma de obtener el turbo depende del modo de juego en el que se esté: ya sea mediante objetos del suelo o completando vueltas en el circuito.
 *     - [X] Mientras se usa el boost, hacer que en la pantalla aparezcan partículas de fuego en la parte trasera del coche.
 *     - [X] Al usar el boost, aparecen partículas por la pantalla de color blanco que van en la dirección contraria a la velocidad del coche.
 * - [-] Implementar un creador de circuitos.
 *     - [X] Se podrán crear circuitos con líneas rectas y curvas.
 *     - [-] El circuito debería "unirse" entre segmentos. DELETED: No es necesario unir los segmentos de momento
 *     - [X] El circuito debe poder detectar si estás dentro del mismo, ralentizando el coche en caso contrario
 *     - [X] Salir del circuito hará que la potencia de aceleración se reduzca drásticamente.
 * - [X] Mejorar el sistema de cámara haciendo que sea "empujada" por el vector de velocidad del coche.
 * - [X] BUG: Las partículas de humo hay más cantidad en la rueda izquierda que en la derecha.
 * - [X] La marcha atrás + derrape debería de ser más satisfactoria.
 * - [X] Mejorar las partículas de humo.
 * - [X] BUG: El derrape ahora en 180 grados detecta que se está marcha atrás.
 * - [X] Implementar música.
 * - [X] Implementar efectos de sonido.
 * - [X] BUG: Cuantos más FPS vaya el juego, más rápido va el coche (hay que implementar el delta time).
 * - [X] BUG: Al poner el último arco al revés, no se detecta si se está dentro de dicho arco.
 * - [X] Realizar el giro del coche de forma más suave si no se mantienen pulsadas las teclas.
 * - [X] Optimizar el servidor evitando que se envíen: el array del rastro en el suelo (solo se verán las del propio usuario).
 * - [X] BUG: Al cambiar de ventana y volver, el delta time se vuelve muy grande.
 * - [X] Cuanto más girado esté el coche, más fricción con el aire tiene.
 * - [X] Hacer que las partículas de desgaste de las ruedas no pasen al servidor.
 * - [X] Implementar sistema de aceleración.
 * - [X] Implementar coches con IA.
 * - [X] Implementar un creador de circuitos, donde envíes el circuito al servidor.
 * - [X] Hacer que después de X frames, si no se ha movido el coche dejar de enviar la información al servidor, en vez de enviar info solo cuando se mueva para solucionar el problema de datos imprecisos.
 * - [X] BUG: La detección de la línea de meta no funciona correctamente.
 */