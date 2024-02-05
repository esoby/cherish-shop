import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16">
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
        <button onClick={logout}>👉🏻 로그아웃</button>
      </div>
    </>
  );
};

export default MyPage;
