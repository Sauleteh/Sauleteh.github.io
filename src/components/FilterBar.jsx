import "../css/components/FilterBar.css";

export function FilterBar({ sendData, projectData }) {
    const themes = [...new Set(projectData.map(project => project.theme))];
    const platforms = [...new Set(projectData.map(project => project.platform.split(" | ")[0]))]; // platform: <plataforma> | <lenguaje>

    function handleChange(event) {
        const filterType = event.target.selectedOptions[0].getAttribute("data-type");
        sendData(filterType, event.target.value);
    }

    return (
        <div className="filterbar-container">
            <select className="filterbar-select" onChange={handleChange}>
                <optgroup className="filterbar-optgroup" label="Filtrar por">
                    <option className="filterbar-option" value="all" data-type="all">Sin filtrado</option>
                </optgroup>
                <optgroup className="filterbar-optgroup" label="Tema">
                    {
                        themes.map((theme, index) => (
                            <option className="filterbar-option" key={index} value={theme.toLowerCase()} data-type="theme">{theme}</option>
                        ))
                    }
                </optgroup>
                <optgroup className="filterbar-optgroup" label="Plataforma">
                    {
                        platforms.map((platform, index) => (
                            <option className="filterbar-option" key={index} value={platform.toLowerCase()} data-type="platform">{platform}</option>
                        ))
                    }
                </optgroup>
            </select>
        </div>
    )
}