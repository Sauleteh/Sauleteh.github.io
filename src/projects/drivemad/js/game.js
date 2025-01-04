import { FPSControllerV2 } from "./objects/FPSControllerV2.js";
import { Car } from "./objects/Car.js";
import { Point } from "./objects/Point.js";
import { Controls } from "./objects/Controls.js";
import { Circuit } from "./objects/Circuit.js";
import { CarUtils } from "./objects/CarUtils.js";
import { LocalCarVariables } from "./objects/LocalCarVariables.js";
import { Gamemodes } from "./objects/Gamemodes.js";

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
        
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    // Inicialización de variables base para el juego
    const fpsController = new FPSControllerV2(60);
    const controls = new Controls();
    const camera = new Point(0, 0); // La cámara tiene el mismo tamaño que el canvas y la coordenada que se especifica es su esquina superior izquierda. Su movimiento horizontal está invertido (+x => Izq.) y su movimiento vertical es igual al del canvas (+y => Abajo)
    const socketFrameUpdate = 1; // Cada cuántos frames se envía la actualización de posición al servidor
    let socketFrameUpdateCounter = 0; // Contador de frames para enviar la actualización de posición al servidor
    const cars = [];
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
    let turnSensitiveCounter = 0; // La sensibilidad del giro aumenta cuanto más tiempo se mantiene pulsada la tecla de giro
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

    const userCar = new Car(
        "User", // Nombre del usuario del coche
        new Point(100, 100), // Posición (del centro del coche) inicial
        0, // Ángulo (grados)
        20, // Ancho
        40, // Alto
        "red", // Color
        1.2, // Poder de velocidad
        1.5, // Poder de aceleración
        0.3, // Poder al frenar
        5, // Fuerza de giro
        4, // Velocidad para alcanzar la máxima fuerza de giro
        1.5, // Multiplicador de giro derrapando
        1.05, // Multiplicador de velocidad al usar el turbo
        1000, // Duración del turbo
    );
    cars.push(userCar); //* Debug
    localCarVariables.push(new LocalCarVariables());

    const aiCar = new Car("Bores", new Point(100, 100), 0, 20, 40, "blue", 1.2, 2, 0.3, 5, 4, 2, 1.1, 1000);
    cars.push(aiCar); //* Debug
    localCarVariables.push(new LocalCarVariables());

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

            if (data.content.gamemode === Gamemodes.RACE) {
                const circuitData = data.content.circuit;
                circuit = new Circuit(circuitData.data.circuitWidth, circuitData.data.lineWidth);
                circuit.setStartPoint(circuitData.data.startPoint);
                circuit.addInfoSegments(circuitData.data.segments);
                lapsToComplete = data.content.laps;
                if (data.content.inverted) {
                    // Si está el circuito invertido, se invierte la dirección de salida después de añadir los segmentos para que lo único que gire sean los coches
                    circuit.startPoint.direction += 180;
                    circuit.startPoint.direction = circuit.startPoint.direction % 360;
                }
            }
            else throw new Error("Unknown gamemode");

            gamemode = data.content.gamemode;
            canMove = false;
            userCar.reset(circuit.startPoint);

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

            startCountdownCount = 5;
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
            userCar.reset(circuit.startPoint);
            canMove = true;
        }
        else if (data.type === "game_end" && data.code === 0) {
            // Cuando se acaba la carrera, se recibe este evento sin recibir nada
            resetGamemodeVariables();
            gamemode = undefined;
            circuit = Circuit.defaultCircuit();
            userCar.reset(circuit.startPoint);
        }
        else console.error(`Unknown message: ${data}`);
    };

    function resetGamemodeVariables() {
        segmentsVisited.clear();
        lapsCompleted = 0;
        lapsToComplete = undefined;
    }

    function initEvents() {
        document.addEventListener("keydown", function(event) {
            const { key } = event;
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
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
            ctx.fillStyle = car.color;
            ctx.translate(car.coords.x + camera.x, car.coords.y + camera.y);
            ctx.rotate(car.direction * Math.PI / 180);
            ctx.fillRect(-car.height/2, -car.width/2, car.height, car.width); // El rectángulo se hace al revés para que aparezca mirando hacia la derecha (0 grados)
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
    }

    function drawCircuit() {
        ctx.strokeStyle = "green";
        ctx.lineWidth = circuit.lineWidth;
        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];
            if (segmentsVisited.has(segment.id)) ctx.strokeStyle = "lime";
            else ctx.strokeStyle = "green";

            if (segment.type === 'straight') {
                ctx.beginPath();
                ctx.moveTo(segment.data.start.x - segment.data.widthSin + camera.x, segment.data.start.y + segment.data.widthCos + camera.y);
                ctx.lineTo(segment.data.end.x - segment.data.widthSin + camera.x, segment.data.end.y + segment.data.widthCos + camera.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(segment.data.start.x + segment.data.widthSin + camera.x, segment.data.start.y - segment.data.widthCos + camera.y);
                ctx.lineTo(segment.data.end.x + segment.data.widthSin + camera.x, segment.data.end.y - segment.data.widthCos + camera.y);
                ctx.stroke();
            }
            else if (segment.type === 'arc') {
                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, segment.data.radius - circuit.circuitWidth / 2, segment.data.startAngle, segment.data.endAngle, !segment.data.isClockwise);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(segment.data.arcCenter.x + camera.x, segment.data.arcCenter.y + camera.y, segment.data.radius + circuit.circuitWidth / 2, segment.data.startAngle, segment.data.endAngle, !segment.data.isClockwise);
                ctx.stroke();
            }
        }
        ctx.lineWidth = 1;
    }

    function drawUsername() {
        // Dibujar debajo del coche el nombre de usuario
        cars.forEach(car => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(car.name, car.coords.x + camera.x, car.coords.y + camera.y + car.width + 12);
        });
    }

    function drawUserInterface() {
        ctx.fillStyle = "black";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Boosts: ${userCar.boostCounter}`, 10, 10);
        ctx.fillText(`Speed: ${(carUtils.absoluteSpeed(userCar) * 5).toFixed(1)} km/h`, 10, 40);
        ctx.fillText(`Until next game: ${waitCountdownCount ? (waitCountdownCount + " seconds") : "Waiting for players"}`, 10, 70);
        ctx.fillText(`Start countdown: ${startCountdownCount ? (startCountdownCount + " seconds") : "Waiting for start"}`, 10, 100);
        ctx.fillText(`Laps: ${lapsCompleted} / ${lapsToComplete ? lapsToComplete : "?"}`, 10, 130);
    }

    function drawDebug() {
        cars.forEach(car => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(175, 175, 175)";
            ctx.arc(car.coords.x + camera.x, car.coords.y + camera.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "black";
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
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(circuit.segments[i].ref.coords.x + camera.x, circuit.segments[i].ref.coords.y + camera.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Dibujar línea de meta
        ctx.strokeStyle = circuit.hasCrossedFinishLine(userCar) ? "white" : "red";
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

        if (
            (controls.keys.drift.isPressed && !controls.keys.drift.actionDone) ||
            controls.keys.accelerate.isPressed ||
            controls.keys.brake.isPressed ||
            controls.keys.left.isPressed ||
            controls.keys.right.isPressed ||
            (controls.keys.boost.isPressed && !controls.keys.boost.actionDone && userCar.boostCounter > 0)
        ) {
            socketFrameUpdateCounter++;
            if (socketFrameUpdateCounter >= Math.floor(socketFrameUpdate * fpsController.deltaTime)) {
                const message = JSON.stringify({
                    type: "move",
                    content: userCar
                });
                socket.send(message);
                socketFrameUpdateCounter = 0;
            }
        }
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
        if (currentSegment !== null && gamemode === Gamemodes.RACE) segmentsVisited.add(currentSegment.id); // Si se está en modo carrera, se añade el segmento a los segmentos visitados
        userCar.isInsideCircuit = currentSegment !== null;
    }

    function checkLapCompletion() {
        if (gamemode !== Gamemodes.RACE) return;

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
                    socket.send(message);
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
    }

    // En cada frame, la cámara se sitúa en el centro del coche del jugador
    function updateCamera() {
        let shakingValue = carUtils.absoluteSpeed(userCar) * (userCar.boostLastUsed === 0 ? 1 : 2) / 8; // Si se está usando el turbo, el valor de shaking es el doble
        camera.x = -userCar.coords.x + canvas.width / 2 - userCar.speed.x * 5 - Math.floor(Math.random() * shakingValue) + shakingValue / 2;
        camera.y = -userCar.coords.y + canvas.height / 2 - userCar.speed.y * 5 - Math.floor(Math.random() * shakingValue) + shakingValue / 2;
    }

    function updatePlaybackRate() {
        const speedRatio = carUtils.absoluteSpeed(userCar) / carUtils.maxSpeed(userCar, movingAirFriction);
        sfxEngineSrc.playbackRate.value = 0.2 + Math.min(1, speedRatio) * 2.5 + (speedRatio > 1 ? (speedRatio % 0.2) * 3 : 0); // El pitch máximo se obtiene al llegar a la máxima velocidad del coche. Si se consigue ir más rápido que la velocidad máxima, el pitch hace un efecto de rebote
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        // console.log(fpsController.elapsed);
        
        clearCanvas();
        drawCircuit();
        drawDriftParticles();
        drawCars();
        drawBoostEffects();
        drawUsername();
        drawUserInterface();
        drawDebug();

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
        updateCamera();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
};
document.addEventListener('DOMContentLoaded', handler);

/** MARK: TODO list
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
 *     - [ ] Al usar el boost, aparecen partículas por la pantalla de color blanco que van en la dirección contraria a la velocidad del coche.
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
 * - [ ] Implementar música.
 * - [X] Implementar efectos de sonido.
 * - [X] BUG: Cuantos más FPS vaya el juego, más rápido va el coche (hay que implementar el delta time).
 * - [X] BUG: Al poner el último arco al revés, no se detecta si se está dentro de dicho arco.
 * - [ ] Tienes que poder pitar.
 * - [ ] Condiciones meteorológicas.
 * - [X] Realizar el giro del coche de forma más suave si no se mantienen pulsadas las teclas.
 * - [X] Optimizar el servidor evitando que se envíen: el array del rastro en el suelo (solo se verán las del propio usuario).
 * - [X] BUG: Al cambiar de ventana y volver, el delta time se vuelve muy grande.
 * - [X] Cuanto más girado esté el coche, más fricción con el aire tiene.
 * - [X] Hacer que las partículas de desgaste de las ruedas no pasen al servidor.
 * - [X] Implementar sistema de aceleración.
 * - [X] Implementar coches con IA.
 * - [ ] Implementar un garaje donde puedas modificar tu coche.
 * - [ ] Implementar un creador de circuitos, donde envíes el circuito al servidor y este lo envíe a los demás jugadores.
 * - [ ] Hacer que después de X frames, si no se ha movido el coche dejar de enviar la información al servidor, en vez de enviar info solo cuando se mueva para solucionar el problema de datos imprecisos.
 * - [X] BUG: La detección de la línea de meta no funciona correctamente.
 */