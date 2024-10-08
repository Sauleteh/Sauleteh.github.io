import { FPSControllerV2 } from "./FPSControllerV2.js";
import { Car } from "./Car.js";
import { Point } from "./Point.js";
import { Controls } from "./Controls.js";

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector("canvas.game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;

    const fpsController = new FPSControllerV2(60);
    const controls = new Controls();

    const cars = [];

    const userCar = new Car(new Point(100, 100), 0, 20, 40, "red", new Point(0, 0));
    cars.push(userCar); //* Debug

    const airFriction = 0.1;
    const acceleratePower = 1.2;
    const brakePower = 0.3;
    const baseDirection = 5; // En grados
    const maxDirectionThreshold = 4; // Velocidad a la que se alcanza la máxima torsión

    function initEvents() {
        document.addEventListener("keydown", function(evnt) {
            const { key } = event;
            controls.checkControls(key, "down");
        });

        document.addEventListener("keyup", function(event) {
            const { key } = event;
            controls.checkControls(key, "up");
        });
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawCars() {
        cars.forEach(car => {
            ctx.save();
            ctx.fillStyle = car.color;
            ctx.translate(car.coords.x, car.coords.y);
            ctx.rotate(car.direction * Math.PI / 180);
            ctx.fillRect(-car.height/2, -car.width/2, car.height, car.width); // El rectángulo se hace al revés para que aparezca mirando hacia la derecha (0 grados)
            ctx.restore();
        });
    }

    function drawDrifting() {
        cars.forEach(car => {
            ctx.fillStyle = "gray";
            for (let i = 0; i < car.smokeParticles.length; i++) {
                const smokeParticle = car.smokeParticles[i];
                ctx.fillRect(smokeParticle.point.x, smokeParticle.point.y, 5, 5);
            }
        });
    }

    function drawDebug() {
        cars.forEach(car => {
            ctx.fillStyle = "rgb(175, 175, 175)";
            ctx.arc(car.coords.x, car.coords.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(car.coords.x, car.coords.y);
            ctx.lineTo(car.coords.x + car.speed.x * 5, car.coords.y + car.speed.y * 5);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(car.coords.x + Math.cos(car.direction * Math.PI / 180) * 20, car.coords.y + Math.sin(car.direction * Math.PI / 180) * 20);
            ctx.lineTo(car.coords.x + Math.cos((car.direction + 10) * Math.PI / 180) * 10, car.coords.y + Math.sin((car.direction + 10) * Math.PI / 180) * 10);
            ctx.lineTo(car.coords.x + Math.cos((car.direction - 10) * Math.PI / 180) * 10, car.coords.y + Math.sin((car.direction - 10) * Math.PI / 180) * 10);
            ctx.closePath();
            ctx.stroke();

            console.log(`Pos: (${car.coords.x.toFixed(3)}, ${car.coords.y.toFixed(3)}) | Direction: ${car.direction.toFixed(3)}º | Speed: (${car.speed.x.toFixed(3)}, ${car.speed.y.toFixed(3)}) [${userCar.absoluteSpeed.toFixed(3)}] | Drifting: ${userCar.isDrifting}`); // Debug
        });
    }

    function checkCarControls() {
        if (controls.keys.drift.isPressed && !controls.keys.drift.actionDone) {
            userCar.isDrifting = true;
            controls.keys.drift.actionDone = true;
        }

        if (controls.keys.accelerate.isPressed) {
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x += Math.cos(rads) * acceleratePower;
            userCar.speed.y += Math.sin(rads) * acceleratePower;
        }
        else if (controls.keys.brake.isPressed) {
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x -= Math.cos(rads) * brakePower;
            userCar.speed.y -= Math.sin(rads) * brakePower;
        }
        
        if (controls.keys.left.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                userCar.direction -= (baseDirection * (userCar.isDrifting ? 1.5 : 1)) * (userCar.absoluteSpeed < maxDirectionThreshold ? userCar.absoluteSpeed / maxDirectionThreshold : 1);
                if (userCar.direction <= 0) userCar.direction += 360;
            }
        }
        else if (controls.keys.right.isPressed) {
            if (userCar.speed.x != 0 || userCar.speed.y != 0) {
                userCar.direction += (baseDirection * (userCar.isDrifting ? 1.5 : 1)) * (userCar.absoluteSpeed < maxDirectionThreshold ? userCar.absoluteSpeed / maxDirectionThreshold : 1);
                if (userCar.direction >= 360) userCar.direction -= 360;
            }
        }
    }

    function applySpeed() {
        cars.forEach(car => {
            car.coords.x += car.speed.x;
            car.coords.y += car.speed.y;
        });
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

    function checkIsDrifting() {
        cars.forEach(car => {
            if (car.isDrifting) {
                // Comprobamos si se sigue derrapando
                if (car.lastDirection === car.direction) {
                    car.driftCancelCounter++;
                    if (car.driftCancelCounter >= 20) {
                        car.isDrifting = false;
                    }
                }
                else car.driftCancelCounter = 0;
            }
        });
    }

    function applyAirFriction() {
        cars.forEach(car => {
            let negativeSpeed = new Point(-car.speed.x, -car.speed.y);
            car.speed.x += airFriction * negativeSpeed.x
            car.speed.y += airFriction * negativeSpeed.y

            // Si la velocidad es muy baja, se establece a 0 (threshold de 0.001)
            if (Math.abs(car.speed.x) < 0.001) car.speed.x = 0;
            if (Math.abs(car.speed.y) < 0.001) car.speed.y = 0;
        });
    }

    function updateSmokeParticles() {
        cars.forEach(car => {
            // Se actualiza la vida de cada partícula
            for (let i = 0; i < car.smokeParticles.length; i++) {
                car.smokeParticles[i].life--;
                if (car.smokeParticles[i].life <= 0) car.smokeParticles.splice(i, 1);
            }
            
            if (car.isDrifting) {
                // Si se está derrapando, salen partículas de las ruedas traseras
                car.smokeParticles.push({ // Rueda izquierda
                    point: new Point(car.coords.x + Math.cos((car.direction + car.height) * Math.PI / 180) * -car.width/1.2, car.coords.y + Math.sin((car.direction + car.height) * Math.PI / 180) * -car.width/1.5),
                    life: 10
                });
                car.smokeParticles.push({ // Rueda derecha
                    point: new Point(car.coords.x + Math.cos((car.direction - car.height) * Math.PI / 180) * -car.width/2.1, car.coords.y + Math.sin((car.direction - car.height) * Math.PI / 180) * -car.width/1.5),
                    life: 10
                });
            }
        });
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        // console.log(fpsController.elapsed);
        
        clearCanvas();
        drawDrifting();
        drawCars();
        drawDebug();

        checkCarControls();
        checkIsDrifting();
        applySpeed();
        applyRotationToSpeed();
        applyAirFriction();
        updateSmokeParticles();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
});

/** TODO list:
 * - [ ] Implementar sistema de frenado en vez de que al frenar se sume el vector de freno (que no es suficiente potencia para frenados más grandes).
 * - [ ] Implementar el sistema de derrape.
 *     - [X] Se hará con el botón espacio.
 *     - [X] Al pulsar (no mantener) el botón, se empezará el modo derrape.
 *     - [X] Para dejar de derrapar, se debe estar conduciendo en línea recta sin girar durante un corto período de tiempo.
 *     - [ ] Derrapar te permite girar más fuerte, pero cuanto más girado estás con respecto a tu dirección de la velocidad, más velocidad pierdes.
 * - [ ] Implementar el sistema de boost.
 *     - [ ] Se podría hacer con un botón o mediante objetos en el suelo.
 */