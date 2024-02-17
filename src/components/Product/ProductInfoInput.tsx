import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface InputValue {
  productName: string;
  productCategory: string;
  productPrice: number;
  productQuantity: number;
  productDescription: string;
}
interface ProductFormProps {
  inputValues: InputValue;
  setInputValues: Dispatch<SetStateAction<InputValue>>;
}

const ProductInfoInput = ({ inputValues, setInputValues }: ProductFormProps) => {
  // Filtering non-numeric values
  const filterNumericInput = (value: string) => {
    let num = parseInt(value);
    if (isNaN(num) || num < 0) num = 0;
    return String(num);
  };

  // input value onchange
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, id: inputName } = event.target;
    const newValue =
      inputName === "productPrice" || inputName === "productQuantity"
        ? filterNumericInput(value)
        : value;
    setInputValues((prev) => ({ ...prev, [inputName]: newValue }));
  };

  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="productName">상품 이름</Label>
        <Input
          type="text"
          id="productName"
          placeholder="product name"
          value={inputValues.productName}
          onChange={onChange}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <p>상품 카테고리</p>
        <Select
          value={inputValues.productCategory}
          onValueChange={(value) => setInputValues((prev) => ({ ...prev, productCategory: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue id="productCategory" placeholder="선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category1">Category1</SelectItem>
            <SelectItem value="Category2">Category2</SelectItem>
            <SelectItem value="Category3">Category3</SelectItem>
            <SelectItem value="Category4">Category4</SelectItem>
            <SelectItem value="Category5">Category5</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="productPrice">상품 가격</Label>
        <Input
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          id="productPrice"
          placeholder="product price"
          value={inputValues.productPrice}
          onChange={onChange}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="productQuantity">상품 수량</Label>
        <Input
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          id="productQuantity"
          placeholder="product quantity"
          value={inputValues.productQuantity}
          onChange={onChange}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="productDescription">상품 상세 설명</Label>
        <Textarea
          id="productDescription"
          placeholder="상품에 대한 상세한 설명을 입력해 주세요."
          value={inputValues.productDescription}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default ProductInfoInput;
