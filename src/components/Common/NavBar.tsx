import { useAuth } from "@/AuthContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Link } from "react-router-dom";
import CartContainer from "../Cart/CartContainer";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { db } from "@/firebase";
import { query, collection, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Cart } from "@/interfaces/Cart";
import { ShoppingCart } from "lucide-react";

const NavBar = () => {
  const { user } = useAuth() || {};

  const { fetchData: fetchCart } = useDataLoad<Cart>();

  // 현재 유저의 전체 장바구니 데이터 가져오기
  const { data: cartDatas } = useQuery(["allcartproduct"], () =>
    fetchCart(query(collection(db, "cart"), where("userId", "==", user?.userId)), null)
  );

  return (
    <NavigationMenu>
      <NavigationMenuList className="w-screen flex border-b p-7 fixed bg-white ">
        <NavigationMenuItem className="flex-grow h-">
          <Link to={"/"}>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">히커머스</h3>
          </Link>
        </NavigationMenuItem>
        {user &&
          (user?.isSeller ? (
            <NavigationMenuItem>
              <Link to={`/products/${user?.userId}`}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <p className="text-green-800">PRODUCT</p>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ) : (
            <>
              <NavigationMenuItem>
                <Link to={"/community"}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    COMMUNITY
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild className={navigationMenuTriggerStyle()}>
                    <p className="cursor-pointer relative">
                      <ShoppingCart />
                      <div className="w-4 h-4 bg-red-500 rounded-full text-[10px] flex justify-center items-center text-white absolute right-1 top-1">
                        {cartDatas?.data.length}
                      </div>
                    </p>
                  </SheetTrigger>
                  <CartContainer />
                </Sheet>
              </NavigationMenuItem>
            </>
          ))}
        {user ? (
          <NavigationMenuItem>
            <Link to={`/mypage/${user?.userId}`}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                MYPAGE
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <Link to={`/signin`}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                LOGIN
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavBar;
