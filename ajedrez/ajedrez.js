/* TODO:
*   - Resaltar casillas válidas cuando se selecciona una pieza
*   - Registro de movimientos
*   - Mostrar qué color de pieza tiene el turno actual
*   - Detectar jaque mate
*   - Detectar empate
*   - Implementar una IA */

let posSeleccionada = "";
let piezaSeleccionada = "";
let turno = '1'; // 1: Blancas, 2: Negras
let tablero = [
    ["T2", "C2", "A2", "D2", "R2", "A2", "C2", "T2"],
    ["P2", "P2", "P2", "P2", "P2", "P2", "P2", "P2"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P1", "P1", "P1", "P1", "P1", "P1", "P1", "P1"],
    ["T1", "C1", "A1", "D1", "R1", "A1", "C1", "T1"]];
let partidaTerminada = 0; // 0: false, 1: true

/**
 * Función principal. Se encarga de procesar los clicks que se hacen en el tablero
 * @param pos es la posición de la casilla clickeada ("d4", "b7"...)
 * @param pieza es la pieza ubicada en la casilla clickeada ("T1", "C2"...)
 */
function procesarClick(pos, pieza)
{
    if (partidaTerminada === 1) return;
    console.log(pos, pieza);

    if (pieza.charAt(1) === turno) // Si se hizo click en la pieza del usuario del turno...
    {
        posSeleccionada = pos;
        piezaSeleccionada = pieza;
    }
    else if (validarMovimiento(posSeleccionada, pos, piezaSeleccionada)) // Si se intentó hacer un movimiento válido...
    {
        procesarMovimiento(posSeleccionada, pos, piezaSeleccionada);
        posSeleccionada = "";
        piezaSeleccionada = "";
    }
}

/**
 * Mueve una pieza ubicada en pos_inicial hasta la posición indicada por pos_final, se asume que el movimiento es correcto
 * @param pos_inicial es la posición donde está la pieza que se quiere mover
 * @param pos_final es la posición a donde se quiere mover la pieza
 * @param pieza es el tipo de pieza a mover
 */
function procesarMovimiento(pos_inicial, pos_final, pieza)
{
    let posIni = posToArray(pos_inicial);
    let posFin = posToArray(pos_final);

    document.getElementById(pos_inicial).dataset.pieza = "";
    tablero[posIni[0]][posIni[1]] = "";

    let piezaComida = document.getElementById(pos_final).dataset.pieza;

    document.getElementById(pos_final).dataset.pieza = pieza;
    tablero[posFin[0]][posFin[1]] = pieza;

    if (piezaComida.charAt(0) === 'R') // Si se comió al rey, se terminó la partida
    {
        console.log("Partida terminada, ganaron las piezas " + (piezaComida.charAt(1) === '1' ? "negras" : "blancas"));
        partidaTerminada = 1;
    }
    else
    {
        turno = (turno === '1') ? '2' : '1';
        if (turno === '1' && document.getElementById("iaBlanco").checked) pensarMovimientoIA();
        else if (turno === '2' && document.getElementById("iaNegro").checked) pensarMovimientoIA();
    }
}

/**
 * Función que registra las posiciones a las que puede moverse una pieza dependiendo de su posición actual y el tipo de pieza
 * @param pos_inicial es la posición donde se encuentra la pieza. Es un string que indica la casilla en el formato de ajedrez ("d4", "g1"...).
 * @param pieza es la pieza a analizar.
 * @return {*[]} la lista de movimientos válidos.
 */
function posicionesValidas(pos_inicial, pieza)
{
    let posIni = posToArray(pos_inicial);
    let posValidas = [];
    let seguirOrtogonal = [true, true, true, true]; // Arriba, derecha, abajo, izquierda
    let seguirDiagonal = [true, true, true, true]; // Superior-derecha, inferior-derecha, inferior-izquierda, superior-izquierda

    if (pieza.charAt(0) === 'P') // Validar movimiento del peón
    {
        /* El peón, dependiendo del color, solo puede moverse hacia arriba si es blanco o
        * hacia abajo si es negro. Se mueve de una unidad en una unidad excepto en su
        * primer movimiento donde puede moverse dos escaques. El peón puede hacer lo que se
        * denomina como "captura de peón al paso" pero de momento no lo implementaré. */
        if (pieza.charAt(1) === '1') // Si es un peón blanco...
        {
            if (posIni[0] - 1 >= 0 && tablero[posIni[0] - 1][posIni[1]] === "") posValidas.push([posIni[0] - 1, posIni[1]]); // Movimiento de un escaque
            if (posIni[0] - 1 >= 0 && tablero[posIni[0] - 1][posIni[1]] === "" && posIni[0] === 6 && tablero[posIni[0] - 2][posIni[1]] === "") posValidas.push([posIni[0] - 2, posIni[1]]); // Movimiento de dos escaques
            if (posIni[0] - 1 >= 0 && posIni[1] - 1 >= 0 && tablero[posIni[0] - 1][posIni[1] - 1].charAt(1) === '2') posValidas.push([posIni[0] - 1, posIni[1] - 1]); // Escaque de captura izquierda
            if (posIni[0] - 1 >= 0 && posIni[1] + 1 <= 7 && tablero[posIni[0] - 1][posIni[1] + 1].charAt(1) === '2') posValidas.push([posIni[0] - 1, posIni[1] + 1]); // Escaque de captura derecha
        }
        else // Si es un peón negro...
        {
            if (posIni[0] + 1 <= 7 && tablero[posIni[0] + 1][posIni[1]] === "") posValidas.push([posIni[0] + 1, posIni[1]]); // Movimiento de un escaque
            if (posIni[0] + 1 <= 7 && tablero[posIni[0] + 1][posIni[1]] === "" && posIni[0] === 1 && tablero[posIni[0] + 2][posIni[1]] === "") posValidas.push([posIni[0] + 2, posIni[1]]); // Movimiento de dos escaques
            if (posIni[0] + 1 <= 7 && posIni[1] - 1 >= 0 && tablero[posIni[0] + 1][posIni[1] - 1].charAt(1) === '1') posValidas.push([posIni[0] + 1, posIni[1] - 1]); // Escaque de captura izquierda
            if (posIni[0] + 1 <= 7 && posIni[1] + 1 <= 7 && tablero[posIni[0] + 1][posIni[1] + 1].charAt(1) === '1') posValidas.push([posIni[0] + 1, posIni[1] + 1]); // Escaque de captura derecha
        }
    }
    else if (pieza.charAt(0) === 'T') // Validar movimiento de la torre
    {
        /* La torre se mueve de forma ortogonal en las cuatro direcciones un número indeterminado de escaques. */
        for (let i = 1; i < 8; i++) // Como máximo puede recorrer 7 casillas, no 8, porque la pieza ya está ocupando una de las 8 casillas disponibles
        {
            if (posIni[0] - i >= 0 && tablero[posIni[0] - i][posIni[1]] === "" && seguirOrtogonal[0]) posValidas.push([posIni[0] - i, posIni[1]]);
            else if (posIni[0] - i >= 0 && tablero[posIni[0] - i][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[0]) { posValidas.push([posIni[0] - i, posIni[1]]); seguirOrtogonal[0] = false; }
            else seguirOrtogonal[0] = false; // Arriba

            if (posIni[1] + i <= 7 && tablero[posIni[0]][posIni[1] + i] === "" && seguirOrtogonal[1]) posValidas.push([posIni[0], posIni[1] + i]);
            else if (posIni[1] + i <= 7 && tablero[posIni[0]][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[1]) { posValidas.push([posIni[0], posIni[1] + i]); seguirOrtogonal[1] = false; }
            else seguirOrtogonal[1] = false; // Derecha

            if (posIni[0] + i <= 7 && tablero[posIni[0] + i][posIni[1]] === "" && seguirOrtogonal[2]) posValidas.push([posIni[0] + i, posIni[1]]);
            else if (posIni[0] + i <= 7 && tablero[posIni[0] + i][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[2]) { posValidas.push([posIni[0] + i, posIni[1]]); seguirOrtogonal[2] = false; }
            else seguirOrtogonal[2] = false; // Abajo

            if (posIni[1] - i >= 0 && tablero[posIni[0]][posIni[1] - i] === "" && seguirOrtogonal[3]) posValidas.push([posIni[0], posIni[1] - i]);
            else if (posIni[1] - i >= 0 && tablero[posIni[0]][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[3]) { posValidas.push([posIni[0], posIni[1] - i]); seguirOrtogonal[3] = false; }
            else seguirOrtogonal[3] = false; // Izquierda
        }
    }
    else if (pieza.charAt(0) === 'C') // Validar movimiento del caballo
    {
        /* El caballo se mueve en forma de L sin importar si hay piezas entre medio, es decir, puede "saltar". Tiene ocho
        * posibles escaques y la forma en L se calcula como dos posiciones ortogonales y luego una posición a ambos lados */
        if (posIni[0] - 2 >= 0 && posIni[1] - 1 >= 0 && (tablero[posIni[0] - 2][posIni[1] - 1] === "" || tablero[posIni[0] - 2][posIni[1] - 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 2, posIni[1] - 1]); // Arriba-izquierda
        if (posIni[0] - 2 >= 0 && posIni[1] + 1 <= 7 && (tablero[posIni[0] - 2][posIni[1] + 1] === "" || tablero[posIni[0] - 2][posIni[1] + 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 2, posIni[1] + 1]); // Arriba-derecha
        if (posIni[0] - 1 >= 0 && posIni[1] + 2 <= 7 && (tablero[posIni[0] - 1][posIni[1] + 2] === "" || tablero[posIni[0] - 1][posIni[1] + 2].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 1, posIni[1] + 2]); // Derecha-arriba
        if (posIni[0] + 1 <= 7 && posIni[1] + 2 <= 7 && (tablero[posIni[0] + 1][posIni[1] + 2] === "" || tablero[posIni[0] + 1][posIni[1] + 2].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 1, posIni[1] + 2]); // Derecha-abajo
        if (posIni[0] + 2 <= 7 && posIni[1] - 1 >= 0 && (tablero[posIni[0] + 2][posIni[1] - 1] === "" || tablero[posIni[0] + 2][posIni[1] - 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 2, posIni[1] - 1]); // Abajo-izquierda
        if (posIni[0] + 2 <= 7 && posIni[1] + 1 <= 7 && (tablero[posIni[0] + 2][posIni[1] + 1] === "" || tablero[posIni[0] + 2][posIni[1] + 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 2, posIni[1] + 1]); // Abajo-derecha
        if (posIni[0] - 1 >= 0 && posIni[1] - 2 >= 0 && (tablero[posIni[0] - 1][posIni[1] - 2] === "" || tablero[posIni[0] - 1][posIni[1] - 2].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 1, posIni[1] - 2]); // Izquierda-arriba
        if (posIni[0] + 1 <= 7 && posIni[1] - 2 >= 0 && (tablero[posIni[0] + 1][posIni[1] - 2] === "" || tablero[posIni[0] + 1][posIni[1] - 2].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 1, posIni[1] - 2]); // Izquierda-abajo
    }
    else if (pieza.charAt(0) === 'A') // Validar movimiento del alfil
    {
        /* El alfil se mueve de forma diagonal en las cuatro direcciones un número indeterminado de escaques. */
        for (let i = 1; i < 8; i++) // Como máximo puede recorrer 7 casillas, no 8, porque la pieza ya está ocupando una de las 8 casillas disponibles
        {
            if (posIni[0] - i >= 0 && posIni[1] + i <= 7 && tablero[posIni[0] - i][posIni[1] + i] === "" && seguirDiagonal[0]) posValidas.push([posIni[0] - i, posIni[1] + i]);
            else if (posIni[0] - i >= 0 && posIni[1] + i <= 7 && tablero[posIni[0] - i][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[0]) { posValidas.push([posIni[0] - i, posIni[1] + i]); seguirDiagonal[0] = false; }
            else seguirDiagonal[0] = false; // Superior-derecha

            if (posIni[0] + i <= 7 && posIni[1] + i <= 7 && tablero[posIni[0] + i][posIni[1] + i] === "" && seguirDiagonal[1]) posValidas.push([posIni[0] + i, posIni[1] + i]);
            else if (posIni[0] + i <= 7 && posIni[1] + i <= 7 && tablero[posIni[0] + i][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[1]) { posValidas.push([posIni[0] + i, posIni[1] + i]); seguirDiagonal[1] = false; }
            else seguirDiagonal[1] = false; // Inferior-derecha

            if (posIni[0] + i <= 7 && posIni[1] - i >= 0 && tablero[posIni[0] + i][posIni[1] - i] === "" && seguirDiagonal[2]) posValidas.push([posIni[0] + i, posIni[1] - i]);
            else if (posIni[0] + i <= 7 && posIni[1] - i >= 0 && tablero[posIni[0] + i][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[2]) { posValidas.push([posIni[0] + i, posIni[1] - i]); seguirDiagonal[2] = false; }
            else seguirDiagonal[2] = false; // Inferior-izquierda

            if (posIni[0] - i >= 0 && posIni[1] - i >= 0 && tablero[posIni[0] - i][posIni[1] - i] === "" && seguirDiagonal[3]) posValidas.push([posIni[0] - i, posIni[1] - i]);
            else if (posIni[0] - i >= 0 && posIni[1] - i >= 0 && tablero[posIni[0] - i][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[3]) { posValidas.push([posIni[0] - i, posIni[1] - i]); seguirDiagonal[3] = false; }
            else seguirDiagonal[3] = false; // Superior-izquierda
        }
    }
    else if (pieza.charAt(0) === 'D') // Validar movimiento de la reina
    {
        /* La reina se mueve en las ocho direcciones de forma ortogonal y diagonal un número indeterminado de escaques. */
        for (let i = 1; i < 8; i++) // Como máximo puede recorrer 7 casillas, no 8, porque la pieza ya está ocupando una de las 8 casillas disponibles
        {
            if (posIni[0] - i >= 0 && tablero[posIni[0] - i][posIni[1]] === "" && seguirOrtogonal[0]) posValidas.push([posIni[0] - i, posIni[1]]);
            else if (posIni[0] - i >= 0 && tablero[posIni[0] - i][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[0]) { posValidas.push([posIni[0] - i, posIni[1]]); seguirOrtogonal[0] = false; }
            else seguirOrtogonal[0] = false; // Arriba

            if (posIni[1] + i <= 7 && tablero[posIni[0]][posIni[1] + i] === "" && seguirOrtogonal[1]) posValidas.push([posIni[0], posIni[1] + i]);
            else if (posIni[1] + i <= 7 && tablero[posIni[0]][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[1]) { posValidas.push([posIni[0], posIni[1] + i]); seguirOrtogonal[1] = false; }
            else seguirOrtogonal[1] = false; // Derecha

            if (posIni[0] + i <= 7 && tablero[posIni[0] + i][posIni[1]] === "" && seguirOrtogonal[2]) posValidas.push([posIni[0] + i, posIni[1]]);
            else if (posIni[0] + i <= 7 && tablero[posIni[0] + i][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[2]) { posValidas.push([posIni[0] + i, posIni[1]]); seguirOrtogonal[2] = false; }
            else seguirOrtogonal[2] = false; // Abajo

            if (posIni[1] - i >= 0 && tablero[posIni[0]][posIni[1] - i] === "" && seguirOrtogonal[3]) posValidas.push([posIni[0], posIni[1] - i]);
            else if (posIni[1] - i >= 0 && tablero[posIni[0]][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirOrtogonal[3]) { posValidas.push([posIni[0], posIni[1] - i]); seguirOrtogonal[3] = false; }
            else seguirOrtogonal[3] = false; // Izquierda

            if (posIni[0] - i >= 0 && posIni[1] + i <= 7 && tablero[posIni[0] - i][posIni[1] + i] === "" && seguirDiagonal[0]) posValidas.push([posIni[0] - i, posIni[1] + i]);
            else if (posIni[0] - i >= 0 && posIni[1] + i <= 7 && tablero[posIni[0] - i][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[0]) { posValidas.push([posIni[0] - i, posIni[1] + i]); seguirDiagonal[0] = false; }
            else seguirDiagonal[0] = false; // Superior-derecha

            if (posIni[0] + i <= 7 && posIni[1] + i <= 7 && tablero[posIni[0] + i][posIni[1] + i] === "" && seguirDiagonal[1]) posValidas.push([posIni[0] + i, posIni[1] + i]);
            else if (posIni[0] + i <= 7 && posIni[1] + i <= 7 && tablero[posIni[0] + i][posIni[1] + i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[1]) { posValidas.push([posIni[0] + i, posIni[1] + i]); seguirDiagonal[1] = false; }
            else seguirDiagonal[1] = false; // Inferior-derecha

            if (posIni[0] + i <= 7 && posIni[1] - i >= 0 && tablero[posIni[0] + i][posIni[1] - i] === "" && seguirDiagonal[2]) posValidas.push([posIni[0] + i, posIni[1] - i]);
            else if (posIni[0] + i <= 7 && posIni[1] - i >= 0 && tablero[posIni[0] + i][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[2]) { posValidas.push([posIni[0] + i, posIni[1] - i]); seguirDiagonal[2] = false; }
            else seguirDiagonal[2] = false; // Inferior-izquierda

            if (posIni[0] - i >= 0 && posIni[1] - i >= 0 && tablero[posIni[0] - i][posIni[1] - i] === "" && seguirDiagonal[3]) posValidas.push([posIni[0] - i, posIni[1] - i]);
            else if (posIni[0] - i >= 0 && posIni[1] - i >= 0 && tablero[posIni[0] - i][posIni[1] - i].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1') && seguirDiagonal[3]) { posValidas.push([posIni[0] - i, posIni[1] - i]); seguirDiagonal[3] = false; }
            else seguirDiagonal[3] = false; // Superior-izquierda
        }
    }
    else if (pieza.charAt(0) === 'R') // Validar movimiento del rey
    {
        /* El rey se puede mover en las ocho direcciones de forma ortogonal y diagonal en solo una unidad. */
        if (posIni[0] - 1 >= 0 && (tablero[posIni[0] - 1][posIni[1]] === "" || tablero[posIni[0] - 1][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 1, posIni[1]]); // Arriba
        if (posIni[0] - 1 >= 0 && posIni[1] + 1 <= 7 && (tablero[posIni[0] - 1][posIni[1] + 1] === "" || tablero[posIni[0] - 1][posIni[1] + 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 1, posIni[1] + 1]); // Arriba-derecha
        if (posIni[1] + 1 <= 7 && (tablero[posIni[0]][posIni[1] + 1] === "" || tablero[posIni[0]][posIni[1] + 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0], posIni[1] + 1]); // Derecha
        if (posIni[0] + 1 <= 7 && posIni[1] + 1 <= 7 && (tablero[posIni[0] + 1][posIni[1] + 1] === "" || tablero[posIni[0] + 1][posIni[1] + 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 1, posIni[1] + 1]); // Abajo-derecha
        if (posIni[0] + 1 <= 7 && (tablero[posIni[0] + 1][posIni[1]] === "" || tablero[posIni[0] + 1][posIni[1]].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 1, posIni[1]]); // Abajo
        if (posIni[0] + 1 <= 7 && posIni[1] - 1 >= 0 && (tablero[posIni[0] + 1][posIni[1] - 1] === "" || tablero[posIni[0] + 1][posIni[1] - 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] + 1, posIni[1] - 1]); // Abajo-izquierda
        if (posIni[1] - 1 >= 0 && (tablero[posIni[0]][posIni[1] - 1] === "" || tablero[posIni[0]][posIni[1] - 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0], posIni[1] - 1]); // Izquierda
        if (posIni[0] - 1 >= 0 && posIni[1] - 1 >= 0 && (tablero[posIni[0] - 1][posIni[1] - 1] === "" || tablero[posIni[0] - 1][posIni[1] - 1].charAt(1) === (pieza.charAt(1) === '1' ? '2' : '1'))) posValidas.push([posIni[0] - 1, posIni[1] - 1]); // Arriba-izquierda
    }

    return posValidas;
}

/**
 * Se encarga de validar si un movimiento se considera válido o no dependiendo de la pieza y su posición en el tablero
 * @param pos_inicial es la posición donde está ubicada la pieza seleccionada
 * @param pos_final es la posición donde se quiere ubicar la pieza seleccionada
 * @param pieza es el tipo de pieza a mover
 * @return {boolean} true si el movimiento es válido, false en caso contrario
 */
function validarMovimiento(pos_inicial, pos_final, pieza)
{
    if (pos_inicial === "") return false;

    let posFin = posToArray(pos_final);
    let posValidas = posicionesValidas(pos_inicial, pieza);

    console.log(posValidas);
    console.log(posValidas.includes(posFin));

    return posValidas.some((elem) => elem[0] === posFin[0] && elem[1] === posFin[1]);
}

/**
 * Transforma una posición en formato ajedrez ("d4", "f8"...) al formato necesario para manejar arrays
 * @param pos es la posición en formato ajedrez
 * @return {number[]} es un array con la fila y la columna transformadas para usar en el tablero de este javascript
 */
function posToArray(pos)
{
    let ij = [0, 0];

    ij[0] = 8 - parseInt(pos.charAt(1));
    switch (pos.charAt(0))
    {
        case 'a': ij[1] = 0; break;
        case 'b': ij[1] = 1; break;
        case 'c': ij[1] = 2; break;
        case 'd': ij[1] = 3; break;
        case 'e': ij[1] = 4; break;
        case 'f': ij[1] = 5; break;
        case 'g': ij[1] = 6; break;
        case 'h': ij[1] = 7; break;
    }
    return ij;
}

/**
 * Transforma una posición en formato array [fila, columna] al formato de ajedrez ("d4", "f8"...)
 * @param array es la posición a transformar que contiene la fila y la columna
 * @return {string} la casilla en formato ajedrez
 */
function arrayToPos(array)
{
    let pos = "";

    switch (array[1])
    {
        case 0: pos += 'a'; break;
        case 1: pos += 'b'; break;
        case 2: pos += 'c'; break;
        case 3: pos += 'd'; break;
        case 4: pos += 'e'; break;
        case 5: pos += 'f'; break;
        case 6: pos += 'g'; break;
        case 7: pos += 'h'; break;
    }
    pos += 8 - array[0];

    return pos;
}

/**
 * Función para la realización del programa, ignorar
 */
function debug()
{
    console.log("Pos. seleccionada: " + posSeleccionada);
    console.log("Pieza seleccionada: " + piezaSeleccionada);
    console.log("Turno: " + turno);
    console.log("Tablero:\n" + tableroString());
}

/**
 * Función auxiliar para el debug, ignorar
 * @return {string} es el tablero formateado correctamente
 */
function tableroString()
{
    let str = "";
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            str += tablero[i][j] === "" ? "--" : tablero[i][j];
            str += " ";
        }
        str += "\n";
    }
    return str;
}

/**
 * Si se activó la IA de uno de los lados cuando le tocaba mover pieza en ese mismo turno, le pedimos a la IA que ejecute un movimiento
 * @param estado es el estado del checkbox (checked)
 * @param color es el color de las piezas de las que se activó la IA ('1' para las blancas y '2' para las negras)
 */
function activarIA(estado, color)
{
    if (estado && turno === color) pensarMovimientoIA();
}

/**
 * Núcleo de la inteligencia artificial. Piensa un movimiento y lo ejecuta
 */
function pensarMovimientoIA()
{
    let piezas = [];
    for (let i = 0; i < 8; i++)
    {
        for (let j = 0; j < 8; j++)
        {
            if (tablero[i][j].charAt(1) === turno) piezas.push([{fila: i, columna: j}, tablero[i][j]])
        }
    }
    let escogido;
    let casillaEscogida;
    let posValidas = [];

    while (posValidas.length === 0)
    {
        escogido = getRandomInt(piezas.length);
        casillaEscogida = arrayToPos([piezas[escogido][0].fila, piezas[escogido][0].columna]);
        console.log(piezas[escogido]);
        console.log(casillaEscogida);
        posValidas = posicionesValidas(casillaEscogida, piezas[escogido][1]);
    }
    let posFinEscogida = arrayToPos(posValidas[getRandomInt(posValidas.length)]);

    procesarMovimiento(casillaEscogida, posFinEscogida, piezas[escogido][1]);
}

function getRandomInt(max) { return Math.floor(Math.random() * max); }

function cambiaColor(casilla, color)
{
    document.querySelector(':root').style.setProperty(casilla, color);
}