import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "../ui/button";
import { useAlert } from "@/context/AlertContext";
import { useEffect, useRef } from "react";

const AlertUI = () => {
  const { showAlert, alertTitle, alertMessage, setAlert } = useAlert();
  const myRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showAlert && myRef.current) {
      myRef.current.focus();
    }
  }, [showAlert]);

  if (!showAlert) return null;

  return (
    <>
      <div
        onClick={() => setAlert(false, "", "")}
        className="w-screen h-screen fixed top-0 left-0 right-0 bottom-0 z-50 bg-black opacity-30"
      ></div>
      <Alert className="z-50 bg-slate-50 fixed left-1/4 w-1/2 -translate-x-1/2 top-16 animate-bounce">
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription>{alertMessage}</AlertDescription>
        <AlertDescription className="text-right">
          <Button
            ref={myRef}
            onKeyDown={(e) => (e.key === "Enter" ? setAlert(false, "", "") : "")}
            onClick={() => setAlert(false, "", "")}
          >
            확인
          </Button>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default AlertUI;
