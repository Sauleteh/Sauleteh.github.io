import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

window.addEventListener('resize', adaptarTitulos);
window.onload = () => { adaptarTitulos(); addTooltip(); };

function adaptarTitulos() // Cambia el tamaño de los títulos dependiendo de su longitud
{
  const tamDefault = parseFloat(getComputedStyle(document.querySelector(":root")).getPropertyValue("--tamTitulo"));

  document.querySelectorAll("p.titulo").forEach(element => {
    element.style.fontSize = (element.innerText.length <= 30 ? tamDefault : (tamDefault - ((element.innerText.length - 30) * 0.37))) + "px";
  });
}

function addTooltip() { // Adición de tooltips a los estados de los proyectos
  document.querySelectorAll(".nuevo").forEach(element => {
    element.setAttribute("title", "Proyecto recientemente agregado");
  })
  document.querySelectorAll(".progreso").forEach(element => {
    element.setAttribute("title", "Proyecto que sigue en continuo desarrollo");
  })
  document.querySelectorAll(".pendiente").forEach(element => {
    element.setAttribute("title", "Proyecto que actualmente no funciona de forma correcta");
  })
  document.querySelectorAll(".intermitente").forEach(element => {
    element.setAttribute("title", "Proyecto con un desarrollo casual a lo largo del tiempo conforme a mis necesidades");
  })
  document.querySelectorAll(".pausado").forEach(element => {
    element.setAttribute("title", "Proyecto pausado durante un tiempo indeterminado");
  })
}