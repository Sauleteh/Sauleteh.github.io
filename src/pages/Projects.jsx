import "../css/Projects.css"
import { useState } from "react"
import { Project } from "../components/Project.jsx"
import { SearchBar } from "../components/SearchBar.jsx"
import { FilterBar } from "../components/FilterBar.jsx"
import projectData from "../projects.json"
import minecraftBotMod from "/project-images/minecraftBotMod.webp"

export function Projects() {
    let searchedProjects = [...projectData];
    const [filteredProjects, setFilteredProjects] = useState(projectData);
    let lastFilter = "all";

    // La búsqueda se hace sobre todos los proyectos y el filtro se hace sobre los proyectos obtenidos de la búsqueda (es decir, primero se busca y luego se filtra sobre la búsqueda)
    function handleSearchBarChange(text) {
        console.log(text);
        if (text.length !== 0) searchedProjects = projectData.filter(project => project.title.toLowerCase().includes(text.toLowerCase()) || project.description.toLowerCase().includes(text.toLowerCase()));
        else {
            // Si no hay texto en la barra de búsqueda, se resetea la lista de proyectos buscados para mostrarlos todos
            searchedProjects = [];
            searchedProjects = [...projectData];
        }
        handleFilterBarChange(lastFilter); // Se vuelve a aplicar el filtro para que se aplique la nueva búsqueda
    }

    function handleFilterBarChange(filter) {
        console.log(filter)
        lastFilter = filter;
        if (filter === "all") setFilteredProjects(searchedProjects);
        else setFilteredProjects(searchedProjects.filter(project => project.theme === filter));
    }

    return (
        <>
        <SearchBar sendData={handleSearchBarChange}/>
        <FilterBar sendData={handleFilterBarChange}/>
        <div className="projects-section">
            <h1 className="projects-title projects-completed">Proyectos finalizados</h1>
            <div className="projects-container">
                {filteredProjects.map((project, index) => (
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