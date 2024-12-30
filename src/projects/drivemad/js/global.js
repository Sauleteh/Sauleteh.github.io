// Carga un nuevo script en el DOM
window.loadScript = function(src, id) {
    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    script.src = src;
    script.onload = () => {
        console.log(`${src} cargado con éxito`)
        // Simula el evento DOMContentLoaded para cargar el script
        window.document.dispatchEvent(new Event("DOMContentLoaded", {
            bubbles: true,
            cancelable: true
        }));
    };
    script.onerror = () => console.error(`Error al cargar ${src}`);
    document.head.appendChild(script);
}

// Elimina un script del DOM
window.removeScript = function(id) {
    const script = document.getElementById(id);
    if (script) {
        script.remove(); // Elimina el elemento del DOM
        console.log(`Script con ID "${id}" eliminado`);
    }
    else console.log(`No se encontró un script con ID "${id}"`);
}