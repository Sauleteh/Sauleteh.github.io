import PropTypes from 'prop-types';

export function Proyecto({thumbnail = "src/assets/placeholder.png", titulo = "Sin título", plataforma = "N/A", descripcion = "Sin descripción", link = "404.html", children = ""}) {
    const handleClick = () => { window.location.href = link }

    return (
        <div className={`proyecto ${children}`} onClick={handleClick}>
            <img src={thumbnail} width="300px"/>
            <div className="texto">
                <p className="titulo">{titulo}</p>
                <p className="plataforma">{plataforma}</p>
                <p className="descripcion">{descripcion}</p>
            </div>
        </div>
    )
}

Proyecto.propTypes = {
    thumbnail: PropTypes.string,
    titulo: PropTypes.string,
    plataforma: PropTypes.string,
    descripcion: PropTypes.string,
    link: PropTypes.string,
    children: PropTypes.string
}