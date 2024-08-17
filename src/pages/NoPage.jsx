import "../css/pages/NoPage.css"

export function NoPage() {
    return (
        <div className="nopage-container">
            <img className="nopage-warning" src="/warning.svg"/>
            <p className="nopage-text">Si estás en esta página es porque intentaste acceder a un contenido no disponible.</p>
        </div>
    )
}