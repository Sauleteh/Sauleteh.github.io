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

    const userCar = new Car(new Point(100, 100), 0, 20, 40, "red", new Point(0, 10));
    cars.push(userCar); //* Debug

    function initEvents() {
        document.addEventListener("keydown", function(event) {
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
            ctx.fillStyle = car.color;
            ctx.rotate(car.direction * Math.PI / 180);
            ctx.fillRect(car.coords.x - car.width/2, car.coords.y - car.height/2, car.width, car.height);
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
        });
    }

    function checkCarControls() {
        if (controls.keys.accelerate.isPressed) {
            // TODO
        }
    }

    function applySpeed() {
        cars.forEach(car => {
            car.coords.x += car.speed.x;
            car.coords.y += car.speed.y;
        });
    }

    function applyAirFriction() {
        cars.forEach(car => {
            if (car.speed.x > 0) car.speed.x -= 1;
            else if (car.speed.x < 0) car.speed.x += 1;
            
            if (car.speed.y > 0) car.speed.y -= 1;
            else if (car.speed.y < 0) car.speed.y += 1;
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
        applyAirFriction();

        fpsController.updateLastTime(now);
    }

    initEvents();
    draw();
});