import { signOut } from "firebase/auth";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { auth } from "../../services/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  function handleSignout() {
    signOut(auth);
    navigate("/");
  }
  return (
    <div className="max-w-xl  mx-auto mt-20  h text-text_description">
      <Header page={`Bem vindo! ${auth?.currentUser?.displayName}`} />
      <Button text={"Logout "} onClick={handleSignout} />
      <div className="w-96 m-auto mb-5">
        <Button text={"Fazer upload de nova fatura "} />

        <p>{auth?.currentUser?.displayName}</p>
      </div>
      <div className="border border-[#C2C2C2] w-full text-center min-h-96 m-auto ">
        <h1 className="text-[#1E2772]">Ultimas Faturas </h1>
      </div>
    </div>
  );
}
