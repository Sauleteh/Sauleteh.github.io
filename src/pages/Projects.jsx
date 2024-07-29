import "../css/Projects.css"
import { Project } from "../components/Project.jsx"
import projectData from "../projects.json"
import minecraftBotMod from "/assets/minecraftBotMod.webp"

export function Projects() {
    return (
        <>
        <div className="projects-section">
            <h1 className="projects-title projects-completed">Proyectos finalizados</h1>
            <div className="projects-container">
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
        <hr className="projects-line"/>
        <div className="projects-section">
            <h1 className="projects-title projects-wip">Proyectos en desarrollo / pausados</h1>
            <div className="projects-container">
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