import { Navigate, useRoutes } from "react-router-dom";

import Home from "@/pages/Home";
import MyPage from "@/pages/MyPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { useAuth } from "@/AuthContext";
import SalesManagement from "@/pages/SalesManagement";

export default function Router() {
  // 사용자 인증 상태 체크
  const user = useAuth();
  const isSeller = user?.isSeller;

  // 라우팅 설정
  const routing = useRoutes([
    {
      path: "/",
      element: <Home />,
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
      path: "/mypage",
      element: user ? <MyPage /> : <Navigate to="/" />,
    },
    {
      path: "/sales",
      element: isSeller ? <SalesManagement /> : <Navigate to="/" />,
    },
    {
      path: "*",
      element: <Home />,
    },
  ]);

  return routing;
}
