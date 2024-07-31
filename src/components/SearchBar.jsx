export function SearchBar({ sendData }) {
    function handleChange(event) {
        sendData(event.target.value)
    }

    return (
        <div className="search-bar">
            <input type="text" id="search-bar" name="search-bar" placeholder="Buscar..." onChange={handleChange}/>
        </div>
    )
}