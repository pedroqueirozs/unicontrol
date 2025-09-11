import { AuthProvider } from "@/context/auth";

import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
