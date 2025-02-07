export class SpriteManager {
    static names = ["spriteUI", "spriteVehicles"]; // Nombres de las hojas de sprites a cargar siempre
    static sprites = []; // Array de sprites cargados

    static init() {
        this.sprites = [];
        for (let i = 0; i < this.names.length; i++) {
            this.sprites.push(document.querySelector(`#${this.names[i]}`));
        }
    }

    /**
     * Obtiene el elemento del DOM asociado a un sprite por su nombre
     * @param {string} name Es el nombre del ID del sprite
     * @returns El elemento del DOM asociado al sprite
     */
    static getSpriteByName(name) {
        if (this.sprites.length !== this.names.length) {
            this.init();
        }

        const index = this.names.indexOf(name);
        return this.sprites[index];
    }
}