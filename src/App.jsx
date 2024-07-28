import { useEffect } from "react"
import { Project } from "./components/Project.jsx"
import { NavigationBar } from "./components/NavigationBar.jsx"
import projectData from "./projects.json"
import minecraftBotMod from "/assets/minecraftBotMod.webp"
import "./css/App.css"

export function App() {
    return (
        <>
        <div className="app-section">
            <h1 className="app-title app-completed">Proyectos finalizados</h1>
            <div className="app-container">
                {projectData.map((project, index) => (
                    <Project
                        key={index}
                        title={project.title}
                        platform={project.platform}
                        description={project.description}
                        thumbnail={project.thumbnail}
                        link={project.link}
                        linkToPopup={project.linkToPopup}
                    >{project.tag}</Project>
                ))}
            </div>
        </div>
        <br/>
        <hr className="app-line"/>
        <div className="app-section">
            <h1 className="app-title app-wip">Proyectos en desarrollo / pausados</h1>
            <div className="app-container">
                <Project
                    title="Juego de flecha que va muy rápido"
                    platform="Windows | C#"
                    description="Hecho en Unity. Mueves a una flecha lateralmente mientras avanza automáticamente
                                por un plano 3D teniendo que esquivar obstáculos."
                >paused</Project>

                <Project
                    title="Minecraft Bot Mod"
                    platform="Windows | Java"
                    description="Un mod creado para el juego Minecraft que permite automatizar acciones relativas
                                al movimiento del personaje y movimiento y presionado del ratón. Mod hecho totalmente
                                client-side por lo que es usable hasta en servidores vanilla."
                    thumbnail={minecraftBotMod}
                    link="https://github.com/Sauleteh/Minecraft-Bot-Mod"
                ></Project>
            </div>
        </div>
        <br/>
        </>
    )
}