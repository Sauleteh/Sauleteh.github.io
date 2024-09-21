import "../css/pages/Aboutme.css";
import { BananaClicker } from "../components/BananaClicker";
import { useEffect, useRef, useState } from "react";

export function Aboutme() {
    const textAnimated = useRef(false);
    const [sectionDots, setSectionDots] = useState([]);
    let currentSection = 0;

    const knowledge = [
        {
            title: "Lenguajes que más uso",
            items: [
                { name: "JavaScript", icon: "/logos/javascript-logo.svg" },
                { name: "Java", icon: "/logos/java-logo.svg" },
                { name: "Kotlin", icon: "/logos/kotlin-logo.svg" },
                { name: "C", icon: "/logos/c-logo.svg" },
                { name: "C++", icon: "/logos/cpp-logo.svg" },
                { name: "C#", icon: "/logos/csharp-logo.svg" },
                { name: "Python", icon: "/logos/python-logo.svg" }
            ]
        },
        {
            title: "Tecnologías más usadas en mis distintos proyectos",
            items: [
                { name: "React", icon: "/logos/react-logo.svg" },
                { name: "Node.js", icon: "/logos/nodejs-logo.svg" },
                { name: "Express", icon: "/logos/express-logo.svg" },
                { name: "MySQL", icon: "/logos/mysql-logo.svg" },
                { name: "WebSockets", icon: "/logos/websockets-logo.svg" }
            ]
        },
        {
            title: "Lenguajes utilizados pero no tan frecuentemente",
            items: [
                { name: "TypeScript", icon: "/logos/typescript-logo.svg" },
                { name: "Rust", icon: "/logos/rust-logo.svg" },
                { name: "Lua", icon: "/logos/lua-logo.svg" },
                { name: "Bash", icon: "/logos/bash-logo.svg" }
            ]
        },
        {
            title: "Otras tecnologías con las que he experimentado",
            items: [
                { name: "Android Studio", icon: "/logos/androidstudio-logo.svg" },
                { name: "Packet Tracer", icon: "/logos/packettracer-logo.svg" },
                { name: "Git", icon: "/logos/git-logo.svg" },
                { name: "Docker", icon: "/logos/docker-logo.svg" },
                { name: "Unity", icon: "/logos/unity-logo.svg" },
                { name: "Redkanban", icon: "/logos/redkanban-logo.svg" },
                { name: "PostgreSQL", icon: "/logos/postgresql-logo.svg" }
            ]
        }
    ];

    function handleCarousel(direction) {
        const sections = document.querySelectorAll(".aboutme-section");
        const dots = document.querySelectorAll(".aboutme-section-dot");
        
        sections[currentSection].classList.remove("aboutme-section-active");
        dots[currentSection].classList.remove("aboutme-section-dot-active");
        currentSection = (currentSection + direction + sections.length) % sections.length;
        sections[currentSection].classList.add("aboutme-section-active");
        dots[currentSection].classList.add("aboutme-section-dot-active");
    }

    useEffect(() => {
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
            for (let i = 0; i < knowledge.length; i++) {
                const items = document.querySelectorAll(".aboutme-section")[i].querySelectorAll(".aboutme-item");
                for (let i = 0; i < items.length; i++) {
                    items[i].style.animationDelay = `${i/4}s`;
                }
            }
        }

        function createSectionDots() {
            const dots = [...document.querySelectorAll(".aboutme-section")].map((section, index) => (
                <span key={index} className={`aboutme-section-dot ${section.classList.contains("aboutme-section-active") ? "aboutme-section-dot-active" : ""}`} />
            ));
            setSectionDots(dots);
        }

        animateText();
        delayAnimations();
        createSectionDots();
    }, [knowledge.length]);

    return (
        <div className="aboutme-body">
            <h1 className="aboutme-title">¡Hola!</h1>
            <BananaClicker/>
            
            <p className="aboutme-text">
                Mi nombre es Saúl y soy un friki que actualmente se encuentra cursando Ingeniería Informática en la Universidad de Oviedo.
                La función de esta página es mantener una lista actualizada con (casi) todos mis proyectos informáticos realizados hasta la fecha.
                Si te ha gustado algún proyecto o te ha resultado útil, recuerda que puedes dejar una estrella en el repositorio de GitHub correspondiente.
            </p>

            <div className="aboutme-button-container">
                <button className="aboutme-button aboutme-button-left" onClick={() => handleCarousel(-1)}><img className="aboutme-button-icon" src="/right-arrow.svg"/></button>
                <button className="aboutme-button aboutme-button-right" onClick={() => handleCarousel(1)}><img className="aboutme-button-icon" src="/right-arrow.svg"/></button>
            </div>

            <div className="aboutme-section-dots">
                {sectionDots}
            </div>

            <div className="aboutme-section-container">
                {knowledge.map((section, index) => (
                    <div key={index} className={`aboutme-section${index === 0 ? " aboutme-section-active" : ""}`}>
                        <h2 className="aboutme-title">{section.title}</h2>
                        <ul className="aboutme-container">
                            {section.items.map((item, index) => (
                                <li key={index} className="aboutme-item">
                                    <img className="aboutme-icon" src={item.icon}/><label className="aboutme-item-label">{item.name}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}