import Router from "./routes/Router";
import { AuthProvider } from "./AuthContext";

const App = () => (
  <>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </>
);

export default App;
