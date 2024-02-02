import Router from "./routes/Router";
import { AuthProvider } from "./AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { CartProvider } from "./contexts/CartContext";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
