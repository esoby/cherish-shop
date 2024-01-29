import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { FirebaseError } from "firebase/app";
import * as yup from "yup";

const SignInPage = () => {
  // 사용자 입력 값
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 로그인 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");
  // 회원가입 버튼 disabled 여부
  const [btnChk, setBtnChk] = useState(true);
  const navigate = useNavigate();

  // schema for validation
  const requiredSchema = yup.object().shape({
    email: yup.string().required("Email is required"),
    password: yup.string().required("password is required"),
  });

  // validation completed
  useEffect(() => {
    // switch signin button
    if (requiredSchema.isValidSync({ email, password })) setBtnChk(false);
    else setBtnChk(true);
  }, [email, password]);

  // input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = event;
    setErrorMsg("");
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  // firebase signin
  const signIn = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error: unknown) {
      const { code } = error as FirebaseError;
      switch (code) {
        case "auth/user-not-found" || "auth/wrong-password":
        case "auth/email-already-in-use":
        case "auth/weak-password":
        case "auth/invalid-email":
        case "auth/invalid-credential":
          setErrorMsg("이메일 혹은 비밀번호가 일치하지 않습니다.");
          break;
        case "auth/network-request-failed":
          alert("네트워크 연결에 실패 하였습니다.");
          break;
        case "auth/internal-error":
          alert("잘못된 요청입니다.");
          break;
        default:
          alert("회원가입에 실패 하였습니다.");
      }
    }
  };

  return (
    <div>
      <form className="flex flex-col items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Sign in
        </h2>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" placeholder="Email" value={email} onChange={onChange} />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
          />
        </div>
        <small className="ml-2 text-sm font-medium leading-none text-red-400">{errorMsg}</small>
        <Button className="w-96" onClick={signIn} disabled={btnChk}>
          로그인
        </Button>
        <small className="ml-2 text-sm font-medium leading-none">
          아직 계정이 없으신가요? 👉🏻 <Link to="/signup">가입하기</Link>
        </small>
      </form>
    </div>
  );
};

export default SignInPage;
