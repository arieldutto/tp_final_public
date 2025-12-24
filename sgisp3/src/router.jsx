// Configuracion de Ruteo con rutas Publicas y Rutas privadas
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import PublicLayout from "./layouts/PublicLayout";
import AcercaDe from "./pages/AcercaDe";
import PublicHome from "./pages/PublicHome";
import RequireAuth from "./features/auth/RequireAuth";
import MainLayout from "./layouts/MainLayout";
import OntsListPage from "./features/onts/pages/OntsListPage";
import BuscarOntPage from "./features/onts/pages/BuscarOntPage";
import ClientesList from "./features/crm/pages/ClientesList";
import DashboardServer from "./features/server/pages/DashboardServer";
import AbonadosPage from "./features/crm/pages/AbonadoPages";
import AbonadoDetallePage from "./features/crm/pages/AbonadoDetallePage";
import CrearAbonadoPage from "./features/crm/pages/CrearAbonadoPage";
import Error404 from "./pages/errors/Error404";
import Error500 from "./pages/errors/Error500";
import ErrorGeneric from "./pages/errors/ErrorGeneric";
import UnderConstruction from "./pages/UnderConstruction";
import OltListPage from "./features/olt/pages/OltListPage";
import OntProfilesPage from "./features/olt/pages/OntProfilesPage";

export const router = createBrowserRouter([
    //Rutas Publicas
    {
        path: "/",
        // layout el el elemento principal ya que dentro renderizaremos las otras paginas
        element: <PublicLayout />,
        errorElement: <ErrorGeneric />,
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
        errorElement: <ErrorGeneric />,
        children: [
            {
                path: "/home",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
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
                errorElement: <ErrorGeneric />,
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
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <OntsListPage />
                    }
                ]
            },
            {
                path: "/ont/buscar",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <BuscarOntPage />
                    }
                ]
            },
            {
                path: "/clientes",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <ClientesList />
                    },
                    {
                        path: "crear",
                        element: <CrearAbonadoPage />
                    }
                ]
            },
            {
                path: "/dashboard",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <DashboardServer />
                    }
                ]
            },
            {
                path: "/clientes/detalles/:id",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <AbonadoDetallePage />
                    }
                ]
            },
            {
                path: "/clientescard",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <AbonadosPage />
                    }
                ]
            },
            {
                path: "/olt",
                element: <MainLayout />,
                errorElement: <ErrorGeneric />,
                children: [
                    {
                        index: true,
                        element: <OltListPage />
                    },
                    {
                        path: ":oltId/perfiles",
                        element: <OntProfilesPage />
                    }
                ]
            },
            // Rutas de error específicas
            {
                path: "/error/500",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <Error500 />
                    }
                ]
            },
            // Ruta de ejemplo para página en construcción
            // Puedes usar este componente en cualquier ruta que esté en desarrollo
            {
                path: "/construccion",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <UnderConstruction />
                    }
                ]
            },
        ]
    },
    // Ruta catch-all para 404 (debe ir al final)
    {
        path: "*",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Error404 />
            }
        ]
    },
])