// src/App.jsx (Updated)
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/hooks/useAuth";
import Navbar from "./layouts/MainNavbar";
import Routers from "./routes/Routers";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
         
          <Routers />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
