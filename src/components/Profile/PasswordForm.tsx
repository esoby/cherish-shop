import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { useForm } from "react-hook-form";

type PasswordFormProps = {
  onSubmit: (data: { password: string; newPassword: string }, reset: () => void) => void;
};

const PasswordForm = ({ onSubmit }: PasswordFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ password: string; newPassword: string }>();

  const passwordRegister = register("password", {
    required: { value: true, message: "이메일을 입력해주세요." },
  });

  const newPasswordRegister = register("newPassword", {
    required: { value: true, message: "비밀번호를 입력해주세요." },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, reset))}
      className="w-full flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">기존 비밀번호</Label>
        <Input
          {...passwordRegister}
          type="password"
          id="password"
          placeholder="기존 비밀번호를 입력하세요."
        />
        {errors.password && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.password.message}
          </small>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">새 비밀번호</Label>
        <Input
          {...newPasswordRegister}
          type="password"
          id="newPassword"
          placeholder="새로운 비밀번호를 입력하세요."
        />
        {errors.newPassword && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.newPassword.message}
          </small>
        )}
      </div>
      {/* submit */}
      <Button className="w-full mt-2">변경하기</Button>
    </form>
  );
};

export default PasswordForm;
