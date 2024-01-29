import { useAuth } from "@/AuthContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();
  const user = useAuth();
  const logOut = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {}
  };

  return (
    <div>
      <h1>MyPage</h1>

      {user?.isSeller ? (
        <div>
          <Link to={`/sales/${user?.userId}`}>판매 내역</Link>
          <Link to={`/products/${user?.userId}`}>상품 관리</Link>
        </div>
      ) : (
        <div>구매내역</div>
      )}
      <button onClick={logOut}>로그아웃</button>
    </div>
  );
};

export default MyPage;
