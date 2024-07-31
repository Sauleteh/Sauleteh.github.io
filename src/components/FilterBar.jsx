export function FilterBar({ sendData }) {
    function handleChange(event) {
        sendData(event.target.id)
    }

    return (
        <div className="filter-bar">
            <div className="filter-bar-item">
                <input type="checkbox" id="filter-completed" name="filter-completed" onChange={handleChange}/>
                <label htmlFor="filter-completed">Proyectos finalizados</label>
            </div>
            <div className="filter-bar-item">
                <input type="checkbox" id="filter-wip" name="filter-wip" onChange={handleChange}/>
                <label htmlFor="filter-wip">Proyectos en desarrollo / pausados</label>
            </div>
        </div>
    )
}