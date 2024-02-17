import { Navigate, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "@/AuthContext";

const Home = lazy(() => import("@/pages/Home"));
const MyPage = lazy(() => import("@/pages/MyPage"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const SalesManagement = lazy(() => import("@/pages/SalesManagement"));
const ProductsManagement = lazy(() => import("@/pages/ProductsManagement"));
const ProductUpload = lazy(() => import("@/pages/ProductUpload"));
const ProductUpdate = lazy(() => import("@/pages/ProductUpdate"));
const Category = lazy(() => import("@/pages/Category"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Order = lazy(() => import("@/pages/Order"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const OrderHistory = lazy(() => import("@/pages/OrderHistory"));

function SignInRoute() {
  const { user } = useAuth() || {};
  return !user ? <SignIn /> : <Navigate replace to="/" />;
}

function SignUpRoute() {
  const { user } = useAuth() || {};
  return !user ? <SignUp /> : <Navigate replace to="/" />;
}

function MyPageRoute() {
  const { user } = useAuth() || {};
  return user ? <MyPage /> : <Navigate replace to="/" />;
}

function SalesManagementRoute() {
  const { user } = useAuth() || {};
  return user?.isSeller ? <SalesManagement /> : <Navigate replace to="/" />;
}

function ProductsManagementRoute() {
  const { user } = useAuth() || {};
  return user?.isSeller ? <ProductsManagement /> : <Navigate replace to="/" />;
}

function ProductUploadRoute() {
  const { user } = useAuth() || {};
  return user?.isSeller ? <ProductUpload /> : <Navigate replace to="/" />;
}

function ProductUpdateRoute() {
  const { user } = useAuth() || {};
  return user?.isSeller ? <ProductUpdate /> : <Navigate replace to="/" />;
}
function OrderRoute() {
  const { user } = useAuth() || {};
  return user && !user?.isSeller ? <Order /> : <Navigate replace to="/" />;
}
function OrderHistoryRoute() {
  const { user } = useAuth() || {};
  return user && !user?.isSeller ? <OrderHistory /> : <Navigate replace to="/" />;
}
function OrderDetailRoute() {
  const { user } = useAuth() || {};
  return user && !user?.isSeller ? <OrderDetail /> : <Navigate replace to="/" />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<div className=""></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:cid" element={<Category />} />
        <Route path="/productdetail/:pid" element={<ProductDetail />} />
        <Route path="/signin" element={<SignInRoute />} />
        <Route path="/signup" element={<SignUpRoute />} />
        <Route path="/mypage/:uid" element={<MyPageRoute />} />
        <Route path="/sales/:uid" element={<SalesManagementRoute />} />
        <Route path="/products/:uid" element={<ProductsManagementRoute />} />
        <Route path="/productupload/:uid" element={<ProductUploadRoute />} />
        <Route path="/productupdate/:uid/:pid" element={<ProductUpdateRoute />} />
        <Route path="/order/:uid/:oid" element={<OrderRoute />} />
        <Route path="/orderhistory/:uid" element={<OrderHistoryRoute />} />
        <Route path="/orderdetail/:uid/:oid" element={<OrderDetailRoute />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
