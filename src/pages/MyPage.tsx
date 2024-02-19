import { Link } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";

const MyPage = () => {
  const { user, logout } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);

  return (
    <>
      <MetaTag title="마이페이지" description="개인 정보 및 거래 내역 관리 페이지입니다." />
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
          <p>
            <Link to={`/orderhistory/${user?.userId}`}>👉🏻 구매 내역</Link>
          </p>
        )}
        <button onClick={logout}>👉🏻 로그아웃</button>
      </div>
    </>
  );
};

export default MyPage;
