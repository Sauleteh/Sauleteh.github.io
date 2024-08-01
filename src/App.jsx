import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Aboutme } from "./pages/Aboutme"
import { Projects } from "./pages/Projects"
import { Shop } from "./pages/Shop"
import { NoPage } from "./pages/NoPage"
import { NavigationBar } from "./components/NavigationBar.jsx"
import { FooterBar } from "./components/FooterBar.jsx"

export function App() {
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