import { useAuth } from "@/AuthContext";

const SalesManagement = () => {
  const user = useAuth();

  return (
    <div>
      <h1>Sale Page</h1>
      <div>{user?.nickname}님 안녕하세요</div>
    </div>
  );
};

export default SalesManagement;
