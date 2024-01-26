import { useAuth } from "@/AuthContext";

const Home = () => {
  const user = useAuth();

  return (
    <div>
      <h1>Home Page</h1>
      <div>{user?.nickname}님 안녕하세요</div>
    </div>
  );
};

export default Home;
