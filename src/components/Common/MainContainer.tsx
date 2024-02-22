import { ReactNode } from "react";

const MainContainer = ({ children }: { children: ReactNode }) => {
  return <main className="w-full flex flex-col items-center gap-6 mt-12 px-8">{children}</main>;
};

export default MainContainer;
