import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SignUpFormFields } from "@/types/AuthFormFields";
import { signUp } from "@/services/firebase/auth";
import { Eye, EyeOff } from "lucide-react";

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    setError,
  } = useForm<SignUpFormFields>({ defaultValues: { isSeller: false } });

  // 비밀번호 input type 값
  const [pwdType, setPwdType] = useState("password");

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<SignUpFormFields> = async (data) => {
    await signUp(data).then((result) => {
      if (result === "complete") navigate("/");
      if (result === "duplicate email")
        setError("email", { message: "이미 사용 중인 이메일입니다." });
    });
  };

  const watchEmail = watch("email");
  const watchPassword = watch("password");

  const Regex = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    name: /^[가-힣A-Za-z]{2,10}$/,
    password: /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/,
  };

  const emailRegister = register("email", {
    required: { value: true, message: "이메일을 입력해주세요." },
    pattern: { value: Regex.email, message: "이메일 형식이 올바르지 않습니다." },
  });
  const nameRegister = register("name", {
    required: { value: true, message: "닉네임을 입력해주세요." },
    pattern: {
      value: Regex.name,
      message: "닉네임은 한글 혹은 알파벳으로 구성된 2-8자이어야 합니다.",
    },
  });

  const passwordRegister = register("password", {
    required: { value: true, message: "비밀번호를 입력해주세요." },
    pattern: {
      value: Regex.password,
      message: "비밀번호는 알파벳, 숫자, 특수문자를 포함하여 8-16자 이내로 작성해주세요.",
    },
  });

  const pwdCheckRegister = register("pwdCheck", {
    required: { value: true, message: "비밀번호 확인을 입력해주세요." },
    validate: (value) => value === getValues().password || "비밀번호가 일치하지 않습니다.",
  });

  const pwdHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    pwdType == "password" ? setPwdType("text") : setPwdType("password");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 mt-10">
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
      {/* name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input {...nameRegister} type="text" id="name" placeholder="닉네임을 입력하세요." />
        {errors.name && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.name.message}
          </small>
        )}
      </div>
      {/* password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="flex">
          <Input
            {...passwordRegister}
            type={pwdType}
            id="password"
            placeholder="비밀번호를 입력하세요."
          />{" "}
          <Button variant="secondary" className="w-10 ml-1 px-2.5" onClick={pwdHandler}>
            {pwdType == "password" ? (
              <EyeOff className="text-slate-400" />
            ) : (
              <Eye className="text-slate-400" />
            )}
          </Button>
        </div>
        {errors.password && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.password.message}
          </small>
        )}
      </div>
      {/* password check */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="pwdCheck">Password Check</Label>
        <Input
          {...pwdCheckRegister}
          type="password"
          id="pwdCheck"
          placeholder="비밀번호를 다시 입력하세요."
        />
        {errors.pwdCheck && (
          <small className="text-sm font-medium leading-none text-red-400">
            * {errors.pwdCheck.message}
          </small>
        )}
      </div>
      {/* isSeller */}
      <div className="flex">
        <input
          className="accent-slate-500"
          type="checkbox"
          id="isSeller"
          {...register("isSeller")}
        />
        <Label htmlFor="isSeller" className="ml-2 text-sm font-medium leading-none">
          판매를 위해 가입하시나요? 🤔
        </Label>
      </div>
      {/* submit */}
      <Button name="회원가입버튼" type="submit" disabled={!watchEmail || !watchPassword}>
        회원가입
      </Button>
    </form>
  );
};

export default SignUpForm;
