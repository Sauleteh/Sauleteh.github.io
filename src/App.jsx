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
import speedControl from "./assets/speedControl.png"
import calculadoraString from "./assets/calculadoraString.png"
import estadisticaSucesos from "./assets/estadisticaSucesos.png"
import paginaPokemon from "./assets/paginaPokemon.png"
import desEncriptador from "./assets/des-encriptador.png"

export function App() {
    return (
        <>
            <div className="divisorProyectos">
                <h1 className="titulo finalizado">Proyectos finalizados</h1>
                <div className="contenedorProyectos">
                    <Proyecto
                        titulo="Rocket League: Speed Control (Plugin)"
                        plataforma="Windows | C++"
                        descripcion="Un plugin creado con el SDK de BakkesMod para el juego Rocket League que permite ajustar
                                    de forma cómoda ajustes varios para transformar la experiencia por defecto del juego en
                                    un juego de carreras para disfrutar de aquellos mapas personalizados hechos con este fin."
                        thumbnail={speedControl}
                        link="https://github.com/Sauleteh/speed-control"
                    >nuevo</Proyecto>

                    <Proyecto
                        titulo="Visualizador de horarios de UniOvi"
                        plataforma="Windows | Java"
                        descripcion="Un programa creado con la finalidad de observar los horarios de UniOvi en un formato
                                    más visual, pudiendo elegir las asignaturas, las PLs y las TGs. Solo habría que dar
                                    como input los PDFs con los horarios."
                        thumbnail={visualizadorHorariosUniOvi}
                        link="https://github.com/Sauleteh/visualizador-de-conflictos-horarios-uniovi"
                    ></Proyecto>

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
                    ></Proyecto>

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
                        titulo="Calculadora matemática de cadenas de texto"
                        plataforma="Cualquier plataforma | Python"
                        descripcion="Cálculo de operaciones matemáticas con solo introducir una cadena de texto. El tamaño de la cadena
                                    es ilimitado y se pueden realizar operaciones con paréntesis, números con décimas y funciona con las
                                    cuatro operaciones elementales: suma, resta, multiplicación y división. Fue mi primer programa."
                        thumbnail={calculadoraString}
                        link="https://github.com/Sauleteh/calculadora-matematica-string"
                    ></Proyecto>

                    <Proyecto
                        titulo="Estadística: Calculadora de sucesos"
                        plataforma="Cualquier plataforma | Python"
                        descripcion="Un conjunto de programas relativos al cálculo de probabilidades de sucesos, muy útiles para saber
                                    porcentajes de obtención de objetos/personajes en juegos gacha. Uno de los programas cuenta con un
                                    pequeño simulador automático que te presenta los resultados que se obtuvieron en la ejecución."
                        thumbnail={estadisticaSucesos}
                        link="https://github.com/Sauleteh/calculos-estadisticos"
                    ></Proyecto>

                    <Proyecto
                        titulo="Minecraft: Pack de programas LUA para OpenComputers"
                        plataforma="Windows | Lua"
                        descripcion="Un conjunto de programas creados para ser usados en los distintos dispositivos informáticos del mod
                                    OpenComputers para el juego Minecraft. En concreto, tengo bastantes programas de todo tipo para drones,
                                    para el PC, para el robot y para los servidores. No todos los programas están creados de cero por mí,
                                    algunos son modificaciones de otros programas que encontré en Internet y los mejoré. Los programas
                                    más destacados a mi parecer son el tres en raya con IA o para dos jugadores y el minado automático con robots."
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
                        descripcion="El segundo trabajo de temática libre hecho para la asignatura CPM. Trataba de hacer una página web en la
                                    que se incluyeran toda variedad de etiquetas, reglas CSS, funciones JS y aplicar internacionalización
                                    siguiendo un guión de requisitos obligatorio. En mi caso, elegí hacer una página web sobre Pokémon y aunque
                                    no sea una obra de arte debido a los limitantes que hubo en los requisitos, considero que quedó bastante bien."
                        thumbnail={paginaPokemon}
                        link="Este proyecto contiene varias imágenes y videos de la franquicia de Pokémon por lo que me es imposible subirlo al GitHub
                            sin infringir derechos de autor. Si algún día me aburro y me da por rehacer las imágenes a mano, lo subiré (menos los videos)."
                        linkToPopup
                    ></Proyecto>

                    <Proyecto
                        titulo="Encriptador y desencriptador de archivos .keyx"
                        plataforma="Windows | C"
                        descripcion="Un programa dos en uno que encripta archivos .keyx (llaves para abrir bases de datos de KeePass) y
                                    desencripta archivos .bins (extensión específica de este programa) mediante técnicas hashing (que no
                                    especificaré) y dos algoritmos de cifrado privados y de clave única: uno trabaja a nivel de bits a
                                    cinco niveles de profundidad y el otro a nivel de bytes junto con el hashing. Un archivo .keyx contiene
                                    240 bytes y el programa tarda aproximadamente 15 minutos en tratar estos bytes (tanto para encriptar como
                                    para desencriptar), es mucho tiempo pero también es mucha seguridad."
                        thumbnail={desEncriptador}
                        link="No está subido en GitHub por el hecho de que el programa es de clave única con algoritmos privados y hacerlo
                            open source haría el programa inseguro. Si por alguna razón algún día me piden este programa, lo subiré a GitHub
                            pero sin su código fuente. Hacerle ingeniería inversa a este programa no me preocupa pues es demasiado difícil
                            sabiendo cómo está hecho por dentro el código y dudo de que alguien se moleste en hacer eso a un programa que solo
                            uso yo y que probablemente lo usen unas pocas personas más en el futuro."
                        linkToPopup
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
                    >pausado</Proyecto>
                </div>
            </div>
            <br/>
        </>
    )
}