/**
 * Un punto en un espacio bidimensional.
 * Recordemos que en un canvas, la Y cuanto más alta es, más abajo está.
 */
export class Point
{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Como el punto anterior, pero con una dirección en grados
export class PointWithDirection
{
    constructor(x, y, direction) {
        this.coords = new Point(x, y);
        this.direction = direction;
    }
}