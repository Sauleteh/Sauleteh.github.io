import "../css/components/NavigationBar.css"

export function NavigationBar() {
    return (
        <nav className="navBar">
            <a href="/aboutme" className="navItem">Sobre mí</a>
            <a href="/projects" className="navItem">Proyectos</a>
            <a href="/shop" className="navItem">Tienda</a>
        </nav>
    )
}