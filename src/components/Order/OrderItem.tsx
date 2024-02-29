import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Cart } from "@/interfaces/Cart";
import { Order } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { fetchSellerData } from "@/services/order/fetchRelatedData";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface OrderItemProps {
  order: Order | Cart;
  product: Product;
}
const OrderItem = ({ order, product }: OrderItemProps) => {
  const [sellerName, setSellerName] = useState("");

  useEffect(() => {
    if ("sellerId" in order) {
      fetchSellerData(order.sellerId).then((data) => {
        if (data) setSellerName(data?.nickname);
      });
    }
  }, [order]);

  return (
    <Card className="flex items-center p-3 pl-4">
      <img src={product.productImage[0]} className="w-20 h-20 object-cover" />
      <div className="ml-4">
        <Link to={`/productdetail/${product.id}`}>
          <CardTitle className="text-lg m-0 hover:text-slate-500">{product.productName}</CardTitle>
        </Link>
        <CardDescription className="m-0">{sellerName}</CardDescription>
        <CardDescription className="text-gray-700">
          가격 : {"productPrice" in order ? order.productPrice : product.productPrice}
        </CardDescription>
        <CardDescription className="text-gray-700">
          수량 : {"productQuantity" in order ? order.productQuantity : order.cartQuantity}
        </CardDescription>
      </div>
    </Card>
  );
};

export default OrderItem;
