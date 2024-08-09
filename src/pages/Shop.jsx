import "../css/pages/Shop.css";
import { UpgradeItem } from "../components/UpgradeItem";

export function Shop() {
    const coinsData = {
        banana: { image: "/coin-banana.gif", id: "coin_banana" },
        msFlag: { image: "/coin-minesweeper.png", id: "coin_ms_flag" },
        tetrisPiece: { image: "/coin-tetris.png", id: "coin_tetris_piece" }
    };

    // Si isSwitch es true, es obligatorio que func esté definido (func es la función que se ejecutará al cambiar el switch)
    const upgrades = [{
            title: "Tema claro",
            description: "Quémate los ojos con este tema donde predomina el color blanco",
            price: 1000,
            coin: coinsData.banana,
            textWhenBought: "Activar tema claro",
            isSwitch: true,
            id: "upgrade_light_theme",
            func: setLightTheme
        }, {
            title: "Tetris: Efecto especial tetris",
            description: "En mi juego del Tetris he añadido dos easter egg: uno relacionado con hacer un tetris (romper cuatro líneas con una pieza) y otro relacionado con la música. Compra este item para saber cómo activar los easter egg",
            price: 60,
            coin: coinsData.tetrisPiece,
            textWhenBought: "Realiza el código Konami en la página del Tetris y aparecerá una opción 'Opción experimental'. Actívala y los easter egg estarán activados",
            isSwitch: false,
            id: "upgrade_tetris_special"
        }, {
            title: "Buscaminas: Modo discoteca",
            description: "Si te pasas una dificultad con este modo especial y haces un buen tiempo, tu nombre aparecerá con color de fuego en el scoreboard. Ten en cuenta que este modo es más difícil que el buscaminas normal, compra este item para saber cómo activar este easter egg y sabrás a qué me refiero",
            price: 250,
            coin: coinsData.msFlag,
            textWhenBought: "Realiza el código Konami en la página del Buscaminas y aparecerá una opción '???'. Para activarla, primero mantén la tecla 'Control' izquierdo, luego mantén la tecla 'º' y haz click sobre la opción para activarla (No dejes de mantener ninguna de las teclas hasta que hagas click).",
            isSwitch: false,
            id: "upgrade_minesweeper_disco"
        }
    ];

    function setLightTheme() {
        console.log("holas");
    }

    return (
        <div className="shop-body">
            <h1 className="shop-title">Tienda</h1>
            <h2 className="shop-subtitle">Compra mejoras para la página</h2>
            <div className="shop-coins-container">
                {Object.values(coinsData).map((coin, index) => (
                    <div key={index} className="shop-coin-container">
                        <img className="shop-coin-image" src={coin.image}/>
                        <p className="shop-coin-count">{localStorage.getItem(coin.id) === null || localStorage.getItem(coin.id) === "" ? 0 : localStorage.getItem(coin.id)}</p>
                    </div>
                ))}
            </div>
            <button>¿Cómo obtener objetos?</button>
            <p>Mejoras disponibles:</p>
            <div className="shop-upgrades-container">
                {upgrades.map((upgrade, index) => (
                    <UpgradeItem key={index}
                        title={upgrade.title}
                        description={upgrade.description}
                        price={upgrade.price}
                        coin={upgrade.coin}
                        textWhenBought={upgrade.textWhenBought}
                        isSwitch={upgrade.isSwitch}
                        upgradeId={upgrade.id}
                        func={upgrade.func}
                    />
                ))}
            </div>
        </div>
    )
}