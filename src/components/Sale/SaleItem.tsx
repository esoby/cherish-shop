import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { useMutation, useQueryClient } from "react-query";
import { updateStoreData } from "@/services/firebase/firestore";
import { useAlert } from "@/context/AlertContext";
import { Order, OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { Dispatch, SetStateAction } from "react";

interface SaleItemProps {
  idx: number;
  sale: Order;
  product: Product;
  saleStatusList: string[];
  setSaleStatusList: Dispatch<SetStateAction<string[]>>;
}

const SaleItem = ({ idx, sale, product, saleStatusList, setSaleStatusList }: SaleItemProps) => {
  const queryClient = useQueryClient();

  const { setAlert } = useAlert();

  // 주문 상태 변경
  const updateOrderStatus = async ({ id, val }: { id: string; val: string }) => {
    await updateStoreData("order", id, { status: val });
    setAlert(true, "", "변경되었습니다.");
  };

  const mutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries("orderlist");
    },
  });

  return (
    <Card className="flex justify-between items-center p-4">
      <div className="ml-4">
        <CardTitle className="text-lg m-0">주문 번호 : {sale.orderGroupId}</CardTitle>
        <CardDescription className="text-gray-400">
          {sale.createdAt.toDate().toString().split(" ").slice(0, 5).join(" ")}
        </CardDescription>
        <CardDescription className="text-base text-gray-700 font-semibold hover:text-gray-400">
          <Link to={`/productdetail/${sale.productId}`}>[ {product.productName} ]</Link>
        </CardDescription>
        <CardDescription className="text-gray-700 font-semibold">
          수량 : {sale.productQuantity}
        </CardDescription>
        <CardDescription className="text-gray-700 font-semibold">
          결제 금액 : {sale.productPrice * sale.productQuantity}
        </CardDescription>
      </div>

      <div className="p-4 flex gap-2">
        <Select
          value={saleStatusList[idx]}
          onValueChange={(value) =>
            setSaleStatusList((prev) => {
              const newItems = [...prev];
              newItems[idx] = value;
              return newItems;
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={OrderStatus.OrderCompleted}>주문 완료</SelectItem>
            <SelectItem value={OrderStatus.ReadyForDelivery}>배송 대기</SelectItem>
            <SelectItem value={OrderStatus.DeliveryStarted}>배송 시작</SelectItem>
            <SelectItem value={OrderStatus.Cancelled}>주문 취소</SelectItem>
            <SelectItem value={OrderStatus.SaleCompleted}>판매 완료</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => mutation.mutate({ id: sale.id, val: saleStatusList[idx] })}
        >
          변경
        </Button>
      </div>
    </Card>
  );
};

export default SaleItem;
