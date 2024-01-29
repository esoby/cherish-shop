import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import * as yup from "yup";

const SignUpPage = () => {
  // 사용자 입력 값
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  // 비밀번호 input type 값
  const [pwdType, setPwdType] = useState("password");
  // 유효성 검사 에러 메세지
  const [emailErrMsg, setEmailErrMsg] = useState("");
  const [nameErrMsg, setNameErrMsg] = useState("");
  const [pwdErrMsg, setPwdErrMsg] = useState("");
  // 회원가입 버튼 disabled 여부
  const [btnChk, setBtnChk] = useState(true);

  const navigate = useNavigate();

  // schema for validation
  const requiredSchema = yup.object().shape({
    email: yup.string().required("Email is required"),
    name: yup.string().required("name is required"),
    password: yup.string().required("password is required"),
  });

  const regid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const regpw = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;

  const pwdSchema = yup
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(16, "비밀번호는 16자를 초과할 수 없습니다.")
    .matches(regpw, "비밀번호는 알파벳, 숫자, 특수문자를 모두 포함해야 합니다.");
  const emailSchema = yup.string().matches(regid, "이메일 형식이 올바르지 않습니다.");
  const nameSchema = yup.string().max(10, "닉네임은 10자를 초과할 수 없습니다.");

  // validation completed
  useEffect(() => {
    // switch signup button
    if (
      requiredSchema.isValidSync({ email, name, password }) &&
      nameSchema.isValidSync(name) &&
      emailSchema.isValidSync(email) &&
      pwdSchema.isValidSync(password)
    ) {
      setBtnChk(false);
    } else setBtnChk(true);
  }, [email, name, password]);

  // email validation
  useEffect(() => {
    if (email) {
      emailSchema
        .validate(email)
        .then(() => {
          setEmailErrMsg("");
        })
        .catch((error) => {
          setEmailErrMsg(error.message);
        });
    }
  }, [email]);

  // name validation
  useEffect(() => {
    if (name) {
      nameSchema
        .validate(name)
        .then(() => {
          setNameErrMsg("");
        })
        .catch((error) => {
          setNameErrMsg(error.message);
        });
    }
  }, [name]);

  // password validation
  useEffect(() => {
    if (password) {
      pwdSchema
        .validate(password)
        .then(() => {
          setPwdErrMsg("");
        })
        .catch((error) => {
          setPwdErrMsg(error.message);
        });
    }
  }, [password]);

  // input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = event;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "name") setName(value);
  };

  // password input type handler
  const pwdHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    pwdType == "password" ? setPwdType("text") : setPwdType("password");
  };

  // firebase signup
  const signUp = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (
      !(
        requiredSchema.isValidSync({ email, name, password }) &&
        nameSchema.isValidSync(name) &&
        emailSchema.isValidSync(email) &&
        pwdSchema.isValidSync(password)
      )
    )
      return;

    // 이메일 중복 확인
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return setEmailErrMsg("이미 사용 중인 이메일입니다.");

    try {
      // create firebase users
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser = {
        userId: userCredential.user.uid,
        email: email,
        isSeller: isSeller,
        nickname: name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const collectionRef = collection(db, "users");
      await addDoc(collectionRef, newUser);

      navigate("/");
    } catch (error: unknown) {
      const { code } = error as FirebaseError;
      switch (code) {
        case "auth/network-request-failed":
          alert("네트워크 연결에 실패하였습니다.");
          break;
        case "auth/internal-error":
          alert("잘못된 요청입니다.");
          break;
        default:
          alert("회원가입에 실패하였습니다.");
      }
    }
  };

  return (
    <div>
      <form className="flex flex-col items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Join us!
        </h2>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" placeholder="Email" value={email} onInput={onChange} />
          <small className="text-sm font-medium leading-none text-red-400">{emailErrMsg}</small>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input type="text" name="name" placeholder="Name" value={name} onChange={onChange} />
          <small className="text-sm font-medium leading-none text-red-400">{nameErrMsg}</small>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Password</Label>
          <div className="flex">
            <Input
              type={pwdType}
              name="password"
              placeholder="Password"
              value={password}
              onChange={onChange}
            />
            <Button variant="secondary" className="w-10 ml-1 px-2.5" onClick={pwdHandler}>
              {pwdType == "password" ? (
                <EyeOff className="text-slate-500" />
              ) : (
                <Eye className="text-slate-500" />
              )}
            </Button>
          </div>
          <small className="text-sm font-medium leading-none text-red-400">{pwdErrMsg}</small>
        </div>
        <div className="flex">
          <Checkbox name="isSeller" onCheckedChange={(checked) => setIsSeller(checked == true)} />
          <small className="ml-2 text-sm font-medium leading-none">
            판매를 위해 가입하시나요? 🤔
          </small>
        </div>
        <Button className="w-96" onClick={signUp} disabled={btnChk}>
          회원가입
        </Button>
      </form>
    </div>
  );
};

export default SignUpPage;
