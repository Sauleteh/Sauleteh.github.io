import "../css/components/BananaClicker.css";
import { useState, useEffect, useRef } from "react";

export function BananaClicker() {
    const calcsPerSecond = 4;
    const minimumCPSThreshold = 3;

    const arraySCPS = useRef(Array(calcsPerSecond).fill(0));
    const [actualCPS, setActualCPS] = useState(0);
    const [maxCPS, setMaxCPS] = useState(0);
    let currentSCPS = 0; // Current Section Clicks Per Second (Un segundo está dividido en secciones)

    function handleBananaClick() {
        currentSCPS++;
    }

    function calculateSCPS() {
        // Añadir el SCPS a la última posición del array y borramos la primera SCPS
        arraySCPS.current.push(currentSCPS);
        arraySCPS.current.shift();
        currentSCPS = 0;

        // Calcular el CPS actual (es la suma de todos los SCPS)
        setActualCPS(arraySCPS.current.reduce((acc, val) => acc + val));
        if (actualCPS > maxCPS) setMaxCPS(actualCPS);

        if (actualCPS > minimumCPSThreshold) {
            document.querySelectorAll(".banana-clicker-text-container").forEach((container) => {
                container.classList.add("banana-clicker-text-container-active");
            });
            /**
             * TODO list:
             * [ ] Cuando se hace click, los números hacen un pequeño efecto de temblor que se incrementa cuanto mayor sea el número
             * [ ] Cuanto más alto es el CPS, los números cambian de color
             * [X] Hacer correctamente el CPS:
             *      Cada 250ms se guarda el CPS en un array de 4 elementos.
             *      Si el array está lleno, la próxima inserción se hace en la primera posición y el CPS pasa a ser la suma de los valores del array.
             *      Si el CPS es mayor que el máximo, el máximo se actualiza.
             * [X] Prevenir clicks derechos o dragging
             * [X] Si el CPS es 3 o menor después de unos segundos, desactivar y ocultar el contador
             */
        }
        else {
            document.querySelectorAll(".banana-clicker-text-container").forEach((container) => {
                container.classList.remove("banana-clicker-text-container-active");
            });
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            calculateSCPS();
        }, 1000 / calcsPerSecond);

        return () => clearInterval(interval);
    });

    return (
        <div className="banana-clicker-body">
            <div className="banana-clicker-text-container">
                <p className="banana-clicker-text">Actual</p>
                <p className="banana-clicker-text">{actualCPS} CPS</p>
            </div>
            <img className="banana-clicker-image" src="/banana-rotating.webp"
                onClick={handleBananaClick}
                onContextMenu={(event) => {event.preventDefault()}}
                onDragStart={(event) => {event.preventDefault()}}>
            </img>
            <div className="banana-clicker-text-container">
                <p className="banana-clicker-text">Máximo</p>
                <p className="banana-clicker-text">{maxCPS} CPS</p>
            </div>
        </div>
    );
}