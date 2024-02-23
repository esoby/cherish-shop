import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderGroup } from "@/interfaces/Order";

const OrderGroupItem = ({ item }: { item: OrderGroup }) => {
  return (
    <Card className="flex items-center p-3 pl-4 hover:bg-slate-50">
      <img src={item.mainImageSrc} className="w-20 h-20 object-cover" />
      <div className="ml-4">
        <CardTitle className="text-lg m-0">주문 번호 : {item.orderGroupId}</CardTitle>
        <CardDescription className="text-gray-700 font-semibold">
          {item.mainProductName}
          {item.orderLength - 1 > 0 ? ` 외 ${item.orderLength - 1}` : ""}
        </CardDescription>
        <CardDescription className="text-gray-400">
          {item.orderCreatedAt.toDate().toString().split(" ").slice(0, 5).join(" ")}
        </CardDescription>
        <CardDescription className="text-gray-500">{item.orderStatus}</CardDescription>
      </div>
    </Card>
  );
};

export default OrderGroupItem;
