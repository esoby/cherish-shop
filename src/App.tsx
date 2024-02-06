import AppRouter from "./routes/Router";
import { AuthProvider } from "./AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";

import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
