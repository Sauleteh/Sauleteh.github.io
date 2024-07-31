import "../css/Projects.css"
import { Project } from "../components/Project.jsx"
import { SearchBar } from "../components/SearchBar.jsx"
import { FilterBar } from "../components/FilterBar.jsx"
import projectData from "../projects.json"
import minecraftBotMod from "/project-images/minecraftBotMod.webp"

export function Projects() {
    // La búsqueda se hace sobre todos los proyectos y el filtro se hace sobre los proyectos obtenidos de la búsqueda (es decir, primero se busca y luego se filtra sobre la búsqueda)
    function handleSearchBarChange(data) {
        console.log(data)
    }

    function handleFilterBarChange(data) {
        console.log(data)
    }

    return (
        <>
        <SearchBar sendData={handleSearchBarChange}/>
        <FilterBar sendData={handleFilterBarChange}/>
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