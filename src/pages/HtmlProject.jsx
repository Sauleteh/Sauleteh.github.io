import "../css/pages/HtmlProject.css"
import PropTypes from "prop-types"
import { useEffect } from "react"

export function HtmlProject({ url }) {
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'invokeHandleHeight') {
                handleHeight(event, "html");
            }
        };
    
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    function handleLoad(event) {
        handleLightTheme(event);
        handleHeight(event, "react");

        addEventListener("resize", function() {
            handleHeight(event, "react");
        });
    }

    function handleLightTheme(event) {
        // Control del modo claro/oscuro para el HTML del iframe
        const element = event.target.contentDocument.querySelector("html");
        if (localStorage.getItem("page_light_theme") === "true") element.setAttribute("data-theme", "light");
        else element.removeAttribute("data-theme");
    }

    /**
     * Modifica la altura del body para que se ajuste al contenido del iframe
     * @param {*} event Evento de carga o mensaje recibido
     * @param {string} source Origen del evento ("react" si es desde React, "html" si es desde el iframe)
     */
    function handleHeight(event, source) {
        let target = source === "react" ? event.target : event.source.frameElement;

        const newHeight = target.contentDocument.documentElement.offsetHeight;
        const actualHeight = parseInt(window.getComputedStyle(target).height);

        if (actualHeight < newHeight) {
            target.style.flex = 'inherit';
            target.style.height = `${newHeight}px`;
        }
    }

    return (
        <iframe className="htmlproject-iframe" src={url} onLoad={handleLoad}/>
    )
}

HtmlProject.propTypes = {
    url: PropTypes.string.isRequired
}