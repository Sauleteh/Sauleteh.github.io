import { createHashRouter, RouterProvider, Outlet } from "react-router-dom"
import { useEffect } from "react"
import { Aboutme } from "./pages/Aboutme"
import { Projects } from "./pages/Projects"
import { Shop } from "./pages/Shop"
import { NoPage } from "./pages/NoPage"
import { NavigationBar } from "./components/NavigationBar.jsx"
import { FooterBar } from "./components/FooterBar.jsx"
import { HtmlProject } from "./pages/HtmlProject.jsx"

export function App() {
    const Layout = () => { return (
        <>
        <NavigationBar/>
        <Outlet/>
        <FooterBar/>
        </>
    )};

    const htmlProjects = [{
        path: "/projects/tetris",
        element: <HtmlProject url="./projects/tetris/tetris.html"/>
    }, {
        path: "/projects/minesweeper",
        element: <HtmlProject url="./projects/minesweeper/minesweeper.html"/>
    }, {
        path: "/projects/circle-dodger",
        element: <HtmlProject url="./projects/circle-dodger/dodger.html"/>
    }, {
        path: "/projects/punteria",
        element: <HtmlProject url="./projects/punteria/punteria.html"/>
    }, {
        path: "/projects/calculadora-subnetting",
        element: <HtmlProject url="./projects/redes/redes.html"/>
    }, {
        path: "/projects/chess",
        element: <HtmlProject url="./projects/ajedrez/ajedrez.html"/>
    }, {
        path: "/projects/drivemad",
        element: <HtmlProject url="./projects/drivemad/drivemad.html"/>
    }];

    const router = createHashRouter([{
        path: "/",
        element: <Layout/>,
        children: [{
            path: "",
            element: <Projects/>
        }, {
            path: "/aboutme",
            element: <Aboutme/>
        }, {
            path: "/projects",
            element: <Projects/>
        }, {
            path: "/shop",
            element: <Shop/>
        }, {
            path: "*",
            element: <NoPage/>
        },
            ...htmlProjects
        ]
    }]);

    useEffect(() => {
        // Control del modo claro/oscuro
        if (localStorage.getItem("page_light_theme") === "true") document.documentElement.setAttribute("data-theme", "light");
        else document.documentElement.removeAttribute("data-theme");
    });
    
    return (
        <RouterProvider router={router} />
    )
}