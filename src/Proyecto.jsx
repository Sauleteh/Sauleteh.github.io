import PropTypes from "prop-types"
import placeholder from "./assets/placeholder.png"
import { Popup } from "./Popup.jsx"
import { useRef } from "react";

export function Proyecto({thumbnail = placeholder, titulo = "Sin título", plataforma = "N/A", descripcion = "Sin descripción", link = "../404.html", linkToPopup = false, children = ""})
{
    const childRef = useRef();
    
    const handleClick = (event) => {
        if (!linkToPopup) { window.location.href = link; }
        else if (event.target.className !== "popup-boton") {
            childRef.current.nuevaClase("popup-mostrar");
            childRef.current.nuevoEstilo({display: "block"});
        }
    }
    
    return (
        <div className={`proyecto ${children}`} onClick={handleClick}>
            <img src={thumbnail}/>
            <div className="texto">
                <p className="titulo">{titulo}</p>
                <p className="plataforma">{plataforma}</p>
                <p className="descripcion">{descripcion}</p>
            </div>
            {linkToPopup && <Popup mensaje={link} ref={childRef}/>}
        </div>
    )
}

Proyecto.propTypes = {
    thumbnail: PropTypes.string,
    titulo: PropTypes.string,
    plataforma: PropTypes.string,
    descripcion: PropTypes.string,
    link: PropTypes.string,
    linkToPopup: PropTypes.bool,
    children: PropTypes.string
}