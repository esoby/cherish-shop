import { useAuth } from "@/AuthContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();
  const user = useAuth();

  // 로그아웃
  const signOutUser = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    // context 초기화 필요
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {}
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>👉🏻 뒤로가기</button>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        MyPage
      </h2>
      {user?.isSeller ? (
        <>
          <p>
            <Link to={`/products/${user?.userId}`}>👉🏻 상품 관리</Link>
          </p>
          <p>
            <Link to={`/sales/${user?.userId}`}>👉🏻 판매 내역</Link>
          </p>
        </>
      ) : (
        <p>👉🏻 구매내역</p>
      )}
      <button onClick={signOutUser}>👉🏻 로그아웃</button>
    </div>
  );
};

export default MyPage;
