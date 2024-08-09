import "../css/components/UpgradeItem.css";
import { useRef } from "react";

export function UpgradeItem({ title, description }) {
    const detailsContainerRef = useRef(null);

    function handleDetailsHeight(event) {
        detailsContainerRef.current.classList.toggle("upgrade-item-details-container-active");
        event.target.classList.toggle("upgrade-item-container-active");
    }

    return (
        <div className="upgrade-item-body">
            <div className="upgrade-item-container" onClick={handleDetailsHeight}>
                <p className="upgrade-item-title">{title}</p>
                <div className="upgrade-item-price-container">
                    <p className="upgrade-item-price-label">10</p>
                    <img className="upgrade-item-image" src="/coin-banana.gif"/>
                </div>
            </div>
            <div ref={detailsContainerRef} className="upgrade-item-details-container">
                <p className="upgrade-item-description">{description}</p>
                <button className="upgrade-item-buy-button">Comprar</button>
            </div>
        </div>
    )
}