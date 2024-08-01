import "../css/components/NavigationBar.css"

export function NavigationBar() {
    return (
        <>
        <nav className="navbar-nav">
            <a href="/aboutme" className="navbar-item">Sobre mí</a>
            <a href="/projects" className="navbar-item">Proyectos</a>
            <a href="/shop" className="navbar-item">Tienda</a>
        </nav>
        <hr className="navbar-line"/>
        </>
    )
}