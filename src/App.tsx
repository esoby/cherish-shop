import "./App.css";
import AppRouter from "./routes/Router";
import { AuthProvider } from "./AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Router>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Router>
  );
};

export default App;
