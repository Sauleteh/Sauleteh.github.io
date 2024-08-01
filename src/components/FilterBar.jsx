import "../css/components/FilterBar.css";

export function FilterBar({ sendData, projectData }) {
    const themes = [...new Set(projectData.map(project => project.theme))];
    const platforms = [...new Set(projectData.map(project => project.platform.split(" | ")[0]))]; // platform: <plataforma> | <lenguaje>

    function handleChange(event) {
        const filterType = event.target.selectedOptions[0].getAttribute("data-type");
        sendData(filterType, event.target.value);
    }

    return (
        <select className="filterbar-select" onChange={handleChange}>
            <option value="all" data-type="all">Sin filtrado</option>
            <optgroup label="Tema">
                {
                    themes.map((theme, index) => (
                        <option key={index} value={theme.toLowerCase()} data-type="theme">{theme}</option>
                    ))
                }
            </optgroup>
            <optgroup label="Plataforma">
                {
                    platforms.map((platform, index) => (
                        <option key={index} value={platform.toLowerCase()} data-type="platform">{platform}</option>
                    ))
                }
            </optgroup>
        </select>
    )
}