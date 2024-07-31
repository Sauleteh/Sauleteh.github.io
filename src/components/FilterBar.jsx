export function FilterBar({ sendData }) {
    function handleChange(event) {
        sendData(event.target.value);
    }

    return (
        <select onChange={handleChange}>
            <option value="all">Sin filtrado</option>
            <optgroup label="Tema">
                <option value="option4">Option 4</option>
                <option value="option5">Option 5</option>
                <option value="option6">Option 6</option>
            </optgroup>
            <optgroup label="Plataforma">
                <option value="option7">Option 7</option>
                <option value="option8">Option 8</option>
                <option value="option9">Option 9</option>
            </optgroup>
        </select>
    )
}