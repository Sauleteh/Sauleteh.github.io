import "../css/NoPage.css"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export function NoPage() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { if (location.pathname === "/") navigate("/projects"); }, [location.pathname, navigate]);

    return (
        <>
        {
            // Si no se especificó una página, ir a la de proyectos; si no, mostrar un mensaje de error
            location.pathname === "/" ? (<></>) :
            (
                <div className="nopage-container">
                    <img className="nopage-warning" src="/warning.svg"/>
                    <p className="nopage-text">Si estás en esta página es porque intentaste acceder a un contenido no disponible.</p>
                </div>
            )
        }
        </>
    )
}