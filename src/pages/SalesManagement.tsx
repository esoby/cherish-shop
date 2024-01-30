import { useAuth } from "@/AuthContext";
import { useNavigate } from "react-router-dom";

const SalesManagement = () => {
  const user = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)}>👉🏻 뒤로가기</button>
      <h1>Sale Page</h1>
    </div>
  );
};

export default SalesManagement;
