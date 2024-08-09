import "../css/components/SearchBar.css";
import PropTypes from "prop-types";

export function SearchBar({ sendData }) {
    function handleChange(event) {
        sendData(event.target.value)
    }

    return (
        <input className="searchbar-input" type="text" name="search-bar" placeholder="Buscar proyecto..." onChange={handleChange}/>
    )
}

SearchBar.propTypes = {
    sendData: PropTypes.func.isRequired
}