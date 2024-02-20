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

import logoImg from "@/assets/images/logo.svg";

const NavBar = () => {
  const { user } = useAuth() || {};

  const { fetchData: fetchCart } = useDataLoad<Cart>();

  // 현재 유저의 전체 장바구니 데이터 가져오기
  const { data: cartDatas } = useQuery(
    ["allcartproduct", user?.userId],
    () => fetchCart(query(collection(db, "cart"), where("userId", "==", user?.userId)), null),
    { enabled: !!user?.userId }
  );

  return (
    <NavigationMenu className="left-1/2 -translate-x-1/2 top-0 fixed">
      <NavigationMenuList className="w-screen flex border-b p-4 pl-6 pr-6 bg-white max-w-[1080px]">
        <NavigationMenuItem className="flex-grow">
          <Link to={"/"}>
            <img src={logoImg} alt="cherish logo image" className="w-36 -translate-y-2" />
          </Link>
        </NavigationMenuItem>
        {user &&
          (user?.isSeller ? (
            <NavigationMenuItem>
              <NavigationMenuLink
                href={`/products/${user?.userId}`}
                className={navigationMenuTriggerStyle()}
              >
                <p className="text-pink-700">PRODUCT CENTER</p>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <>
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild className={navigationMenuTriggerStyle()}>
                    <div className="cursor-pointer relative pr-7">
                      <ShoppingCart />
                      <div className="w-4 h-4 bg-pink-700 rounded-full text-[10px] flex justify-center items-center text-white absolute right-4 top-1">
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
