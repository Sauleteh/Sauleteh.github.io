import PropTypes from "prop-types"
import { useImperativeHandle, useState, forwardRef } from "react";

export const Popup = forwardRef((props, childRef) => {
    const [clase, setClase] = useState("popup-esconder");
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
        setClase("popup-esconder");
        setTimeout(() => { // display no tiene transición en CSS así que le insertamos un timeout
            setEstilo({display: "none"});
        }, 500);
    }

    return (
        <div className={clase} style={estilo}>
            <div className="popup-parte-superior">
                <label className="popup-label">No existe enlace al proyecto</label>
                <button className="popup-boton" onClick={handleClick}></button>
            </div>
            <hr className="popup-linea"/>
            <p className="popup-parrafo">{props.mensaje}</p>
        </div>
    )
});

Popup.displayName = "Popup";

Popup.propTypes = {
    mensaje: PropTypes.string,
    childRef: PropTypes.object
}