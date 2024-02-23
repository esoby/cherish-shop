import "./App.css";
import AppRouter from "./routes/Router";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";
import Alert from "./components/Common/AlertUI";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Router>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AlertProvider>
            <AuthProvider>
              <Alert />
              <AppRouter />
            </AuthProvider>
          </AlertProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Router>
  );
};

export default App;
