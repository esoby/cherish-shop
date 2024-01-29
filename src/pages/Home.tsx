import { useAuth } from "@/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const user = useAuth();

  return (
    <div>
      <h1>Home Page</h1>
      <div>{user?.nickname}님 안녕하세요</div>
      <Link to={`/mypage/${user?.userId}`}>마이페이지</Link>
    </div>
  );
};

export default Home;
