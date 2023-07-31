import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

window.onload = () => { // Adaptación de tamaño del título dependiendo de la longitud del texto
  const tamDefault = parseFloat(window.getComputedStyle(document.querySelector("p.titulo")).fontSize);

  document.querySelectorAll("p.titulo").forEach(element => {
    element.style.fontSize = (element.innerText.length <= 30 ? tamDefault : (tamDefault - ((element.innerText.length - 30) * 0.37))) + "px";
    console.log(element.innerText.length, window.getComputedStyle(element).fontSize);
  });
}