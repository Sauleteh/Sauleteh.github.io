export const STORAGE_KEYS = { // Claves de almacenamiento local
    OPTION_CLICK_INSTEAD_OF_HOLDING: "optClickInsteadOfHoldingCD",
    OPTION_EFFECTS: "optEffectsCD",
    OPTION_NAME: "userName_long",
    DEVICE_ID: "deviceID_long",
    PASS: "userPass_long"
};

export const EFFECT_LABELS = {
    OFF: 0,
    SOFT: 1,
    MEDIUM: 2,
    STRONG: 3
};

export const EFFECT_DATA = {
    [EFFECT_LABELS.OFF]: 0,
    [EFFECT_LABELS.SOFT]: 0.01,
    [EFFECT_LABELS.MEDIUM]: 0.05,
    [EFFECT_LABELS.STRONG]: 0.1
};