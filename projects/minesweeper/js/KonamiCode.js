import * as Constants from "./Constants.js";

// Código hecho a partir de: https://gomakethings.com/how-to-create-a-konami-code-easter-egg-with-vanilla-js/
export class KonamiCode
{
    constructor() {
        this.code = [
            "ArrowUp",
            "ArrowUp",
            "ArrowDown",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ArrowLeft",
            "ArrowRight",
            "b",
            "a"
        ];
        this.index = 0;
        this.keyListener = this.keyHandler.bind(this);
    }

    addListener() { document.addEventListener("keydown", this.keyListener, false); }

    keyHandler(event) {
        
        // If the key isn't in the pattern, or isn't the current key in the pattern, reset
        if (this.code.indexOf(event.key) < 0 || event.key !== this.code[this.index]) {
            this.index = 0;
            return;
        }
    
        // Update how much of the pattern is complete
        this.index++;
    
        // If complete, enable feature and reset
        if (this.code.length === this.index) {
            this.index = 0;
            document.querySelector(".hide").classList.remove("hide");
            localStorage.setItem(Constants.STORAGE_KEYS.OPTION_KONAMICODE, "true");
            this.removeListener();
        }
    }

    removeListener() { document.removeEventListener("keydown", this.keyListener, false); }
}