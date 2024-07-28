import { useEffect } from "react"
import { Proyecto } from "./Proyecto.jsx"
import projectData from "./projects.json"
import minecraftBotMod from "/assets/minecraftBotMod.webp"

export function App() {
    return (
        <>
        <div className="divisorProyectos">
            <h1 className="titulo finalizado">Proyectos finalizados</h1>
            <div className="contenedorProyectos">
                {projectData.map((project, index) => (
                    <Proyecto
                        key={index}
                        titulo={project.title}
                        plataforma={project.platform}
                        descripcion={project.description}
                        thumbnail={project.thumbnail}
                        link={project.link}
                        linkToPopup={project.linkToPopup}
                    >{project.tag}</Proyecto>
                ))}
            </div>
        </div>
        <br/>
        <hr/>
        <div className="divisorProyectos">
            <h1 className="titulo wip">Proyectos en desarrollo / pausados</h1>
            <div className="contenedorProyectos">
                <Proyecto
                    titulo="Juego de flecha que va muy rápido"
                    plataforma="Windows | C#"
                    descripcion="Hecho en Unity. Mueves a una flecha lateralmente mientras avanza automáticamente
                                por un plano 3D teniendo que esquivar obstáculos."
                >pausado</Proyecto>

                <Proyecto
                    titulo="Minecraft Bot Mod"
                    plataforma="Windows | Java"
                    descripcion="Un mod creado para el juego Minecraft que permite automatizar acciones relativas
                                al movimiento del personaje y movimiento y presionado del ratón. Mod hecho totalmente
                                client-side por lo que es usable hasta en servidores vanilla."
                    thumbnail={minecraftBotMod}
                    link="https://github.com/Sauleteh/Minecraft-Bot-Mod"
                ></Proyecto>
            </div>
        </div>
        <br/>
        </>
    )
}