export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 24; // 20 para el juego + 4 para la pieza que cae
export const SQUARE_SIZE = 25; // Tamaño de un cuadrado en el tablero
export const INITIAL_FALLING_SPEED = 1; // Velocidad inicial de caída de las piezas
export const MOVEMENT_DELAY_THRESHOLD = 8; // Número de frames a esperar para considerar que la tecla de movimiento se mantiene en vez de solo ser presionada
export const GROUND_RESET_LIMIT = 10; // Número de veces que la pieza puede resetear el temporizador de caída antes de quedar fija
export const GROUND_RESET_THRESHOLD = 0.5; // Número de segundos a esperar para dejar una pieza fija después de tocar un suelo
export const DEFAULT_FPS_CAP = 30;

export const STORAGE_KEYS = { // Claves de almacenamiento local
    OPTION_EFFECT: "optEffect",
    OPTION_STYLE: "optStyle",
    OPTION_EXPERIMENTAL: "optExp",
    OPTION_KONAMICODE: "optKonami"
}

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

export const COLOR_TO_HEX = {
    [COLORS.CYAN]: '#00FFFF',
    [COLORS.BLUE]: '#0000FF',
    [COLORS.ORANGE]: '#FFA500',
    [COLORS.YELLOW]: '#FFFF00',
    [COLORS.GREEN]: '#00FF00',
    [COLORS.PURPLE]: '#800080',
    [COLORS.RED]: '#FF0000'
}