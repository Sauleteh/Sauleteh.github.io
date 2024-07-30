import "../css/Aboutme.css";
import { useEffect, useRef } from "react";

export function Aboutme() {
    const textAnimated = useRef(false);
    let currentSection = 0;

    function handleLink(link) {
        window.open(link, "_blank");
    }

    function animateText() {
        if (textAnimated.current) return;
        textAnimated.current = true;

        const textElement = document.querySelector(".aboutme-text");
        const text = textElement.innerHTML;
        const width = textElement.offsetWidth;
        const height = textElement.offsetHeight;
        textElement.innerHTML = "";

        textElement.style.width = `${width}px`;
        textElement.style.height = `${height}px`;
        let i = 0;
        const interval = setInterval(() => {
            textElement.innerHTML += text[i++];
            if (i >= text.length) {
                textElement.style.width = "auto";
                textElement.style.height = "auto";
                clearInterval(interval);
            }
        }, 20);
    }

    function delayAnimations() {
        const languageItems = document.querySelectorAll(".aboutme-language-item");
        for (let i = 0; i < languageItems.length; i++) {
            languageItems[i].style.animationDelay = `${i/4}s`;
        }

        const technologyItems = document.querySelectorAll(".aboutme-technology-item");
        for (let i = 0; i < technologyItems.length; i++) {
            technologyItems[i].style.animationDelay = `${i/4}s`;
        }
    }

    function handleCarousel(direction) {
        const sections = document.querySelectorAll(".aboutme-section");
        
        sections[currentSection].classList.remove("aboutme-section-active");
        currentSection = (currentSection + direction + sections.length) % sections.length;
        sections[currentSection].classList.add("aboutme-section-active");
    }

    useEffect(() => {
        animateText();
        delayAnimations();
    });

    return (
        <div className="aboutme-body">
            <h1 className="aboutme-title">¡Hola!</h1>
            <img className="aboutme-image" src="/banana-rotating.webp"/>

            <p className="aboutme-text">
                Mi nombre es Saúl y soy un friki que actualmente se encuentra cursando Ingeniería Informática en la Universidad de Oviedo.
                La función de esta página es mantener una lista actualizada con (casi) todos mis proyectos informáticos realizados hasta la fecha.
                Si te ha gustado algún proyecto o te ha resultado útil, recuerda que puedes dejar una estrella en el repositorio de GitHub correspondiente.
            </p>

            <div className="aboutme-button-container">
                <button className="aboutme-button aboutme-button-left" onClick={() => handleCarousel(-1)}><img className="aboutme-button-icon" src="/right-arrow.svg"/></button>
                <button className="aboutme-button aboutme-button-right" onClick={() => handleCarousel(1)}><img className="aboutme-button-icon" src="/right-arrow.svg"/></button>
            </div>

            <div className="aboutme-section-container">
                <div className="aboutme-section aboutme-section-active">
                    <h2 className="aboutme-title">Lenguajes que más uso</h2>
                    <ul className="aboutme-language-container">
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/javascript-logo.svg"/><label className="aboutme-language">JavaScript</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/typescript-logo.svg"/><label className="aboutme-language">TypeScript</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/java-logo.svg"/><label className="aboutme-language">Java</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/kotlin-logo.svg"/><label className="aboutme-language">Kotlin</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/c-logo.svg"/><label className="aboutme-language">C</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/cpp-logo.svg"/><label className="aboutme-language">C++</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/csharp-logo.svg"/><label className="aboutme-language">C#</label>
                        </li>
                        <li className="aboutme-language-item">
                            <img className="aboutme-language-icon" src="/logos/python-logo.svg"/><label className="aboutme-language">Python</label>
                        </li>
                    </ul>
                </div>

                <div className="aboutme-section">
                    <h2 className="aboutme-title">Tecnologías más usadas en mis distintos proyectos</h2>
                    <ul className="aboutme-technology-container">
                        <li className="aboutme-technology-item">
                            <img className="aboutme-technology-icon" src="/logos/react-logo.svg"/><label className="aboutme-technology">React</label>
                        </li>
                        <li className="aboutme-technology-item">
                            <img className="aboutme-technology-icon" src="/logos/nodejs-logo.svg"/><label className="aboutme-technology">Node.js</label>
                        </li>
                        <li className="aboutme-technology-item">
                            <img className="aboutme-technology-icon" src="/logos/express-logo.svg"/><label className="aboutme-technology">Express</label>
                        </li>
                        <li className="aboutme-technology-item">
                            <img className="aboutme-technology-icon" src="/logos/mysql-logo.svg"/><label className="aboutme-technology">MySQL</label>
                        </li>
                        <li className="aboutme-technology-item">
                            <img className="aboutme-technology-icon" src="/logos/websockets-logo.svg"/><label className="aboutme-technology">WebSockets</label>
                        </li>
                    </ul>
                </div>
            </div>

            <hr className="aboutme-line"/>

            <ul className="aboutme-link-container">
                <li className="aboutme-link-item" onClick={() => handleLink("https://github.com/Sauleteh")}>
                    <img className="aboutme-link-icon" src="/logos/github-mark-white.svg"/><label className="aboutme-link">Cuenta principal</label>
                </li>
                <li className="aboutme-link-item" onClick={() => handleLink("https://github.com/UO279176")}>
                    <img className="aboutme-link-icon" src="/logos/github-mark-white.svg"/><label className="aboutme-link">Cuenta universitaria</label>
                </li>
            </ul>
        </div>
    )
}