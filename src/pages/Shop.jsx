import "../css/pages/Shop.css";
import { UpgradeItem } from "../components/UpgradeItem";

export function Shop() {
    const coins = [
        { image: "/coin-banana.gif", count: 15 },
        { image: "/coin-minesweeper.png", count: 15 },
        { image: "/coin-tetris.png", count: 15 }
    ];

    const upgrades = [
        { title: "Tema claro", description: "Quémate los ojos con este tema donde predomina el color blanco" },
        { title: "Tetris: Efecto especial tetris", description: "En mi juego del Tetris he añadido dos easter egg: uno relacionado con hacer un tetris (romper cuatro líneas con una pieza) y otro relacionado con la música. Compra este item para saber cómo activar los easter egg" },
        { title: "Buscaminas: Modo discoteca", description: "Si te pasas una dificultad con este modo especial y haces un buen tiempo, tu nombre aparecerá con color de fuego en el scoreboard. Ten en cuenta que este modo es más difícil que el buscaminas normal, compra este item para saber cómo activar este easter egg y sabrás a qué me refiero" }
    ];

    return (
        <div className="shop-body">
            <h1 className="shop-title">Tienda</h1>
            <h2 className="shop-subtitle">Compra mejoras para la página</h2>
            <div className="shop-coins-container">
                {coins.map((coin, index) => (
                    <div key={index} className="shop-coin-container">
                        <img className="shop-coin-image" src={coin.image}/>
                        <p className="shop-coin-count">{coin.count}</p>
                    </div>
                ))}
            </div>
            <button>¿Cómo obtener objetos?</button>
            <p>Mejoras disponibles:</p>
            <div className="shop-upgrades-container">
                {upgrades.map((upgrade, index) => (
                    <UpgradeItem key={index} title={upgrade.title} description={upgrade.description}/>
                ))}
            </div>
        </div>
    )
}