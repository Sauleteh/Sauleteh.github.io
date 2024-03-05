export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 24; // 20 para el juego + 4 para la pieza que cae
export const SQUARE_SIZE = 25; // Tamaño de un cuadrado en el tablero
export const INITIAL_FALLING_SPEED = 1; // Velocidad inicial de caída de las piezas
export const MOVEMENT_DELAY_THRESHOLD = 8; // Número de frames a esperar para considerar que la tecla de movimiento se mantiene en vez de solo ser presionada

export const COLORS = {
    CYAN: 0,
    BLUE: 1,
    ORANGE: 2,
    YELLOW: 3,
    GREEN: 4,
    PURPLE: 5,
    RED: 6
}

export const TETROMINO = {
    I: COLORS.CYAN,
    J: COLORS.BLUE,
    L: COLORS.ORANGE,
    O: COLORS.YELLOW,
    S: COLORS.GREEN,
    T: COLORS.PURPLE,
    Z: COLORS.RED
}