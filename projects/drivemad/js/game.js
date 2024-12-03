import { FPSControllerV2 } from "./FPSControllerV2.js";
import { Car } from "./Car.js";
import { Point } from "./Point.js";
import { Controls } from "./Controls.js";
import { Circuit } from "./Circuit.js";

document.addEventListener('DOMContentLoaded', function() {
    const sfxEngine = document.querySelector("#sfxEngine");
    sfxEngine.preservesPitch = false;
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;
    ctx.imageSmoothingEnabled = false;  // Desactiva el suavizado de imágenes

    const fpsController = new FPSControllerV2(60);
    const controls = new Controls();
    const camera = new Point(0, 0); // La cámara tiene el mismo tamaño que el canvas y la coordenada que se especifica es su esquina superior izquierda. Su movimiento horizontal está invertido (+x => Izq.) y su movimiento vertical es igual al del canvas (+y => Abajo)

    const airFriction = 0.1;
    const outsideCircuitMultiplier = 0.8;
    const cars = [];
    const circuit = new Circuit(240, 16);
    circuit.setStartPoint(100, 100, 0);
    // circuit.addSegment(circuit.arc(1500, 360));
    circuit.addSegment(circuit.straightLine(125000));
    // circuit.addSegment(circuit.arc(100, 180));
    // circuit.addSegment(circuit.straightLine(400));
    // circuit.addSegment(circuit.arc(100, -180));
    // circuit.addSegment(circuit.arc(1000, 39));

    const userCar = new Car(
        "User", // Nombre del usuario del coche
        new Point(100, 100), // Posición (del centro del coche) inicial
        0, // Ángulo (grados)
        20, // Ancho
        40, // Alto
        "red", // Color
        new Point(0, 0), // Velocidad inicial
        1.2, // Poder de aceleración
        0.3, // Poder al frenar
        5, // Fuerza de giro
        4, // Velocidad para alcanzar la máxima fuerza de giro
        1.5, // Multiplicador de giro derrapando
        1.05, // Multiplicador de velocidad al usar el turbo
        1000, // Duración del turbo
        5, // Tamaño de las partículas de humo al derrapar
        4 // Aleatoriedad de movimiento de las partículas de humo
    );
    cars.push(userCar); //* Debug

    const aiCar = new Car("IA", new Point(200, 200), 25, 20, 40, "blue", new Point(0, 0), 1.2, 0.3, 5, 4, 2, 1.1, 1000, 5, 4);
    cars.push(aiCar); //* Debug

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

        if (data.type === "login_id" && data.code === 0) {
            // Aquí se recibe el id del usuario proporcionado por el servidor
            userCar.id = data.content;
        }
        else if (data.type === "login_new_car" && data.code === 0) {
            // Aquí se reciben los coches recién conectados al servidor o la lista de coches si se acaba de entrar
            cars.push(data.content);
        }
        else if (data.type === "move" && data.code === 0) {
            // Aquí se reciben las actualizaciones de posición de los coches
            const index = cars.findIndex(car => car.id === data.content.id);
            if (index !== -1) cars[index] = data.content;
        }
        else if (data.type === "logout" && data.code === 0) {
            // Aquí se recibe el id del coche que se ha desconectado
            const index = cars.findIndex(car => car.id === data.content);
            if (index !== -1) cars.splice(index, 1);
        }
    };

    function initEvents() {
        document.addEventListener("keydown", function(event) {
            const { key } = event;
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
            controls.checkControls(key, "up");
        });

        sfxEngine.addEventListener("timeupdate", function() {
            if (this.currentTime > this.duration - 1.5) {
                this.currentTime = 0;
                this.play();
            }
        });

        // Comenzar ejecución del sonido al hacer click en la pantalla (se necesita evento de usuario obligatorio para esto)
        document.addEventListener('click', () => {
            sfxEngine.play();
         }, { once: true })
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

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
        cars.forEach(car => {
            ctx.fillStyle = "gray";
            ctx.strokeStyle = "lightgray";
            ctx.lineWidth = car.smokeParticleSize;
            for (let i = 0; i < car.wheelWear.length; i++) 
            {
                if (car.wheelWear[i].length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(car.wheelWear[i][0].point.x + camera.x, car.wheelWear[i][0].point.y + camera.y);
                    for (let j = 1; j < car.wheelWear[i].length; j++) {
                        if (car.wheelWear[i][j].isNewSegment) { // Si es un nuevo segmento, se pinta el punto anterior y se empieza un nuevo segmento
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(car.wheelWear[i][j].point.x + camera.x, car.wheelWear[i][j].point.y + camera.y);
                        }
                        else ctx.lineTo(car.wheelWear[i][j].point.x + camera.x, car.wheelWear[i][j].point.y + camera.y);
                    }
                    ctx.stroke();
                }
            }
            for (let i = 0; i < car.smokeParticles.length; i++) {
                const smokeParticle = car.smokeParticles[i];
                ctx.fillRect(
                    smokeParticle.point.x - car.smokeParticleSize / 2 + camera.x,
                    smokeParticle.point.y - car.smokeParticleSize / 2 + camera.y,
                    car.smokeParticleSize * smokeParticle.life / 10,
                    car.smokeParticleSize * smokeParticle.life / 10
                );
            }
        });
        ctx.lineWidth = 1;
    }

    function drawCircuit() {
        ctx.strokeStyle = "green";
        ctx.lineWidth = circuit.lineWidth;
        for (let i = 0; i < circuit.segments.length; i++) {
            const segment = circuit.segments[i];
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
            ctx.fillText(car.name, car.coords.x + camera.x, car.coords.y + camera.y + car.width + 12);
        });
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

        console.log(`
                    Id: ${userCar.id}\n
                    Pos: (${userCar.coords.x.toFixed(3)}, ${userCar.coords.y.toFixed(3)})\n
                    Direction: ${userCar.direction.toFixed(3)}º\n
                    Speed: (${userCar.speed.x.toFixed(3)}, ${userCar.speed.y.toFixed(3)}) [${userCar.absoluteSpeed.toFixed(3)}]\n
                    Drifting: ${userCar.isDrifting} (${userCar.driftCancelCounter})\n
                    NegativeSpeed: ${userCar.isSpeedNegative ? "Yes" : "No"}\n
                    Camera: [${camera.x.toFixed(3)}, ${camera.y.toFixed(3)}]\n
                    IsCarInsideCircuit: ${circuit.isCarInside(userCar)}\n
                    Remaining boosts: ${userCar.boostCounter}\n
                    BoostLastUsed: ${userCar.boostLastUsed}`
        ); // Debug
    }

    function checkCarControls() {
        if (controls.keys.drift.isPressed && !controls.keys.drift.actionDone) {
            if (userCar.isSpeedNegative) return; // Si la velocidad es negativa, no se puede derrapar
            userCar.isDrifting = true;
            controls.keys.drift.actionDone = true;
        }

        if (controls.keys.accelerate.isPressed) {
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x += Math.cos(rads) * userCar.accelerationPower;
            userCar.speed.y += Math.sin(rads) * userCar.accelerationPower;
            userCar.isAccelerating = true;

            if (!userCar.isInsideCircuit) {
                userCar.speed.x *= outsideCircuitMultiplier;
                userCar.speed.y *= outsideCircuitMultiplier;
            }
        }
        else if (controls.keys.brake.isPressed) {
            if (userCar.isSpeedNegative) userCar.isDrifting = false; // Si la velocidad es negativa, no se puede derrapar
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x -= Math.cos(rads) * userCar.brakingPower;
            userCar.speed.y -= Math.sin(rads) * userCar.brakingPower;
            userCar.isAccelerating = false;

            if (!userCar.isInsideCircuit) {
                userCar.speed.x *= outsideCircuitMultiplier;
                userCar.speed.y *= outsideCircuitMultiplier;
            }
        }
        
        if (controls.keys.left.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                userCar.direction -= (!userCar.isAccelerating && userCar.isSpeedNegative ? -1 : 1) * (userCar.turnForce * (userCar.isDrifting ? userCar.driftingTurnMultiplier : 1)) * (userCar.absoluteSpeed < userCar.turnForceThreshold ? userCar.absoluteSpeed / userCar.turnForceThreshold : 1);
                userCar.direction = userCar.direction % 360;
                if (userCar.direction < 0) userCar.direction += 360;
            }
        }
        else if (controls.keys.right.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                userCar.direction += (!userCar.isAccelerating && userCar.isSpeedNegative ? -1 : 1) * (userCar.turnForce * (userCar.isDrifting ? userCar.driftingTurnMultiplier : 1)) * (userCar.absoluteSpeed < userCar.turnForceThreshold ? userCar.absoluteSpeed / userCar.turnForceThreshold : 1);
                userCar.direction = userCar.direction % 360;
                if (userCar.direction < 0) userCar.direction += 360;
            }
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
            const message = JSON.stringify({
                type: "move",
                content: userCar
            });
            socket.send(message);
        }
    }

    function applySpeed() {
        cars.forEach(car => {
            car.coords.x += car.speed.x;
            car.coords.y += car.speed.y;
        });
    }

    function checkIsColliding() {
        userCar.isInsideCircuit = circuit.isCarInside(userCar);
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
                    if (car.driftCancelCounter >= car.driftCancelMax) {
                        car.isDrifting = false;
                    }
                }
                else car.driftCancelCounter = 0;
            }
        });
    }

    function applyAirFriction() {
        cars.forEach(car => {
            //if (car.isSpeedNegative) return; // Si la velocidad es negativa, no se aplica la fricción del aire
            let negativeSpeed = new Point(-car.speed.x, -car.speed.y);
            car.speed.x += airFriction * negativeSpeed.x;
            car.speed.y += airFriction * negativeSpeed.y;

            // Si la velocidad es muy baja, se establece a 0 (threshold de 0.001)
            if (Math.abs(car.speed.x) < 0.001) car.speed.x = 0;
            if (Math.abs(car.speed.y) < 0.001) car.speed.y = 0;
        });
    }

    function updateSmokeParticles() {
        cars.forEach(car => {
            // Se actualiza la vida de cada partícula
            for (let i = car.smokeParticles.length-1; i >= 0; i--) {
                car.smokeParticles[i].life--;
                if (car.smokeParticles[i].life <= 0) car.smokeParticles.splice(i, 1);
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

                car.smokeParticles.push({ // Rueda izquierda
                    point: new Point(
                        leftWheel.x + Math.floor(Math.random() * car.smokeParticleRandomness) - car.smokeParticleRandomness/2,
                        leftWheel.y + Math.floor(Math.random() * car.smokeParticleRandomness) - car.smokeParticleRandomness/2
                    ),
                    life: 10
                });
                car.smokeParticles.push({ // Rueda derecha
                    point: new Point(
                        rightWheel.x + Math.floor(Math.random() * car.smokeParticleRandomness) - car.smokeParticleRandomness/2,
                        rightWheel.y + Math.floor(Math.random() * car.smokeParticleRandomness) - car.smokeParticleRandomness/2
                    ),
                    life: 10
                });

                const speedAngle = Math.atan2(car.speed.y, car.speed.x) * 180 / Math.PI;
                if (Math.abs(speedAngle - car.direction) > 25 && car.absoluteSpeed > 1) { // Solo se crea el desgaste de las ruedas si el ángulo de la velocidad con respecto a la dirección del coche es mayor de cierto grado
                    car.wheelWear[0].push({
                        point: leftWheel,
                        isNewSegment: car.createNewWheelWearSegment
                    });
                    car.wheelWear[1].push({
                        point: rightWheel,
                        isNewSegment: car.createNewWheelWearSegment
                    });
                    car.createNewWheelWearSegment = false;
                }
                else {
                    car.createNewWheelWearSegment = true;
                    car.wheelWear[0].shift();
                    car.wheelWear[1].shift();
                }
            }
            else {
                car.createNewWheelWearSegment = true;
                car.wheelWear[0].shift();
                car.wheelWear[1].shift();
            }
        });
    }

    // En cada frame, la cámara se sitúa en el centro del coche del jugador
    function updateCamera() {
        let shakingValue = userCar.absoluteSpeed * (userCar.boostLastUsed === 0 ? 1 : 2) / 8; // Si se está usando el turbo, el valor de shaking es el doble
        camera.x = -userCar.coords.x + canvas.width / 2 - userCar.speed.x * 5 - Math.floor(Math.random() * shakingValue) + shakingValue/2;
        camera.y = -userCar.coords.y + canvas.height / 2 - userCar.speed.y * 5 - Math.floor(Math.random() * shakingValue) + shakingValue/2;
    }

    function updatePlaybackRate() {
        sfxEngine.playbackRate = 0.5 + userCar.absoluteSpeed / 5;
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        // console.log(fpsController.elapsed);
        
        clearCanvas();
        drawCircuit();
        drawDriftParticles();
        drawCars();
        drawUsername();
        drawDebug();
        
        let rads = aiCar.direction * Math.PI / 180; //* Debug
        aiCar.speed.x += Math.cos(rads) * aiCar.accelerationPower;
        aiCar.speed.y += Math.sin(rads) * aiCar.accelerationPower;
        if (aiCar.speed.x != 0 || aiCar.speed.y != 0) {
            aiCar.direction -= (aiCar.isSpeedNegative ? -1 : 1) * (aiCar.turnForce * (aiCar.isDrifting ? aiCar.driftingTurnMultiplier : 1)) * (aiCar.absoluteSpeed < aiCar.turnForceThreshold ? aiCar.absoluteSpeed / aiCar.turnForceThreshold : 1);
            aiCar.direction = aiCar.direction % 360;
            if (aiCar.direction < 0) aiCar.direction += 360;
        }

        updateCamera();
        checkCarControls();
        checkIsDrifting();
        applySpeed();
        checkIsColliding();
        applyRotationToSpeed();
        applyBoostMultiplier();
        applyAirFriction();
        updateSmokeParticles();
        updatePlaybackRate();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
});

/** TODO list:
 * - [X] Implementar sistema de frenado en vez de que al frenar se sume el vector de freno (que no es suficiente potencia para frenados más grandes).
 * - [X] Implementar el sistema de derrape.
 *     - [X] Se hará con el botón espacio.
 *     - [X] Al pulsar (no mantener) el botón, se empezará el modo derrape.
 *     - [X] Para dejar de derrapar, se debe estar conduciendo en línea recta sin girar durante un corto período de tiempo.
 *     - [X] Derrapar te permite girar más fuerte, pero cuanto más girado estás con respecto a tu dirección de la velocidad, más velocidad pierdes.
 *     - [X] Dejar rastro del neumático en el suelo.
 *     - [X] El rastro del derrape no debe tener el shaking de las partículas.
 *     - [ ] Si se sigue derrapando durante un cierto tiempo, empezar a borrar el rastro igualmente aunque no haya terminado de derrapar.
 * - [X] Implementar el sistema de boost.
 *     - [X] Se hace mediante un botón.
 *     - [X] La forma de obtener el turbo depende del modo de juego en el que se esté: ya sea mediante objetos del suelo o completando vueltas en el circuito.
 *     - [ ] Mientras se usa el boost, hacer que en la pantalla aparezcan partículas de fuego en la parte trasera del coche.
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
 *     - [ ] El juego será solo online, podrán unirse tantas personas como quieran en una sola sala.
 *     - [ ] Entre juego y juego, se estará un par de minutos en la sala de espera.
 *         - [ ] Si hay más de X personas, el contador se reducirá a un número mucho menor.
 *         - [ ] En la sala de espera, además de conducir mientras tanto, podrás cambiar tu coche (¿modificarlo?)
 *     - [ ] Cuando se termine el tiempo de sala de espera, empezará un modo de juego aleatorio.
 *     - [ ] Modo de juego resistencia: Aguanta el mayor tiempo posible en un circuito proceduralmente generado donde tu coche irá cada vez más rápido.
 *     - [ ] Modo de juego carrera: Llega antes que cualquier otro a la meta después de X vueltas.
 *     - [ ] Modo de juego supervivencia: Sé el último en pie en el circuito empujando a tus rivales. Al completar una vuelta ganas un super empuje.
 *     - [ ] Excepto si está expresamente indicado, los circuitos están previamente definidos (¿feedback de circuitos?).
 * - [ ] Implementar música.
 * - [ ] Implementar efectos de sonido.
 * - [ ] BUG: Cuantos más FPS vaya el juego, más rápido va el coche (hay que implementar el delta time).
 * - [X] BUG: Al poner el último arco al revés, no se detecta si se está dentro de dicho arco.
 */