import "../css/components/FooterBar.css"

export function FooterBar() {
    function handleLink(link) {
        window.open(link, "_blank");
    }
    
    return (
        <div className="footerbar-body">
            <hr className="footerbar-line"/>
            <ul className="footerbar-link-container">
                <li className="footerbar-link-item" onClick={() => handleLink("https://github.com/Sauleteh")}>
                    <img className="footerbar-link-icon" src="/logos/github-mark-white.svg" alt="Icono GitHub para cuenta principal"/><label className="footerbar-link">Cuenta principal</label>
                </li>
                <li className="footerbar-link-item" onClick={() => handleLink("https://github.com/UO279176")}>
                    <img className="footerbar-link-icon" src="/logos/github-mark-white.svg" alt="Icono GitHub para cuenta universitaria"/><label className="footerbar-link">Cuenta universitaria</label>
                </li>
            </ul>
        </div>
    )
}