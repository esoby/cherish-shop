import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/services/firebase/auth";
import { SignInFormFields } from "@/types/AuthFormFields";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInFormFields>();

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<SignInFormFields> = async (data) => {
    await signIn(data).then((result) => {
      if (result) {
        navigate(-1);
        window.location.reload();
      }
    });
  };

  const watchEmail = watch("email");
  const watchPassword = watch("password");

  const emailRegister = register("email", {
    required: { value: true, message: "이메일을 입력해주세요." },
  });

  const passwordRegister = register("password", {
    required: { value: true, message: "비밀번호를 입력해주세요." },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      {/* email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input {...emailRegister} type="text" id="email" placeholder="이메일을 입력하세요." />
        {errors.email && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.email.message}
          </small>
        )}
      </div>
      {/* password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...passwordRegister}
          type="password"
          id="password"
          placeholder="비밀번호를 입력하세요."
        />
        {errors.password && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.password.message}
          </small>
        )}
      </div>
      {/* submit */}
      <Button type="submit" disabled={!watchEmail || !watchPassword}>
        로그인
      </Button>
    </form>
  );
};

export default LoginForm;
