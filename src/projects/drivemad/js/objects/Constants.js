import { Car } from "./Car.js";
import { Point } from "./Point.js";
import { MenuImage } from "./MenuObjects.js";

export const GAMEMODES = {
    RACE: "RACE"
};

export const STORAGE_KEYS = {
    ACTUAL_CAR_INDEX: "drivemad_actual_car_index"
}

export const CARS = [
    new Car("Seot Lean", new Point(0, 0), 0,
        20, 40, new MenuImage(26*0, 16, 26, 15, "spriteUI"),
        1.2, 1.5, 0.3,
        5, 4, 1.5,
        1.05, 1000
    ),
    new Car("BEMEV i7 7700K", new Point(0, 0), 0,
        20, 40, new MenuImage(26*1, 16, 26, 15, "spriteUI"),
        1.4, 1.6, 0.5,
        4, 4, 1.3,
        1.04, 850
    ),
    new Car("Ferfari Pheromosa", new Point(0, 0), 0,
        20, 40, new MenuImage(26*2, 16, 26, 15, "spriteUI"),
        1.6, 1.8, 0.4,
        5, 3, 1.0,
        1.02, 500
    ),
    new Car("Menozda RY-7", new Point(0, 0), 0,
        20, 40, new MenuImage(26*3, 16, 26, 15, "spriteUI"),
        1.3, 1.4, 0.3,
        2, 2, 3.0,
        1.1, 1500
    )
];