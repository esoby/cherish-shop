import SignUpForm from "@/components/Sign/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="w-full flex flex-col items-center p-20 mt-16 ">
      <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">Join us!</h2>
      <div className="w-5/6 max-w-md flex flex-col items-center gap-4">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
