import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { Aboutme } from "./pages/Aboutme"
import { Projects } from "./pages/Projects"
import { Shop } from "./pages/Shop"
import { NoPage } from "./pages/NoPage"
import { NavigationBar } from "./components/NavigationBar.jsx"
import { FooterBar } from "./components/FooterBar.jsx"

export function App() {
    useEffect(() => {
        // Control del modo claro/oscuro
        if (localStorage.getItem("page_light_theme") === "true") document.documentElement.setAttribute("data-theme", "light");
        else document.documentElement.removeAttribute("data-theme");
    });
    
    return (
        <>
        <NavigationBar/>
        <BrowserRouter>
            <Routes>
                <Route path="/aboutme" element={<Aboutme/>} />
                <Route path="/projects" element={<Projects/>} />
                <Route path="/shop" element={<Shop/>} />
                <Route path="*" element={<NoPage/>} />
            </Routes>
        </BrowserRouter>
        <FooterBar/>
        </>
    )
}