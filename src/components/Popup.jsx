import PropTypes from "prop-types"
import { useImperativeHandle, useState, forwardRef } from "react";
import "../css/Popup.css";

export const Popup = forwardRef((props, childRef) => {
    const [clase, setClase] = useState("popup-hide");
    const [estilo, setEstilo] = useState({display: "none"});
    
    useImperativeHandle(childRef, () => ({
        nuevaClase(newClass) {
            setClase(newClass);
        },

        nuevoEstilo(newStyle) {
            setEstilo(newStyle);
        }
    }));

    const handleClick = () => {
        setClase("popup-hide");
        setTimeout(() => { // display no tiene transición en CSS así que le insertamos un timeout
            setEstilo({display: "none"});
        }, 500);
    }

    return (
        <div className={clase} style={estilo}>
            <div className="popup-upper-div">
                <label className="popup-label">No existe enlace al proyecto</label>
                <button className="popup-button" onClick={handleClick}></button>
            </div>
            <hr className="popup-line"/>
            <p className="popup-text">{props.message}</p>
        </div>
    )
});

Popup.displayName = "Popup";

Popup.propTypes = {
    message: PropTypes.string,
    childRef: PropTypes.object
}