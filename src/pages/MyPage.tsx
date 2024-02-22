import { Link } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";

const MyPage = () => {
  const { user, logout } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);

  return (
    <>
      <MetaTag title="마이페이지" description="개인 정보 및 거래 내역 관리 페이지입니다." />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
          {user?.nickname}님의 마이페이지
        </h2>
        <div className="w-[450px]">
          <Link to={`/profile/${user?.userId}`}>
            <p className="border-b p-4 text-lg font-semibold hover:bg-slate-100">개인 정보 수정</p>
          </Link>
          {user?.isSeller ? (
            <>
              <Link to={`/products/${user?.userId}`}>
                <p className="border-b p-4 text-lg font-semibold hover:bg-slate-100">
                  판매 상품 관리
                </p>
              </Link>
              <Link to={`/sales/${user?.userId}`}>
                <p className="border-b p-4 text-lg font-semibold hover:bg-slate-100">
                  판매 내역 관리
                </p>
              </Link>
            </>
          ) : (
            <Link to={`/orderhistory/${user?.userId}`}>
              <p className="border-b p-4 text-lg font-semibold hover:bg-slate-100">주문 내역</p>
            </Link>
          )}
          <button onClick={logout} className="w-full text-left">
            <p className="border-b p-4 text-lg font-semibold hover:bg-slate-100">로그아웃</p>
          </button>
        </div>
      </MainContainer>
    </>
  );
};

export default MyPage;
