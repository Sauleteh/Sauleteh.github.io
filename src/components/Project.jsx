import PropTypes from "prop-types"
import placeholder from "/project-images/placeholder.webp"
import { Popup } from "./Popup.jsx"
import { useRef } from "react";
import "../css/components/Project.css";

export function Project({thumbnail = placeholder, title = "Sin título", platform = "N/A", description = "Sin descripción", link = "../404.html", linkToPopup = false, children = ""})
{
    const childRef = useRef();
    
    const handleClick = (event) => {
        if (!linkToPopup) { window.location.href = link; }
        else if (event.target.className !== "popup-button") {
            childRef.current.nuevaClase("popup-show");
            childRef.current.nuevoEstilo({display: "block"});
        }
    }
    
    return (
        <div className={`project-div ${children}`} onClick={handleClick}>
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