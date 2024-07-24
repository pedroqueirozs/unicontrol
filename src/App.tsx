import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

function App() {
  return (
    <div className="mb-12">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
