import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

window.addEventListener('resize', adaptarTitulos);
window.onload = adaptarTitulos;

function adaptarTitulos() // Cambia el tamaño de los títulos dependiendo de su longitud
{
  const tamDefault = parseFloat(getComputedStyle(document.querySelector(":root")).getPropertyValue("--tamTitulo"));

  document.querySelectorAll("p.titulo").forEach(element => {
    element.style.fontSize = (element.innerText.length <= 30 ? tamDefault : (tamDefault - ((element.innerText.length - 30) * 0.37))) + "px";
  });
}