import { MinusCircle, PlusCircle } from "lucide-react";
import { TableRow, TableCell } from "../ui/table";
import { Cart } from "@/interfaces/Cart";
import { Product } from "@/interfaces/Product";
import { UseMutateFunction } from "react-query";

const CartTableRow = ({
  idx,
  cart,
  product,
  quantity,
  updateCartMutate,
  children,
}: {
  idx: number;
  cart: Cart;
  product: Product;
  quantity: number;
  updateCartMutate: UseMutateFunction<
    void,
    unknown,
    { cartId: string; newQuantity: number; cart: Cart; product: Product },
    unknown
  >;
  children: React.ReactNode;
}) => {
  if (!product) return <div></div>;
  return (
    <TableRow>
      <TableCell className="p-0">
        <img
          src={product.productImage[0]}
          alt={`cart item image ${idx}`}
          className="w-16 h-16 object-cover"
        />
      </TableCell>
      <TableCell className="font-medium">{product.productName}</TableCell>
      <TableCell className="flex">
        <button
          className="w-fit"
          onClick={() =>
            updateCartMutate({
              cartId: cart.id,
              newQuantity: cart.cartQuantity - 1,
              cart,
              product,
            })
          }
          tabIndex={-1}
        >
          <MinusCircle size={16} color="#9c9c9c" />
        </button>
        <p className="p-2">{quantity}</p>
        <button
          className="w-fit"
          onClick={() =>
            updateCartMutate({
              cartId: cart.id,
              newQuantity: cart.cartQuantity + 1,
              cart,
              product,
            })
          }
          tabIndex={-1}
        >
          <PlusCircle size={16} color="#9c9c9c" />
        </button>
      </TableCell>
      {product?.productQuantity ? (
        <TableCell className="text-right">{product.productPrice * cart.cartQuantity}원</TableCell>
      ) : (
        <TableCell className="text-right text-red-500">품절</TableCell>
      )}
      <TableCell>{children}</TableCell>
    </TableRow>
  );
};

export default CartTableRow;
