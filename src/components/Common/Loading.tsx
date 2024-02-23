import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="animate-spin flex w-screen justify-center mt-60">
      <Loader2 size={45} color="#787878" />
    </div>
  );
};

export default Loading;
