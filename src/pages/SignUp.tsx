import MainContainer from "@/components/Common/MainContainer";
import MetaTag from "@/components/Common/SEOMetaTag";
import SignUpForm from "@/components/Sign/SignUpForm";

const SignUpPage = () => {
  return (
    <>
      <MetaTag
        title="회원가입"
        description="어서오세요! 여기는 세상에서 제일 귀여운 오픈 마켓 Cherish입니다! 귀여운 건 최고예요. 함께 해요!"
        url="/signup"
      />
      <MainContainer>
        <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">Join us!</h2>
        <div className="w-5/6 max-w-md flex flex-col items-center gap-4">
          <SignUpForm />
        </div>
      </MainContainer>
    </>
  );
};

export default SignUpPage;
