import { Point, PointWithDirection } from './Point.js';

/**
 * Clase que representa un circuito para competir.
 * Las líneas que forman el circuito son segmentos: cada segmento puede ser una línea recta o un arco de círculo.
 * Para crear segmentos, utilizar las funciones estáticas.
 * Tener en cuenta que la creación del circuito se hace delimitando el centro del circuito.
 * Muy importante que, antes de añadir segmentos, se indique punto de inicio.
*/
export class Circuit {
    constructor(circuitWidth, lineWidth) {
        this.circuitWidth = circuitWidth; // Ancho del circuito en píxeles
        this.lineWidth = lineWidth; // Ancho de las líneas que delimitan el circuito
        
        this.segments = []; // Las líneas que forman el circuito
        this.startPoint = null; // Punto de inicio del circuito. Modificar con setStartPoint
        this.leftFinishLine = null; // Punto de inicio de la línea de meta por la izquierda
        this.rightFinishLine = null; // Punto de inicio de la línea de meta por la derecha
    }

    /**
     * Añade un segmento al circuito.
     * @param {object} segment Es el segmento que se quiere añadir al circuito.
     */
    addSegment(segment) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }
        else this.segments.push(segment);
    }

    /**
     * Método para saber cómo cerrar el circuito de la mejor forma posible.
     * No cambia valores de ningún segmento, solo comenta cómo se debería cambiar el último segmento para cerrar el circuito.
     * Obligatorio que el último segmento sea un arco, da igual su distancia con respecto al punto de inicio, pero debe tener un ángulo respecto al punto de inicio menor de 90 grados.
     * @param {number} maxIterations Número máximo de iteraciones para encontrar la distancia 0. Cuanto mayor sea, más preciso será el resultado. Si es muy bajo, se obtendrá una aproximación poco precisa.
     * @returns {void} Observar la consola del navegador para saber los resultados. En caso de poder cerrarlo, dirá qué radio y con qué ángulo debería ponerse el último arco y, en caso de necesitarlo, también dirá qué longitud tendrá la recta final del circuito.
     */
    howToCloseCircuit(maxIterations = 100) {
        if (this.segments.length === 0) { throw new Error('No hay segmentos en el circuito'); }

        let lastSegment = structuredClone(this.segments[this.segments.length - 1]);
        const firstPoint = structuredClone(this.startPoint);

        // Normalizar la dirección de los puntos
        lastSegment.ref.direction = (lastSegment.ref.direction + 360) % 360;
        firstPoint.direction = (firstPoint.direction + 360) % 360;

        // Comprobar si el circuito ya está cerrado
        let dx = lastSegment.ref.coords.x - firstPoint.coords.x;
        let dy = lastSegment.ref.coords.y - firstPoint.coords.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < 1e-6) {
            console.log("Intento de cerrado de circuito fallido:\n\nEl circuito ya está cerrado");
            return;
        }
        else { // Para cerrar el circuito de forma que no se cambie de forma excesiva la estructura del circuito, no se comprueba cómo añadir un nuevo segmento, solo se comenta cómo se debería cambiar el último segmento para cerrarlo correctamente
            if (lastSegment.type === "straight") {
                console.log("Intento de cerrado de circuito fallido:\n\nNo se puede cerrar el circuito con una línea recta. Por favor, borra el último segmento y añade un arco como último segmento.");
                return;
            }
            else {
                // Comprobar diferencia de ángulos
                let diffAngle = (lastSegment.data.isClockwise) ?
                ((firstPoint.direction - lastSegment.ref.direction + 360) % 360) :
                ((lastSegment.ref.direction - firstPoint.direction + 360) % 360);

                let newAngle = (lastSegment.data.endAngle - lastSegment.data.startAngle) * 180 / Math.PI;

                if (diffAngle >= 90) {
                    console.log("Intento de cerrado de circuito fallido:\n\nEl último segmento debe tener una diferencia menor de 90 grados con respecto al punto de cierre para saber cómo cerrar el circuito. Por favor, suma o resta el ángulo al último segmento para que la diferencia sea estrictamente menor de 90 grados.");
                    return;
                }
                else if (diffAngle > 0) {
                    // Borrar el último segmento y añadir un nuevo arco con el ángulo correcto
                    const tempSegment = this.segments.pop();
                    newAngle += diffAngle * (lastSegment.data.isClockwise ? 1 : -1);
                    lastSegment = this.arc(lastSegment.data.radius, newAngle);
                    this.addSegment(tempSegment);
                }

                // A partir de aquí, el segmento ya es paralelo al punto de inicio
                
                // Calcular la distancia de la curva con respecto al punto de inicio de forma perpendicular
                const angleTan = Math.tan(firstPoint.direction * Math.PI / 180);
                let distance = -1;
                let newRadius = -1;
                let iterations = 0;
                let lastDistance = 0; // Distancia del último paso
                let sign = 1; // Signo de la distancia, ya que no entiendo cómo funciona el signo de la distancia, se invierte si la nueva distancia es mayor que la anterior (ya que se está intentando disminuir la distancia lo máximo posible)

                while (distance !== 0 && iterations < maxIterations) { // Iterar para encontrar la distancia 0
                    distance = (angleTan * lastSegment.ref.coords.x - lastSegment.ref.coords.y - angleTan * firstPoint.coords.x + firstPoint.coords.y) / Math.sqrt(angleTan * angleTan + 1);
                    newRadius = lastSegment.data.radius + distance * sign;

                    if (iterations === 0) lastDistance = distance; // Esto solo ocurre en la primera iteración para obtener el primer cálculo de la distancia
                    else if (iterations === 1) sign = Math.abs(distance) > Math.abs(lastDistance) ? -sign : sign; // En la segunda iteración se define correctamente el signo de la distancia

                    if (distance !== 0) {
                        const tempSegment = this.segments.pop();
                        lastSegment = this.arc(newRadius, newAngle);
                        this.addSegment(tempSegment);
                    }

                    if (Math.abs(distance) < 1e-6) { // Si la distancia llega a una aproximación suficientemente buena, se considera que es 0
                        distance = 0;
                    }

                    iterations++;
                }

                // A partir de aquí, el segmento ya es paralelo al punto de inicio y está en la línea recta que une el punto de inicio con el punto final del segmento

                // Calcular la longitud de la línea recta que falta
                dx = lastSegment.ref.coords.x - firstPoint.coords.x;
                dy = lastSegment.ref.coords.y - firstPoint.coords.y;
                const lineLength = Math.sqrt(dx * dx + dy * dy);

                console.log(
                    `Intento de cerrado de circuito terminado en ${iterations} iteraciones:\n\n` +
                    `Para cerrar el circuito, cambia el último segmento a circuit.arc(${newRadius}, ${newAngle}).\n\n` +
                    (lineLength > 0 ? `Después, borra la llamada a este método y añade después del arco anterior el segmento circuit.straightLine(${lineLength}).` : `Después, borra la llamada a este método.`) +
                    (distance !== 0 ? `\n\nIMPORTANTE: El radio obtenido no es un resultado perfecto sino una aproximación, aumenta el número de iteraciones para solventar esto si es necesario.` : '')
                );
            }
        }
    }

    /**
     * Obtener el segmento en el que se encuentra el coche, o null si está fuera del circuito.
     * @param {object} car es el coche que se quiere comprobar.
     * @param {number} precision es la precisión con la que se quiere comprobar si el coche está en el segmento. 1 indica que se comprobará todo el ancho del circuito, 0.5 la mitad, etc. La precisión es relativa al centro del circuito.
     * @returns Objeto segment que contiene el segmento en el que se encuentra el coche, o null si está fuera del circuito.
     */
    getCurrentSegment(car, precision = 1) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.type === 'straight') {
                // Comprobar si el punto está dentro de la línea recta
                const segmentCenter = new Point(
                    (segment.data.start.x + segment.data.end.x) / 2,
                    (segment.data.start.y + segment.data.end.y) / 2
                );

                // Diferencia entre las coordenadas del coche y la del segmento
                const translated = new Point(
                    car.coords.x - segmentCenter.x,
                    car.coords.y - segmentCenter.y
                );

                const cosAngle = Math.cos(-segment.ref.direction * Math.PI / 180);
                const sinAngle = Math.sin(-segment.ref.direction * Math.PI / 180);

                // Deshacemos la rotación del segmento
                const rotated = new Point(
                    translated.x * cosAngle - translated.y * sinAngle,
                    translated.x * sinAngle + translated.y * cosAngle
                );

                if (rotated.x >= -segment.data.length / 2 && rotated.x <= segment.data.length / 2 && rotated.y >= -this.circuitWidth * precision / 2 && rotated.y <= this.circuitWidth * precision / 2) return segment;
            }
            else if (segment.type === 'arc') {
                // Comprobar si el punto está dentro del sector circular
                const dx = car.coords.x - segment.data.arcCenter.x;
                const dy = car.coords.y - segment.data.arcCenter.y;
                const distanceSquared = dx * dx + dy * dy;

                // Si se está fuera del radio exterior o interior, ya se confirma que se está fuera
                if (distanceSquared > (segment.data.radius + this.circuitWidth * precision / 2) * (segment.data.radius + this.circuitWidth * precision / 2)) continue;
                else if (distanceSquared < (segment.data.radius - this.circuitWidth * precision / 2) * (segment.data.radius - this.circuitWidth * precision / 2)) continue;

                // Si se está dentro, calcular si el coche está en el ángulo correcto del círculo
                let pointAngle = Math.atan2(dy, dx);
                if (pointAngle < 0) pointAngle += 2 * Math.PI;

                const normalizedStartAngle = (segment.data.startAngle + 2 * Math.PI) % (2 * Math.PI);
                const normalizedEndAngle = (segment.data.endAngle + 2 * Math.PI) % (2 * Math.PI);

                if (segment.data.isClockwise) {
                    if (normalizedStartAngle < normalizedEndAngle) {
                        if (pointAngle >= normalizedStartAngle && pointAngle <= normalizedEndAngle) return segment;
                    }
                    else if (pointAngle >= normalizedStartAngle || pointAngle <= normalizedEndAngle) return segment;
                }
                else {
                    if (normalizedStartAngle < normalizedEndAngle) {
                        if (pointAngle <= normalizedStartAngle || pointAngle >= normalizedEndAngle) return segment;
                    }
                    else if (pointAngle <= normalizedStartAngle && pointAngle >= normalizedEndAngle) return segment;
                }
            }
        }
        return null;
    }

    /**
     * Comprobar si el coche está dentro del circuito
     * @param {object} car Es el coche que se quiere comprobar.
     * @returns Booleano que indica si el coche está dentro del circuito.
     */
    isCarInside(car) {
        const currentSegment = this.getCurrentSegment(car);
        if (currentSegment === null) return false;
        else return true;
    }

    /**
     * Obtener el lado en el que está el coche en un segmento de arco, retornando "inside" si está en la parte interior, "outside" si está en la parte exterior. NO se comprueba si está dentro del segmento.
     * @param {object} car Es el coche que se quiere comprobar.
     * @param {object} segment Es el segmento de arco en el que se quiere comprobar.
     * @returns Cadena de texto que representa el lado en el que está el coche: "inside" u "outside".
     */
    getArcSide(car, segment) {
        if (segment.type !== 'arc') throw new Error('El segmento no es un arco');

        const dx = car.coords.x - segment.data.arcCenter.x;
        const dy = car.coords.y - segment.data.arcCenter.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= segment.data.radius * segment.data.radius) return 'inside';
        else return 'outside';
    }

    /**
     * Obtener el ángulo de un punto respecto al centro de un segmento de arco. NO se comprueba si está dentro del segmento.
     * @param {object} car Es el coche que se quiere comprobar.
     * @param {object} segment Es el segmento de arco en el que se quiere comprobar.
     * @returns Número que representa el ángulo en grados.
     */
    getArcAngle(car, segment) {
        if (segment.type !== 'arc') throw new Error('El segmento no es un arco');

        const dx = car.coords.x - segment.data.arcCenter.x;
        const dy = car.coords.y - segment.data.arcCenter.y;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        return angle * 180 / Math.PI;
    }

    /**
     * Definir el punto de inicio del circuito. Tiene dos formas de llamarse: con un argumento o con tres argumentos.
     * @param {number|object} x Es la coordenada x del punto de inicio o un objeto PointWithDirection si solo se llama con un argumento.
     * @param {number} y Es la coordenada y del punto de inicio.
     * @param {number} direction Es la dirección en grados del punto de inicio.
     */
    setStartPoint(x, y, direction) {
        if (arguments.length === 1) this.startPoint = x;
        else this.startPoint = new PointWithDirection(x, y, direction);

        this.leftFinishLine = new Point(
            this.startPoint.coords.x + Math.cos((this.startPoint.direction - 90) * Math.PI / 180) * this.circuitWidth / 2,
            this.startPoint.coords.y + Math.sin((this.startPoint.direction - 90) * Math.PI / 180) * this.circuitWidth / 2
        );
        this.rightFinishLine = new Point(
            this.startPoint.coords.x + Math.cos((this.startPoint.direction + 90) * Math.PI / 180) * this.circuitWidth / 2,
            this.startPoint.coords.y + Math.sin((this.startPoint.direction + 90) * Math.PI / 180) * this.circuitWidth / 2
        );
    }

    /**
     * Comprobar si un coche ha cruzado la línea de meta.
     * @param {object} car Es el coche que se quiere comprobar.
     * @returns Booleano que indica si el coche ha cruzado la línea de meta en el último frame.
     */
    hasCrossedFinishLine(car) {
        // Créditos: https://math.stackexchange.com/questions/149622/finding-out-whether-two-line-segments-intersect-each-other (Respuesta de wcochran)
        const p1 = car.lastCoords;
        const p2 = car.coords;
        const l1 = this.leftFinishLine;
        const l2 = this.rightFinishLine;

        const det = (p2.x - p1.x) * (l2.y - l1.y) - (p2.y - p1.y) * (l2.x - l1.x); // Calcular determinante (denominador para las fórmulas de intersección)
        if (det === 0) return false; // Si det = 0, las líneas son paralelas o coincidentes, no hay cruce

        // Calcular parámetros de la intersección (t y u)
        const t = ((l1.x - p1.x) * (l2.y - l1.y) - (l1.y - p1.y) * (l2.x - l1.x)) / det;
        const u = ((l1.x - p1.x) * (p2.y - p1.y) - (l1.y - p1.y) * (p2.x - p1.x)) / det;

        // Verificar si la intersección ocurre dentro de ambos segmentos
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
        else return false;
    }

    /**
     * Devuelve un segmento que representa una línea recta para el circuito con los segmentos actuales.
     * @param {number} length Es la longitud de la línea recta, en píxeles.
     * @returns Objeto que representa el segmento.
     */
    straightLine(length) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }

        const currentPoint = this.segments.length === 0 ? this.startPoint : this.segments[this.segments.length-1].ref;

        const startCoords = new Point(
            currentPoint.coords.x,
            currentPoint.coords.y
        );

        const endCoords = new Point(
            Math.cos(currentPoint.direction * Math.PI / 180) * length + currentPoint.coords.x,
            Math.sin(currentPoint.direction * Math.PI / 180) * length + currentPoint.coords.y
        );

        return {
            id: this.segments.length,
            type: 'straight',
            ref: new PointWithDirection(endCoords.x, endCoords.y, currentPoint.direction),
            data: {
                start: startCoords,
                end: endCoords,
                widthSin: this.circuitWidth * Math.sin(currentPoint.direction * Math.PI / 180) / 2,
                widthCos: this.circuitWidth * Math.cos(currentPoint.direction * Math.PI / 180) / 2,
                length: length
            }
        }
    }

    /**
     * Devuelve un segmento que representa un arco para el circuito con los segmentos actuales.
     * @param {number} radius Es el radio del arco, en píxeles.
     * @param {number} angle Es el ángulo del arco, en grados. Positivo para arcos en sentido horario, negativo para arcos en sentido antihorario.
     * @returns Objeto que representa el segmento.
     */
    arc(radius, angle) {
        if (this.startPoint === null) { throw new Error('No se ha indicado punto de inicio'); }

        const currentPoint = this.segments.length === 0 ? this.startPoint : this.segments[this.segments.length-1].ref;
        const angleDirection = angle > 0 ? -90 : 90;
        const angleSign = angle > 0 ? 1 : -1;

        const center = new Point(
            currentPoint.coords.x - Math.cos((currentPoint.direction + angleDirection) * Math.PI / 180) * radius,
            currentPoint.coords.y - Math.sin((currentPoint.direction + angleDirection) * Math.PI / 180) * radius
        );

        const reference = new Point(
            center.x + Math.cos(((currentPoint.direction + angleDirection * angleSign) + angle) * Math.PI / 180) * radius * angleSign,
            center.y + Math.sin(((currentPoint.direction + angleDirection * angleSign) + angle) * Math.PI / 180) * radius * angleSign
        );

        return {
            id: this.segments.length,
            type: 'arc',
            ref: new PointWithDirection(reference.x, reference.y, currentPoint.direction + angle),
            data: {
                arcCenter: center,
                radius: radius,
                startAngle: (currentPoint.direction + angleDirection) * Math.PI / 180, // En radianes
                endAngle: ((currentPoint.direction + angleDirection) + angle) * Math.PI / 180, // En radianes
                isClockwise: angle > 0
            }
        }
    }

    /**
     * Transforma los segmentos recibidos del servidor en segmentos válidos y los añade al circuito.
     * @param {object[]} segments Son los segmentos recibidos del servidor.
     */
    addServerSegments(segments) {
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (segment.type === "straight") this.addSegment(this.straightLine(segment.data.length));
            else if (segment.type === "arc") this.addSegment(this.arc(segment.data.radius, segment.data.angle));
            else throw new Error("Segmento no reconocido");
        }
    }

    static defaultCircuit() {
        const circuit = new Circuit(500, 20);
        circuit.setStartPoint(100, 100, 60);
        circuit.addSegment(circuit.arc(300, 180));
        circuit.addSegment(circuit.arc(300, 180));
        return circuit;
    }
}