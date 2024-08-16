import "../css/components/BananaClicker.css";
import { useState, useEffect, useRef } from "react";

export function BananaClicker() {
    const calcsPerSecond = 4;
    const minimumCPSThreshold = 3;

    const arraySCPS = useRef(Array(calcsPerSecond).fill(0));
    const [actualCPS, setActualCPS] = useState(0);
    const [maxCPS, setMaxCPS] = useState(0);
    let currentSCPS = 0; // Current Section Clicks Per Second (Un segundo está dividido en secciones)
    let bananaCoins = useRef(0); // Para no tener que estar invocando localStorage todo el rato, lo guardamos en una variable

    function handleBananaClick() {
        currentSCPS++;
        localStorage.setItem("coin_banana", ++bananaCoins.current);
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
            // Calcular variables para el texto
            let textColor = document.documentElement.style.getPropertyValue("--ld-bananaclicker-text");
            let textShakeDuration = 0;

            if (actualCPS >= minimumCPSThreshold + 12) { textColor = "purple"; textShakeDuration = 0.1; }
            else if (actualCPS >= minimumCPSThreshold + 9) { textColor = "red"; textShakeDuration = 0.25; }
            else if (actualCPS >= minimumCPSThreshold + 6) { textColor = "orange"; textShakeDuration = 0.5; }
            else if (actualCPS >= minimumCPSThreshold + 3) { textColor = "yellow"; textShakeDuration = 1; }

            document.querySelectorAll(".banana-clicker-text-container").forEach((container) => {
                container.classList.add("banana-clicker-text-container-active");
                container.style.setProperty("--banana-clicker-text-color", textColor);
                container.style.setProperty("--banana-clicker-text-animation-duration", textShakeDuration + "s");
            });
        }
        else {
            document.querySelectorAll(".banana-clicker-text-container").forEach((container) => {
                container.classList.remove("banana-clicker-text-container-active");
            });
        }
    }

    useEffect(() => {
        bananaCoins.current = localStorage.getItem("coin_banana") === null || localStorage.getItem("coin_banana") === "" ? 0 : parseInt(localStorage.getItem("coin_banana"));

        const interval = setInterval(() => {
            calculateSCPS();
        }, 1000 / calcsPerSecond);

        return () => clearInterval(interval);
    });

    return (
        <div className="banana-clicker-body">
            <div className="banana-clicker-text-container">
                <p className="banana-clicker-text">Actual</p>
                <p className="banana-clicker-text banana-clicker-text-number">{actualCPS} CPS</p>
            </div>
            <img className="banana-clicker-image" src="/banana-rotating.webp"
                onClick={handleBananaClick}
                onContextMenu={(event) => {event.preventDefault()}}
                onDragStart={(event) => {event.preventDefault()}}>
            </img>
            <div className="banana-clicker-text-container">
                <p className="banana-clicker-text">Máximo</p>
                <p className="banana-clicker-text banana-clicker-text-number">{maxCPS} CPS</p>
            </div>
        </div>
    );
}