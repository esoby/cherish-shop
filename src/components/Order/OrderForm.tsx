import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { useForm, SubmitHandler } from "react-hook-form";
import { OrderFormFields } from "@/types/OrderFormFields";

type OrderFormProps = {
  onSubmit: SubmitHandler<OrderFormFields>;
};
const OrderForm = ({ onSubmit }: OrderFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormFields>();

  const nameRegister = register("name", {
    required: { value: true, message: "이름을 입력해주세요." },
    pattern: {
      value: /^[가-힣a-zA-Z]+$/,
      message: "이름은 영문 대소문자나 한글만 사용할 수 있습니다.",
    },
    minLength: { value: 2, message: "이름은 최소 2자 이상이어야 합니다." },
    maxLength: { value: 20, message: "이름은 최대 20자까지 입력 가능합니다." },
  });

  const telRegister = register("tel", {
    required: { value: true, message: "전화번호를 입력해주세요." },
    pattern: {
      value: /^\d{10,11}$/,
      message: "전화번호는 10~11자리 숫자만 입력 가능합니다.",
    },
  });
  const emailRegister = register("email", {
    required: { value: true, message: "이메일을 입력해주세요." },
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      message: "올바른 이메일 형식을 입력해주세요.",
    },
  });

  const addressRegister = register("address", {
    required: { value: true, message: "주소를 입력해주세요." },
  });

  const zipcodeRegister = register("zipcode", {
    required: { value: true, message: "우편번호를 입력해주세요." },
    pattern: {
      value: /^\d{5}$/,
      message: "우편번호는 5자리 숫자만 입력 가능합니다.",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
      <div>
        <Label htmlFor="name">이름</Label>
        <Input {...nameRegister} type="text" id="name" placeholder="이름을 입력해주세요." />
        {errors.name && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.name.message}
          </small>
        )}
      </div>
      <div>
        <Label htmlFor="tel">전화번호</Label>
        <Input {...telRegister} type="tel" id="tel" placeholder="전화번호를 입력해주세요." />
        {errors.tel && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.tel.message}
          </small>
        )}
      </div>
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input {...emailRegister} type="email" id="email" placeholder="이메일을 입력해주세요." />
        {errors.email && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.email.message}
          </small>
        )}
      </div>
      <div>
        <Label htmlFor="address">주소</Label>
        <Input
          {...addressRegister}
          type="address"
          id="address"
          placeholder="주소를 입력해주세요."
        ></Input>
        {errors.address && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.address.message}
          </small>
        )}
      </div>
      <div>
        <Label htmlFor="zipcode">우편번호</Label>
        <Input
          {...zipcodeRegister}
          type="text"
          id="zipcode"
          placeholder="우편번호를 입력해주세요."
        ></Input>
        {errors.zipcode && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.zipcode.message}
          </small>
        )}
      </div>

      {/* submit */}
      <Button className="mt-5" type="submit">
        결제하기
      </Button>
    </form>
  );
};

export default OrderForm;
