import { Navigate, useRoutes } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import MyPage from "@/pages/MyPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";

export default function Router() {
  // 사용자 인증 상태 체크
  function useAuth() {
    return true;
  }
  const user = useAuth();

  // 라우팅 설정
  const routing = useRoutes([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/signin",
      element: <SignInPage />,
    },
    {
      path: "/signup",
      element: <SignUpPage />,
    },
    {
      path: "/mypage",
      element: user ? <MyPage /> : <Navigate to="/" />,
    },
    {
      path: "*",
      element: <HomePage />,
    },
  ]);

  return routing;
}
