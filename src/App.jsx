import { Proyecto } from "./Proyecto.jsx"
import visualizadorHorariosUniOvi from "./assets/visualizadorHorariosUniOvi.png"
import pruebaPunteria from "./assets/pruebaPunteria.png"
import redesSubnetting from "./assets/redesSubnetting.png"
import ajedrez from "./assets/ajedrez.png"
import genshinArtifactSimulador from "./assets/genshinArtifactSimulador.png"
import rocketLeagueDetectorInventario from "./assets/rocketLeagueDetectorInventario.png"
import colorTiles from "./assets/colorTiles.png"
import combatePorTurnos from "./assets/combatePorTurnos.png"
import genshinAutoSkipper from "./assets/genshinAutoSkipper.png"
import valorantAutoMusica from "./assets/valorantAutoMusica.png"
import renombradorEpisodios from "./assets/renombradorEpisodios.png"

export function App() {
    return (
        <>
            <div className="divisorProyectos">
                <h1 className="titulo finalizado">Proyectos finalizados</h1>
                <div className="contenedorProyectos">
                    <Proyecto
                        titulo="Visualizador de horarios de UniOvi"
                        plataforma="Windows | Java"
                        descripcion="Un programa creado con la finalidad de observar los horarios de UniOvi en un formato
                                    más visual, pudiendo elegir las asignaturas, las PLs y las TGs. Solo habría que dar
                                    como input los PDFs con los horarios."
                        thumbnail={visualizadorHorariosUniOvi}
                        link="https://github.com/Sauleteh/visualizador-de-conflictos-horarios-uniovi"
                    >nuevo</Proyecto>

                    <Proyecto
                        titulo="Test: Juego de puntería"
                        plataforma="Web | HTML, CSS y JS"
                        descripcion="Un pequeño proyecto para practicar JavaScript. Se trata de una página donde
                                    un cubo de tamaño variable irá moviéndose de forma senoidal a una velocidad
                                    creciente a medida que subas de nivel manteniendo el ratón encima de él."
                        thumbnail={pruebaPunteria}
                        link="./punteria/punteria.html"
                    ></Proyecto>

                    <Proyecto
                        titulo="Calculadora de subnetting"
                        plataforma="Web | HTML, CSS y JS"
                        descripcion="Una página creada para crear de forma sencilla subredes dando como entradas
                                    la IP inicial y su máscara, además de los hosts que se quiere para cada subred."
                        thumbnail={redesSubnetting}
                        link="./redes/redes.html"
                    ></Proyecto>

                    <Proyecto
                        titulo="Ajedrez"
                        plataforma="Web | HTML, CSS y JS"
                        descripcion="El juego clásico del ajedrez hecho en HTML, CSS y JS. Para mover las piezas hay
                                    que hacer click en una y luego en la casilla a la que se quiera mover. Modos de
                                    juego: Multijugador local, jugador contra máquina o máquina contra máquina."
                        thumbnail={ajedrez}
                        link="./ajedrez/ajedrez.html"
                    >progreso</Proyecto>

                    <Proyecto
                        titulo="Genshin Impact: Simulador de artefactos"
                        plataforma="Windows | C++"
                        descripcion="Un simulador de obtención de artefactos que calcula de la forma más parecida posible
                                    a la del juego Genshin Impact."
                        thumbnail={genshinArtifactSimulador}
                        link="https://github.com/Sauleteh/genshin-impact-simulador-artefactos"
                    ></Proyecto>

                    <Proyecto
                        titulo="Rocket League: Visualizador de inventario con detector de repetidos"
                        plataforma="Windows | Java"
                        descripcion="Un programa que te permite visualizar tu inventario de objetos del Rocket League con
                                    la función principal de detectar los objetos que tienes repetidos para venderlos."
                        thumbnail={rocketLeagueDetectorInventario}
                        link="https://github.com/Sauleteh/rocket-league-visualizador-inventario-y-repetidos"
                    >progreso</Proyecto>

                    <Proyecto
                        titulo="Color Tiles"
                        plataforma="Windows, Linux y macOS | Java"
                        descripcion="Un juego creado a partir de unas instrucciones proporcionadas por mi profesor de Introducción
                                    a la Programación (1er año) para el trabajo grupal."
                        thumbnail={colorTiles}
                        link="https://github.com/Sauleteh/color-tiles"
                    ></Proyecto>

                    <Proyecto
                        titulo="Juego de combate por turnos"
                        plataforma="Windows, Linux y macOS | Java"
                        descripcion="Un proyecto de temática libre hecho para la asignatura Comunicación Persona Máquina
                                    (2o año) como primer trabajo entregable. La temática que elegí se basó en la creación
                                    de un juego por turnos."
                        thumbnail={combatePorTurnos}
                        link="https://github.com/Sauleteh/trabajo-cpm-combate"
                    ></Proyecto>

                    <Proyecto
                        titulo="Genshin Impact: Saltador de texto automático"
                        plataforma="Windows (CMD) | Python"
                        descripcion="Un programa que permite saltar el texto (y las elecciones) de forma automática lo más
                                    rápido posible para el juego Genshin Impact."
                        thumbnail={genshinAutoSkipper}
                        link="https://github.com/Sauleteh/genshin-impact-saltador-texto"
                    ></Proyecto>

                    <Proyecto
                        titulo="Valorant: Controlador de música automático"
                        plataforma="Windows (CMD) | Python"
                        descripcion="Un programa que automáticamente controla el volumen y reproducción de los videos de
                                    YouTube dependiendo de lo que ocurra dentro del juego Valorant."
                        thumbnail={valorantAutoMusica}
                        link="https://github.com/Sauleteh/valorant-auto-musica"
                    >progreso</Proyecto>

                    <Proyecto
                        titulo="Obtención automática de nombres de episodios para su renombrado"
                        plataforma="Cualquier plataforma (CMD) | Python"
                        descripcion="Un programa que obtiene los títulos de los episodios de una serie para renombrar los archivos
                                    de video dando como input cualquier página web que contenga los nombres de los episodios."
                        thumbnail={renombradorEpisodios}
                        link="https://github.com/Sauleteh/obtenedor-nombres-episodios-para-renombrado"
                    >pendiente</Proyecto>

                    <Proyecto
                        titulo="Calculadora que funciona con cadenas de texto"
                        plataforma="Cualquier plataforma | Python"
                    ></Proyecto>

                    <Proyecto
                        titulo="Estadística: Calculadora de sucesos"
                        plataforma="Cualquier plataforma | Python"
                        descripcion="Pruebas.py y suerte.py. Próximamente..."
                    ></Proyecto>

                    <Proyecto
                        titulo="Minecraft: Pack de programas LUA para OpenComputers"
                        plataforma="Windows | Lua"
                    >intermitente</Proyecto>

                    <Proyecto
                        titulo="Adivina el Pokémon"
                        plataforma="Linux | Bash"
                    ></Proyecto>

                    <Proyecto
                        titulo="Pack de CSS para páginas web"
                        plataforma="Web | CSS"
                        descripcion="Lo del plugin. Próximamente..."
                    >intermitente</Proyecto>

                    <Proyecto
                        titulo="IA para Pokémon Showdown"
                        plataforma="Web | JavaScript"
                    ></Proyecto>

                    <Proyecto
                        titulo="Wallpaper Engine: Mis fondos animados"
                        plataforma="Windows | HTML, CSS y JS"
                    >intermitente</Proyecto>

                    <Proyecto
                        titulo="Sudoku dibujando a mano"
                        plataforma="Windows | C#"
                    ></Proyecto>

                    <Proyecto
                        titulo="Bingo con detección de voz"
                        plataforma="Android | Kotlin"
                    ></Proyecto>

                    <Proyecto
                        titulo="Página web Pokémon"
                        plataforma="Web | HTML, CSS y JS"
                        descripcion="Trabajo HTML, CSS y JS hecho en la asignatura CPM. Próximamente..."
                    ></Proyecto>

                    <Proyecto
                        titulo="Encriptador y desencriptador de archivos .keyx"
                        plataforma="Windows | C"
                    ></Proyecto>
                </div>
            </div>
            <br/>
            <hr/>
            <div className="divisorProyectos">
                <h1 className="titulo wip">Proyectos en desarrollo</h1>
                <div className="contenedorProyectos">
                    <Proyecto
                        titulo="Juego de flecha que va muy rápido"
                        plataforma="Windows | C#"
                        descripcion="Hecho en Unity. Mueves a una flecha lateralmente mientras avanza automáticamente
                                    por un plano 3D teniendo que esquivar obstáculos."
                    ></Proyecto>

                    <Proyecto
                        titulo="Rocket League: Plugin para carreras"
                        plataforma="Windows | C++"
                        descripcion="Un plugin creado con el SDK de BakkesMod para el juego Rocket League que permite ajustar
                                    de forma cómoda ajustes varios para transformar la experiencia por defecto del juego en
                                    un juego de carreras para aquellos mapas personalizados hechos con este fin."
                    ></Proyecto>
                </div>
            </div>
            <br/>
        </>
    )
}