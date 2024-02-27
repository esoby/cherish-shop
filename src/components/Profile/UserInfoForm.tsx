import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { useForm } from "react-hook-form";
import { User } from "@/interfaces/User";

type UserInfoFormProps = {
  onSubmit: (data: { email: string; name: string }) => void;
  userData: User;
};

const UserInfoForm = ({ onSubmit, userData }: UserInfoFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; name: string }>({
    defaultValues: {
      email: userData.email,
      name: userData.nickname,
    },
  });

  const Regex = {
    name: /^[가-힣A-Za-z]{2,10}$/,
  };

  const nameRegister = register("name", {
    required: { value: true, message: "닉네임을 입력해주세요." },
    pattern: {
      value: Regex.name,
      message: "닉네임은 한글 혹은 알파벳으로 구성된 2-8자이어야 합니다.",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input value={userData.email} type="text" id="email" disabled readOnly />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">닉네임</Label>
        <Input {...nameRegister} type="text" id="name" placeholder="새로운 닉네임을 입력하세요." />
        {errors.name && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.name.message}
          </small>
        )}
      </div>
      {/* submit */}
      <Button className="w-full mt-2">수정하기</Button>
    </form>
  );
};

export default UserInfoForm;
