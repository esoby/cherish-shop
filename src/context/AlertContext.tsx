import { createContext, useContext, useState } from "react";

type AlertContextProps = {
  showAlert: boolean;
  alertTitle: string;
  alertMessage: string;
  setAlert: (show: boolean, title: string, message: string) => void;
};

const defalutValue = {
  showAlert: false,
  alertTitle: "",
  alertMessage: "",
  setAlert: () => {},
};

export const AlertContext = createContext<AlertContextProps>(defalutValue);

export const AlertProvider = ({ children }: { children: any }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const setAlert = (show: boolean, title: string, message: string) => {
    setShowAlert(show);
    setAlertTitle(title);
    setAlertMessage(message);
  };

  return (
    <AlertContext.Provider value={{ showAlert, alertTitle, alertMessage, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
