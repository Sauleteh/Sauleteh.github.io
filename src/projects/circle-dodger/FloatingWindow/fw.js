document.addEventListener("DOMContentLoaded", function() {
    // Make the DIV element draggable:
    dragElement(document.getElementById("controlsdiv"));
    dragElement(document.getElementById("optionsdiv"));
    dragElement(document.getElementById("scoreboarddiv"));
    dragElement(document.getElementById("timediv"));

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});

// Para cambiar la tabla de puntuaciones basado en la dificultad
let difficulty = 0;
let difficultyLabels = ["Principiante", "Intermedio", "Experto"];
// eslint-disable-next-line no-unused-vars
function changeDifficultyTab(element)
{
    difficulty = (difficulty + 1) % 3;
    element.innerHTML = difficultyLabels[difficulty];

    const divs = document.querySelectorAll("#scoreboarddiv .scoreboardOlDif");
    divs.forEach(div => { div.style.display = "none"; });

    const actualDiv = document.querySelector("#scoreboarddiv #scoreDif" + difficulty);
    actualDiv.style.display = "block";
}