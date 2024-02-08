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
    <NavigationMenu className="left-0 top-0 fixed">
      <NavigationMenuList className="w-screen flex border-b pl-10 pr-6 py-4 bg-white ">
        <NavigationMenuItem className="flex-grow h-">
          <Link to={"/"}>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">히커머스</h3>
          </Link>
        </NavigationMenuItem>
        {user &&
          (user?.isSeller ? (
            <NavigationMenuItem>
              <NavigationMenuLink
                href={`/products/${user?.userId}`}
                className={navigationMenuTriggerStyle()}
              >
                <p className="text-green-800">PRODUCT</p>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink href={`/community`} className={navigationMenuTriggerStyle()}>
                  COMMUNITY
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild className={navigationMenuTriggerStyle()}>
                    <div className="cursor-pointer relative pr-7">
                      <ShoppingCart />
                      <div className="w-4 h-4 bg-red-500 rounded-full text-[10px] flex justify-center items-center text-white absolute right-3.5 top-1">
                        {cartDatas?.data.length || 0}
                      </div>
                    </div>
                  </SheetTrigger>
                  <CartContainer />
                </Sheet>
              </NavigationMenuItem>
            </>
          ))}
        {user ? (
          <NavigationMenuItem>
            <NavigationMenuLink
              href={`/mypage/${user?.userId}`}
              className={navigationMenuTriggerStyle()}
            >
              MYPAGE
            </NavigationMenuLink>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <NavigationMenuLink href={`/signin`} className={navigationMenuTriggerStyle()}>
              LOGIN
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavBar;
