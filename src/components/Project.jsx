import "../css/components/Project.css";
import PropTypes from "prop-types"
import placeholder from "/project-images/placeholder.webp"
import { Popup } from "./Popup.jsx"
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Project({thumbnail = placeholder, title = "Sin título", platform = "N/A", description = "Sin descripción", link = "../404.html", linkToPopup = false, children = ""})
{
    const childRef = useRef();
    const navigate = useNavigate();
    
    const handleClick = (event) => {
        if (!linkToPopup) {
            if (link.startsWith("/")) navigate(link); // Si es una ruta interna, navegar a ella con el router
            else window.open(link, "_blank"); // En caso contrario, es una URL externa (abrir en pestaña nueva)
        }
        else if (event.target.className !== "popup-button") {
            childRef.current.nuevaClase("popup-show");
            childRef.current.nuevoEstilo({display: "block"});
        }
    }
    
    return (
        <div className={`project-div${children === "" ? "" : " " + children}`} onClick={handleClick}>
            <img src="/imagen.svg" className="project-show-thumbnail" alt=""/>
            <img src={thumbnail} className="project-thumbnail" alt={title}/>
            <div className="project-content">
                <p className="project-title">{title}</p>
                <p className="project-platform">{platform}</p>
                <p className="project-description">{description}</p>
            </div>
            {linkToPopup && <Popup message={link} ref={childRef}/>}
        </div>
    )
}

Project.propTypes = {
    thumbnail: PropTypes.string,
    title: PropTypes.string,
    platform: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    linkToPopup: PropTypes.bool,
    children: PropTypes.string
}