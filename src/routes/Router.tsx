import { Navigate, useRoutes } from "react-router-dom";

import Home from "@/pages/Home";
import MyPage from "@/pages/MyPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { useAuth } from "@/AuthContext";
import SalesManagement from "@/pages/SalesManagement";
import ProductsManagement from "@/pages/ProductsManagement";
import ProductUpload from "@/pages/ProductUpload";
import ProductUpdate from "@/pages/ProductUpdate";
import Category from "@/pages/Category";
import ProductDetail from "@/pages/ProductDetail";

export default function Router() {
  // 사용자 인증 상태 체크
  const { user } = useAuth() || {};
  const isSeller = user?.isSeller;

  // 라우팅 설정
  const routing = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/category/:cid",
      element: <Category />,
    },
    {
      path: "/productdetail/:pid",
      element: <ProductDetail />,
    },
    {
      path: "/signin",
      element: !user ? <SignIn /> : <Navigate to="/" />,
    },
    {
      path: "/signup",
      element: !user ? <SignUp /> : <Navigate to="/" />,
    },
    {
      path: "/mypage/:id",
      element: user ? <MyPage /> : <Navigate to="/" />,
    },
    // 판매자 계정용 페이지
    {
      path: "/sales/:id",
      element: isSeller ? <SalesManagement /> : <Navigate to="/" />,
    },
    {
      path: "/products/:uid",
      element: isSeller ? <ProductsManagement /> : <Navigate to="/" />,
    },
    {
      path: "/productupload/:uid",
      element: isSeller ? <ProductUpload /> : <Navigate to="/" />,
    },
    {
      path: "/productupdate/:uid/:pid",
      element: isSeller ? <ProductUpdate /> : <Navigate to="/" />,
    },
    {
      path: "*",
      element: <Home />,
    },
  ]);

  return routing;
}
