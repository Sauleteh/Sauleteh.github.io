import "../css/components/Switch.css";
import PropTypes from "prop-types";

export function Switch({ text, func }) {
    return (
        <div className="switch-body">
            <label className="switch-container">
                <input className="switch-input" type="checkbox" onChange={func}/>
                <span className="switch-slider switch-round"></span>
            </label>
            <span className="switch-text">{text}</span>
        </div>
    )
}

Switch.propTypes = {
    text: PropTypes.string.isRequired,
    func: PropTypes.func.isRequired
}