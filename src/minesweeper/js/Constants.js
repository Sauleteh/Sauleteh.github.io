export const SQUARE_SIZE = 32;
export const IMG_SQUARE_SIZE = 16;
export const MINE_ID = -1; // Identificador de la mina (0-8 para números, -1 para la mina)

export const STORAGE_KEYS = { // Claves de almacenamiento local
    OPTION_DIFFICULTY: "optDifficultyMS",
    OPTION_EXPERIMENTAL: "optExpMS",
    OPTION_KONAMICODE: "optKonamiMS"
};

// Posición de las imágenes en el sprite
export const SQUARE_TYPES = {
    REVEALED: 0,
    UNREVEALED: 1,
    FLAG: 2,
    MINE: 3,
    ONE: 4,
    TWO: 5,
    THREE: 6,
    FOUR: 7,
    FIVE: 8,
    SIX: 9,
    SEVEN: 10,
    EIGHT: 11
};

export const NUMBER_TO_TYPE = {
    [MINE_ID]: SQUARE_TYPES.MINE,
    [1]: SQUARE_TYPES.ONE,
    [2]: SQUARE_TYPES.TWO,
    [3]: SQUARE_TYPES.THREE,
    [4]: SQUARE_TYPES.FOUR,
    [5]: SQUARE_TYPES.FIVE,
    [6]: SQUARE_TYPES.SIX,
    [7]: SQUARE_TYPES.SEVEN,
    [8]: SQUARE_TYPES.EIGHT
};

export const DIFFICULTY_LABELS = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
    CUSTOM: 3
};

export const DIFFICULTY_DATA = {
    [DIFFICULTY_LABELS.EASY]: {
        rows: 9,
        cols: 9,
        mines: 10
    },
    [DIFFICULTY_LABELS.MEDIUM]: {
        rows: 16,
        cols: 16,
        mines: 40
    },
    [DIFFICULTY_LABELS.HARD]: {
        rows: 16,
        cols: 30,
        mines: 99
    }
};