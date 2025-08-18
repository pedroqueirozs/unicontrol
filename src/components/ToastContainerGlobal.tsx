import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export function ToastContainerGlobal() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}
