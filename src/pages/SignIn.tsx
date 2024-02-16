import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInForm from "@/components/Sign/SignInForm";
import { handleGoogleAuthRedirectResult, signInWithGoogle } from "@/services/firebase/auth";

const SignInPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleGoogleAuthRedirectResult().then((result) => {
      if (result) navigate("/");
    });
  }, []);

  return (
    <div className="w-full flex flex-col items-center p-20 mt-16 ">
      <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">Sign in</h2>
      <div className="w-4/5 max-w-96 flex flex-col items-center gap-4">
        <SignInForm />
        <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
          Google 계정으로 로그인
        </Button>
        <small className="text-sm font-medium leading-none">
          아직 계정이 없으신가요? 👉🏻{" "}
          <span className="hover:text-blue-800 cursor-pointer" onClick={() => navigate("/signup")}>
            가입하기
          </span>
        </small>
      </div>
    </div>
  );
};

export default SignInPage;
