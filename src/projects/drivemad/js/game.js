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
    let lastDirection = userCar.direction; // Solo para el userCar, para evitar aplicar rotación a la velocidad de forma inesperada

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

    function drawDebug() {
        cars.forEach(car => {
            ctx.fillStyle = "rgb(175, 175, 175)";
            ctx.arc(car.coords.x, car.coords.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(car.coords.x, car.coords.y);
            ctx.lineTo(car.coords.x + car.speed.x * 5, car.coords.y + car.speed.y * 5);
            ctx.closePath();
            ctx.stroke();

            console.log(`Pos: (${car.coords.x}, ${car.coords.y}) | Direction: ${car.direction}º | Speed: (${car.speed.x}, ${car.speed.y})`);
        });
    }

    function checkCarControls() {
        if (controls.keys.accelerate.isPressed) {
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x += Math.cos(rads);
            userCar.speed.y += Math.sin(rads);
        }
        else if (controls.keys.brake.isPressed) {
            let rads = userCar.direction * Math.PI / 180;
            userCar.speed.x -= Math.cos(rads);
            userCar.speed.y -= Math.sin(rads);
        }
        
        if (controls.keys.left.isPressed) {
            userCar.direction -= 5;
            if (userCar.direction <= 0) userCar.direction += 360;
        }
        else if (controls.keys.right.isPressed) {
            userCar.direction += 5;
            if (userCar.direction >= 360) userCar.direction -= 360;
        }
    }

    function applySpeed() {
        cars.forEach(car => {
            car.coords.x += car.speed.x;
            car.coords.y += car.speed.y;
        });
    }

    // Solo para el coche del usuario
    function applyRotationToSpeed() {
        if (lastDirection != userCar.direction) {
            // https://matthew-brett.github.io/teaching/rotation_2d.html
            let rads = (userCar.direction - lastDirection) * Math.PI / 180;
            let rotationMatrix = [
                userCar.speed.x * Math.cos(rads) - userCar.speed.y * Math.sin(rads),
                userCar.speed.x * Math.sin(rads) + userCar.speed.y * Math.cos(rads)
            ];
            userCar.speed.x = rotationMatrix[0];
            userCar.speed.y = rotationMatrix[1];
            lastDirection = userCar.direction;
        }
    }

    function applyAirFriction() {
        cars.forEach(car => {
            // TODO: En vez de aplicar fricción por todos lados, aplicarla solo en la dirección opuesta a la velocidad
            if (car.speed.x > 0) car.speed.x -= 0.1;
            else if (car.speed.x < 0) car.speed.x += 0.1;
            
            if (car.speed.y > 0) car.speed.y -= 0.1;
            else if (car.speed.y < 0) car.speed.y += 0.1;

            // Si la velocidad es muy baja, se establece a 0 (threshold de 0.001)
            if (Math.abs(car.speed.x) < 0.001) car.speed.x = 0;
            if (Math.abs(car.speed.y) < 0.001) car.speed.y = 0;
        });
    }

    function draw(now) {
        window.requestAnimationFrame(draw);
        if (!fpsController.shouldContinue(now)) return;
        // console.log(fpsController.elapsed);
        
        clearCanvas();
        drawCars();
        drawDebug();

        checkCarControls();
        applySpeed();
        applyRotationToSpeed();
        // applyAirFriction();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
});