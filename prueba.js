let id = null;
function myMove() {
    //let id = null;
    if (id !== null)
    {
        // Si la partida ya está comenzada, bloquear la ejecución posterior
        return;
    }

    let isMouseHover = false;
    const elem = document.getElementById("cuadrao");
    elem.addEventListener("mouseleave", function() {
        isMouseHover = false;
    }, false);
    elem.addEventListener("mouseover", function() {
        isMouseHover = true;
    }, false);
    let posXi = window.getComputedStyle(elem).getPropertyValue('left');
    posXi = parseInt(posXi.substring(0, posXi.length - 2));
    let posX = posXi;
    let posYi = window.getComputedStyle(elem).getPropertyValue('top');
    posYi = parseInt(posYi.substring(0, posYi.length - 2));
    let posY = posYi;

    // 0 = Derecha, 1 = Izquierda
    let direccion = 0;
    let framesAcertados = 0;
    let framesFallados = 0;
    let empezar = 0;
    let velocidad = 0.4;
    let nivel = 1;

    const pPrec = document.getElementById("precision");
    const pAcertados = document.getElementById("fAcertados");
    const pFallados = document.getElementById("fFallados");
    const pNivel = document.getElementById("nivel");

    console.log(posX, posY);
    clearInterval(id);
    id = setInterval(frame, 1);

    function frame() {
        // Actualización de posición
        elem.style.top = posY + 'px';
        elem.style.left = posX + 'px';

        // Actualización de dirección
        if (posX >= 1000) direccion = 1;
        else if (posX < posXi) direccion = 0;

        // Actualización de velocidad de posición
        if (direccion === 0) posX += velocidad;
        else posX -= velocidad;
        posY = 60 * Math.sin(0.02 * posX) + posYi;

        // Actualización de empezar el entrenamiento
        if (empezar === 0 && isMouseHover) empezar = 1;

        // Actualización de precisión
        if (empezar === 1)
        {
            if (isMouseHover) framesAcertados++;
            else framesFallados++;
        }

        // Actualización de texto
        pPrec.innerHTML = "Precisi&oacute;n: " + (framesAcertados / (framesAcertados + framesFallados) * 100).toFixed(2) + "%";
        pAcertados.innerHTML = "Frames acertados: " + framesAcertados;
        pFallados.innerHTML = "Frames fallados: " + framesFallados;

        // Actualización de dificultad
        if ((framesAcertados + framesFallados) % 1000 === 0 && (framesAcertados / (framesAcertados + framesFallados) * 100) >= 80)
        {
            // Si en 1000 frames se ha logrado una precisión de mínimo 80%, aumentar la dificultad
            velocidad *= 1.3;
            framesAcertados = 0;
            framesFallados = 0;
            nivel++;
            pNivel.innerHTML = "Nivel: " + nivel;
        }
        else if ((framesAcertados + framesFallados) % 1000 === 0 && (framesAcertados / (framesAcertados + framesFallados) * 100) < 80 && nivel > 1)
        {
            // Si en 1000 frames NO se ha logrado una precisión de mínimo 80%, reducir la dificultad
            velocidad /= 1.3;
            framesAcertados = 0;
            framesFallados = 0;
            nivel--;
            pNivel.innerHTML = "Nivel: " + nivel;
        }
        else if ((framesAcertados + framesFallados) % 1000 === 0 && (framesAcertados / (framesAcertados + framesFallados) * 100) < 80 && nivel <= 1)
        {
            // Si en 1000 frames NO se ha logrado una precisión de mínimo 80% en el nivel 1, eres un paquete
            elem.style.top = posYi + 'px';
            elem.style.left = posXi + 'px';
            clearInterval(id);
            id = null;
        }
    }
}

function changeTam(newTam)
{
    var r = document.querySelector(':root');
    r.style.setProperty("--dimCuadrado", newTam + "px");
}