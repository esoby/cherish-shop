import { X } from "lucide-react";
import { ReactElement, createContext, useContext, useState } from "react";

const ModalContext = createContext({ open: false, toggle: (_: boolean) => {} });

// Provider return
const Modal = (props: { children: any }) => {
  const [open, toggle] = useState(false);

  return <ModalContext.Provider value={{ open, toggle }}>{props.children}</ModalContext.Provider>;
};

const Container = (props: { children: any }) => {
  const { open, toggle } = useContext(ModalContext);

  return (
    <>
      {open && (
        <>
          <div
            className="w-screen h-screen bg-black fixed top-0 left-0 z-30 opacity-70"
            onClick={() => toggle(!open)}
          ></div>
          <div className="w-3/5 absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden bg-white">
            {props.children}
          </div>
        </>
      )}
    </>
  );
};

const Header = (props: { children: ReactElement<any> }) => {
  const { open } = useContext(ModalContext);
  return (
    <>
      {open && (
        <div className="w-full h-14 flex items-center justify-end px-4">{props.children}</div>
      )}
    </>
  );
};
const Close = () => {
  const { open, toggle } = useContext(ModalContext);

  return (
    <div onClick={() => toggle(!open)}>
      <X strokeWidth={1} />
    </div>
  );
};

const Open = (props: { children: any }) => {
  const { open, toggle } = useContext(ModalContext);

  return <div onClick={() => toggle(!open)}>{props.children}</div>;
};

const Body = (props: { children: any }) => {
  const { open } = useContext(ModalContext);

  return open && <div className="w-full flex flex-col items-center px-14">{props.children}</div>;
};

const Footer = (props: { children: ReactElement<any> }) => {
  const { open } = useContext(ModalContext);
  return (
    open && <div className="w-full flex flex-col items-center px-14 pb-14">{props.children}</div>
  );
};

Modal.Header = Header;
Modal.Container = Container;
Modal.Close = Close;
Modal.Open = Open;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
