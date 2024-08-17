import "../css/components/NavigationBar.css"
import { Link } from "react-router-dom"

export function NavigationBar() {
    return (
        <div>
            <nav className="navbar-nav">
                <Link to="/aboutme" className="navbar-item">Sobre mí</Link>
                <Link to="projects" className="navbar-item">Proyectos</Link>
                <Link to="/shop" className="navbar-item">Tienda</Link>
            </nav>
            <hr className="navbar-line"/>
        </div>
    )
}