import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { useNavigate } from "react-router-dom";

const SalesManagement = () => {
  const { user } = useAuth() || {};
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16 gap-5">
        <h1>Sale Page</h1>
      </div>
    </>
  );
};

export default SalesManagement;
