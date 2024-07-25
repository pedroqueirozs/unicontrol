/* import { useEffect } from "react"; */
import { getAuth } from "firebase/auth";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import {
  Route,
  BrowserRouter,
  Routes,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth";
import PublicRoute from "./pages/private";
import PrivateRoutes from "./pages/private";
import { AppRoutes } from "./routes";
/* import { addUsersAcess } from "./services/dataAcess/users"; */
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Login />,
//   },
//   {
//     path: "/register",
//     element: <Register />,
//   },
//   {
//     path: "/home",
//     element: <Home />,
//   },
// ]);

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
