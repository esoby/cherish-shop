import { useAuth } from "@/AuthContext";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const user = useAuth();

  useEffect(() => {}, [user]);
  return (
    <div>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Home
      </h2>
      {user ? (
        <p>
          <Link to={`/mypage/${user?.userId}`}>👉🏻 마이페이지</Link>
        </p>
      ) : (
        <p>
          <Link to={`/signin`}>👉🏻 로그인</Link>
        </p>
      )}
    </div>
  );
};

export default Home;
