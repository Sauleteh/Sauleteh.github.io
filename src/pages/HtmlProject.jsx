import "../css/pages/HtmlProject.css"
import PropTypes from "prop-types"

export function HtmlProject({ url }) {
    function handleLoad(event) {
        handleLightTheme(event);
        handleHeight(event);

        addEventListener("resize", function() {
            handleHeight(event);
        });
    }

    function handleLightTheme(event) {
        // Control del modo claro/oscuro para el HTML del iframe
        const element = event.target.contentDocument.querySelector("html");
        if (localStorage.getItem("page_light_theme") === "true") element.setAttribute("data-theme", "light");
        else element.removeAttribute("data-theme");
    }

    function handleHeight(event) {
        const newHeight = event.target.contentDocument.documentElement.offsetHeight;
        const actualHeight = parseInt(window.getComputedStyle(event.target).height);

        if (actualHeight < newHeight) {
            event.target.style.flex = 'inherit';
            event.target.style.height = `${newHeight}px`;
        }
    }

    return (
        <iframe className="htmlproject-iframe" src={url} onLoad={handleLoad}/>
    )
}

HtmlProject.propTypes = {
    url: PropTypes.string.isRequired
}