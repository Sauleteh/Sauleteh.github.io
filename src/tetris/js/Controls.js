/**
 * Cada control tiene:
 * - isPressed: un booleano que indica si la tecla está presionada o no.
 * - actionDone: un booleano que indica si la acción ya fue realizada, para impedir que se realice más de una vez si se mantiene presionada la tecla.
 * Debe actualizarse a true manualmente cuando se realice la acción. Se actualiza a false automáticamente cuando se suelta la tecla.
 * - check: una función que compara la tecla pasada por parámetro con la tecla que corresponde a cada control.
 */
export class Controls
{
    constructor() {
        this.lastKeyPressed = '';
        this.keys = {
            left: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "ArrowLeft" || key.toLowerCase() === "a"; }
            },

            right: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "ArrowRight" || key.toLowerCase() === "d"; }
            },

            rotateClockwise: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "ArrowUp" || key.toLowerCase() === "x"; }
            },

            rotateCounterClockwise: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key.toLowerCase() === "z"; }
            },

            dropSoft: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "ArrowDown" || key.toLowerCase() === "s"; }
            },
            
            dropHard: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === " "; }
            },

            hold: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key.toLowerCase() === "c"; }
            },

            pause: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "Escape"; }
            },

            deleteLetter: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key === "Backspace"; }
            },

            writeLetter: {
                isPressed: false,
                actionDone: false,
                check: (key) => { return key.length === 1 && key !== " "; }
            }
        };
    }

    /**
     * Comprueba y actualiza cada tecla dependiendo si está presionada o no.
     * @param {*} key es la tecla obtenida del parámetro event de los eventListeners.
     * @param {*} action es el tipo de acción que se está realizando: "down" si se presionó la tecla, "up" si se soltó.
     */
    checkControls(key, action) {
        for (let control in this.keys) {
            if (this.keys[control].check(key) && action === "down") {
                this.keys[control].isPressed = true;
            }
            else if (this.keys[control].check(key) && action === "up") {
                this.keys[control].isPressed = false;
                this.keys[control].actionDone = false;
            }
        }

        if (action === "down") this.lastKeyPressed = key;
        else if (action === "up") this.lastKeyPressed = '';
    }

    debugControls() {
        for (let control in this.keys) {
            console.log(control, this.keys[control].isPressed);
        }
    }
}