import "../css/pages/HtmlProject.css"
import PropTypes from "prop-types"

export function HtmlProject({ url }) {
    function handleLightTheme(event) {
        // Control del modo claro/oscuro para el HTML del iframe
        const element = event.target.contentDocument.querySelector("html");
        if (localStorage.getItem("page_light_theme") === "true") element.setAttribute("data-theme", "light");
        else element.removeAttribute("data-theme");
    }
    return (
        <iframe className="htmlproject-iframe" src={url} onLoad={handleLightTheme}/>
    )
}

HtmlProject.propTypes = {
    url: PropTypes.string.isRequired
}