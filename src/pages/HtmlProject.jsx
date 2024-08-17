import "../css/pages/HtmlProject.css"
import PropTypes from "prop-types"

export function HtmlProject({ url }) {
    return (
        <iframe className="htmlproject-iframe" src={url} />
    )
}

HtmlProject.propTypes = {
    url: PropTypes.string.isRequired
}