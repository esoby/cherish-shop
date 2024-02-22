import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import ProductImageInput from "@/components/Product/ProductImageInput";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { ProductFormFields } from "@/types/ProductFormFields";
import { useImageUpload } from "@/hooks/useImageUpload";

type ProductFormProps = {
  onSubmit: SubmitHandler<ProductFormFields>;
  data?: ProductFormFields;
  onImageDelete?: (urls: string[]) => Promise<void>;
};
const ProductForm = ({ onSubmit, data, onImageDelete }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ProductFormFields>({
    defaultValues: data || {
      productName: "",
      productPrice: 0,
      productQuantity: 1,
      productDescription: "",
      productCategory: "",
      productImage: [],
    },
  });

  const { imageURLs, setImageURLs, uploadImages } = useImageUpload();

  useEffect(() => {
    setValue("productImage", imageURLs);
  }, [imageURLs, setValue]);

  useEffect(() => {
    register("productImage", {
      required: { value: true, message: "상품 이미지를 추가해주세요." },
    });
  }, [register]);

  const productImage = watch("productImage");

  useEffect(() => {
    if (productImage) setImageURLs(productImage);
  }, []);

  // register
  const nameRegister = register("productName", {
    required: { value: true, message: "상품 이름을 입력해주세요." },
  });
  const priceRegister = register("productPrice", {
    required: { value: true, message: "상품 가격을 입력해주세요." },
    min: { value: 1, message: "상품 가격은 1 이상이어야 합니다." },
    pattern: { value: /^\d+$/, message: "상품 가격은 숫자여야 합니다." },
  });
  const quantityRegister = register("productQuantity", {
    required: { value: true, message: "상품 수량을 입력해주세요." },
    min: { value: 1, message: "상품 수량은 1 이상이어야 합니다." },
    pattern: { value: /^\d+$/, message: "상품 수량은 숫자여야 합니다." },
  });
  const descriptionRegister = register("productDescription", {
    required: { value: true, message: "상품 상세 설명을 입력해주세요." },
  });

  const handleProductDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (onImageDelete) onImageDelete(imageURLs);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      {/* image */}
      <div className="w-full grid items-center gap-2">
        <ProductImageInput
          imageURLs={imageURLs}
          setImageURLs={setImageURLs}
          uploadImages={uploadImages}
        />
        {errors.productImage && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productImage.message}
          </small>
        )}
      </div>
      {/* name */}
      <div className="w-full grid items-center gap-2">
        <Label htmlFor="productName">상품 이름</Label>
        <Input
          {...nameRegister}
          autoComplete="name"
          type="text"
          id="productName"
          placeholder="상품 이름을 입력하세요."
        />
        {errors.productName && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productName.message}
          </small>
        )}
      </div>
      {/* category */}
      <div className="w-full grid items-center gap-2">
        <p className="text-sm font-medium">상품 카테고리</p>
        <Controller
          control={control}
          name="productCategory"
          rules={{ required: { value: true, message: "상품 카테고리를 선택해주세요." } }}
          render={({ field }) => (
            <Select name="productCategory" onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOLL">인형</SelectItem>
                <SelectItem value="FIGURE">피규어</SelectItem>
                <SelectItem value="TOY">장난감</SelectItem>
                <SelectItem value="OBJECT">소품</SelectItem>
                <SelectItem value="ETC">기타</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.productCategory && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productCategory.message}
          </small>
        )}
      </div>
      {/* price */}
      <div className="w-full grid items-center gap-2">
        <Label htmlFor="productPrice">상품 가격</Label>
        <Input
          {...priceRegister}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          id="productPrice"
          placeholder="상품 가격을 입력하세요."
        />
        {errors.productPrice && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productPrice.message}
          </small>
        )}
      </div>
      {/* quantity */}
      <div className="w-full grid items-center gap-2">
        <Label htmlFor="productQuantity">상품 수량</Label>
        <Input
          {...quantityRegister}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          id="productQuantity"
          placeholder="상품 수량을 입력하세요."
        />
        {errors.productQuantity && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productQuantity.message}
          </small>
        )}
      </div>
      {/* description */}
      <div className="w-full grid items-center gap-2">
        <Label htmlFor="productDescription">상품 상세 설명</Label>
        <Textarea
          {...descriptionRegister}
          id="productDescription"
          placeholder="상품에 대한 상세한 설명을 입력해 주세요."
        />
        {errors.productDescription && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.productDescription.message}
          </small>
        )}
      </div>
      {/* submit */}
      <div className="w-full flex gap-2">
        <Button type="submit" className="flex-grow">
          저장
        </Button>
        {onImageDelete && (
          <Button variant="destructive" className="flex-grow" onClick={handleProductDelete}>
            상품 삭제
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
