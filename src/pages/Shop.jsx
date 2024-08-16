import "../css/pages/Shop.css";
import { useEffect } from "react";
import { UpgradeItem } from "../components/UpgradeItem";

export function Shop() {
    const coinsData = {
        banana: {
            image: "/coin-banana.gif",
            id: "coin_banana",
            howToObtain: "¿Has encontrado algún plátano por la página?"
        },
        msFlag: {
            image: "/coin-minesweeper.png",
            id: "coin_ms_flag",
            howToObtain: "Cada vez que termines una partida del buscaminas (excepto modo personalizado), por cada bandera puesta correctamente obtendrás este objeto"
        },
        tetrisPiece: {
            image: "/coin-tetris.png",
            id: "coin_tetris_piece",
            howToObtain: "En el Tetris, cada vez que rompas una línea que tenga un cuadrado perteneciente a un palo (pieza cian) obtendrás este objeto tantas veces como cuadrados cian haya en la línea"
        }
    };

    // Si isSwitch es true, es obligatorio que func esté definido (func es la función que se ejecutará al cambiar el switch)
    const upgrades = [{
            title: "Tema claro",
            description: "Quémate los ojos con este tema donde predomina el color blanco. ¡Cuidado con el precio! Cuanto más tiempo pase, más caro será.",
            price: Math.floor((new Date().getTime() - new Date(2012, 2, 16).getTime()) / (1000 * 60 * 60 * 24)),
            coin: coinsData.banana,
            textWhenBought: "Activar tema claro",
            isSwitch: true,
            id: "upgrade_light_theme",
            func: setLightTheme
        }, {
            title: "Tetris: Efecto especial tetris",
            description: "En mi juego del Tetris he añadido dos easter egg: uno relacionado con hacer un tetris (romper cuatro líneas con una pieza) y otro relacionado con la música. Compra este item para saber cómo activar los easter egg.",
            price: 180,
            coin: coinsData.tetrisPiece,
            textWhenBought: "Realiza el código Konami en la página del Tetris y aparecerá una opción 'Opción experimental'. Actívala y los easter egg estarán activados.",
            isSwitch: false,
            id: "upgrade_tetris_special"
        }, {
            title: "Buscaminas: Modo discoteca",
            description: "Si te pasas una dificultad con este modo especial y haces un buen tiempo, tu nombre aparecerá con color de fuego en el scoreboard. Ten en cuenta que este modo es más difícil que el buscaminas normal, compra este item para saber cómo activar este easter egg y sabrás a qué me refiero.",
            price: 260,
            coin: coinsData.msFlag,
            textWhenBought: "Realiza el código Konami en la página del Buscaminas y aparecerá una opción '???'. Para activarla, primero mantén la tecla 'Control' izquierdo, luego mantén la tecla 'º' y haz click sobre la opción para activarla (No dejes de mantener ninguna de las teclas hasta que hagas click).",
            isSwitch: false,
            id: "upgrade_minesweeper_disco"
        }
    ];

    function setLightTheme(event) {
        localStorage.setItem("page_light_theme", event.target.checked);

        if (event.target.checked) document.documentElement.setAttribute("data-theme", "light");
        else document.documentElement.removeAttribute("data-theme");
    }

    function handleHelpClick(howToObtain) {
        const helpText = document.querySelector(".shop-coin-help-text");
        helpText.textContent = howToObtain;
    }

    useEffect(() => {
        if (localStorage.getItem("page_light_theme") === "true") document.querySelector(".upgrade-item-body[data-upgrade-id='upgrade_light_theme'] .switch-input").checked = true;
    });

    return (
        <div className="shop-body">
            <h1 className="shop-title">Tienda</h1>
            <h2 className="shop-subtitle">Compra mejoras para la página</h2>
            <div className="shop-coins-container">
                {Object.values(coinsData).map((coin, index) => (
                    <div key={index} className="shop-coin-container" onClick={() => handleHelpClick(coin.howToObtain)}>
                        <img className="shop-coin-image" src={coin.image}/>
                        <p className="shop-coin-count">{localStorage.getItem(coin.id) === null || localStorage.getItem(coin.id) === "" ? 0 : localStorage.getItem(coin.id)}</p>
                    </div>
                ))}
            </div>
            <div className="shop-coin-help-container">
                <img className="shop-coin-help-image" src="/question-mark.png"/>
                <p className="shop-coin-help-text">Selecciona un objeto para saber cómo obtenerlo</p>
            </div>
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