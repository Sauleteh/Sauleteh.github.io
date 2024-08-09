import "../css/components/UpgradeItem.css";
import { useRef } from "react";
import PropTypes from "prop-types";
import { Switch } from "./Switch";

export function UpgradeItem({ title, description, price, coin, textWhenBought, isSwitch, upgradeId, func }) {
    const detailsContainerRef = useRef(null);
    
    function handleDetailsHeight(event) {
        detailsContainerRef.current.classList.toggle("upgrade-item-details-container-active");
        event.target.classList.toggle("upgrade-item-container-active");
    }

    // Las mejoras tienen dos estados: compradas (1) o no compradas (0)
    function isUpgradeBought() {
        const upgrade = localStorage.getItem(upgradeId);
        return upgrade !== null && upgrade !== "" && upgrade > 0;
    }

    function isUpgradeAffordable() {
        const coins = localStorage.getItem(coin.id);
        return coins !== null && coins !== "" && coins >= price;
    }

    function handleBuyButton() {
        if (isUpgradeBought() || !isUpgradeAffordable()) return;

        const coins = localStorage.getItem(coin.id);
        localStorage.setItem(coin.id, coins - price);
        localStorage.setItem(upgradeId, 1);
        window.location.reload();
    }

    return (
        <div className="upgrade-item-body">
            <div className={`upgrade-item-container ${isUpgradeBought() ? "upgrade-item-container-bought" : ""}`} onClick={handleDetailsHeight}>
                <p className="upgrade-item-title">{title}</p>
                <div className="upgrade-item-price-container">
                    <p className={`upgrade-item-price-label ${isUpgradeBought() ? "upgrade-item-price-label-bought" : ""}`}>{price}</p>
                    <img className="upgrade-item-image" src={coin.image}/>
                </div>
            </div>
            <div ref={detailsContainerRef} className={`upgrade-item-details-container ${isUpgradeBought() ? "upgrade-item-details-container-bought" : ""}`}>
                <p className="upgrade-item-description">{description}</p>
                <button className={`upgrade-item-buy-button ${isUpgradeBought() ? "upgrade-item-bought-button" : (isUpgradeAffordable() ? "upgrade-item-buy-button-affordable" : "upgrade-item-buy-button-unaffordable")}`} onClick={handleBuyButton}>{isUpgradeBought() ? "Comprado" : "Comprar"}</button>
                {isUpgradeBought() ? (isSwitch ? <Switch text={textWhenBought} func={func}/> : <span className="upgrade-item-bought-text">{textWhenBought}</span>) : null}
            </div>
        </div>
    )
}

UpgradeItem.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    coin: PropTypes.object.isRequired,
    textWhenBought: PropTypes.string.isRequired,
    isSwitch: PropTypes.bool.isRequired,
    upgradeId: PropTypes.string.isRequired,
    func: PropTypes.func
}