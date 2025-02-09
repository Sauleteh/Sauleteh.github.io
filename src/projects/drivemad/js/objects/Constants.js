import { Car } from "./Car.js";
import { Point } from "./Point.js";
import { MenuImage } from "./MenuObjects.js";

export const GAMEMODES = {
    RACE: "RACE"
};

export const STORAGE_KEYS = {
    ACTUAL_CAR_INDEX: "drivemad_actual_car_index",
    ACTUAL_CAR_COLOR_SHIFT: "drivemad_actual_car_color_shift"
}

export const CARS = [
    new Car("Seot Lean", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*0, 40, 20, "spriteVehicles"),
        1.2, 1.5, 0.3,
        5, 4, 1.5,
        1.05, 1000
    ),
    new Car("BEMEV i7 7700K", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*1, 40, 20, "spriteVehicles"),
        1.4, 1.6, 0.5,
        4, 4, 1.3,
        1.04, 850
    ),
    new Car("Ferfari Pheromosa", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*2, 40, 20, "spriteVehicles"),
        1.6, 1.8, 0.7,
        5, 3, 1.0,
        1.02, 500
    ),
    new Car("Menozda RY-7", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*3, 40, 20, "spriteVehicles"),
        1.3, 1.4, 0.6,
        2, 2, 3.0,
        1.1, 1500
    ),
    new Car("Toiota Chupa", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*4, 40, 20, "spriteVehicles"),
        1.35, 1.3, 0.2,
        8, 6, 2.8,
        1.03, 900
    ),
    new Car("Oniichan Cielolínea", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*5, 40, 20, "spriteVehicles"),
        1.4, 2, 0.35,
        3, 3, 2.3,
        1.03, 950
    ),
    new Car("For Concentración", new Point(0, 0), 0,
        20, 40, new MenuImage(0, 20*6, 40, 20, "spriteVehicles"),
        0.75, 1.2, 1.8,
        6, 4, 1.6,
        1.04, 1200
    )
];