export const SQUARE_SIZE = 32;
export const IMG_SQUARE_SIZE = 16;
export const MINE_ID = -1; // Identificador de la mina (0-8 para números, -1 para la mina)

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
