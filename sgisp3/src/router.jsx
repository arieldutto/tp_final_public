import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import PublicLayout from "./layouts/PublicLayout";
import AcercaDe from "./pages/AcercaDe";
import PublicHome from "./pages/PublicHome";
import RequireAuth from "./features/auth/RequireAuth";
import MainLayout from "./layouts/MainLayout";
import OntsListPage from "./features/onts/pages/OntsListPage";
import ClientesList from "./features/crm/pages/ClientesList";
import DashboardServer from "./features/server/pages/DashboardServer";
import AbonadosPage from "./features/crm/pages/AbonadoPages";

export const router = createBrowserRouter([
    //Rutas Publicas
    {
        path: "/",
        // layout el el elemento principal ya que dentro renderizaremos las otras paginas
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <PublicHome />
            },
        ]
    },
    //Rutas Privadas
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/home",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Home />,
                    }
                ]
            },
            {
                path: "/about",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <AcercaDe />
                    }
                ]
            },
            {
                path: "/ont_list",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <OntsListPage />
                    }
                ]
            },
            {
                path: "/clientes",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <ClientesList />
                    }
                ]
            },
            {
                path: "/dashboard",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardServer />
                    }
                ]
            },
            {
                path: "/clientescard",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <AbonadosPage />
                    }
                ]
            },

        ]
    },
])