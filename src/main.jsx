import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.jsx'
import './css/pages/index.css'

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
  const defaultSize = parseFloat(getComputedStyle(document.querySelector(":root")).getPropertyValue("--titleSize"));

  document.querySelectorAll(".project-title").forEach(element => {
    element.style.fontSize = (element.innerText.length <= 30 ? defaultSize : (defaultSize - ((element.innerText.length - 30) * 0.37))) + "px";
  });
}

function addTooltip() { // Adición de tooltips a los estados de los proyectos
  document.querySelectorAll(".new").forEach(element => {
    element.setAttribute("title", "Proyecto recientemente agregado");
  })
  document.querySelectorAll(".progress").forEach(element => {
    element.setAttribute("title", "Proyecto que sigue en continuo desarrollo");
  })
  document.querySelectorAll(".pending").forEach(element => {
    element.setAttribute("title", "Proyecto que actualmente no funciona de forma correcta");
  })
  document.querySelectorAll(".intermittent").forEach(element => {
    element.setAttribute("title", "Proyecto con un desarrollo casual a lo largo del tiempo conforme a mis necesidades");
  })
  document.querySelectorAll(".paused").forEach(element => {
    element.setAttribute("title", "Proyecto pausado durante un tiempo indeterminado");
  })
}