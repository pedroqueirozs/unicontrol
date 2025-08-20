import { signOut } from "firebase/auth";
import Button from "@/components/Button";
import { auth } from "@/services/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Documents() {
  const navigate = useNavigate();
  function handleSignout() {
    signOut(auth);
    navigate("/");
  }
  return (
    <div className="mt-5 border text-text_description">
      <Button
        text={"Conteudo da pagina de DOCUMENTOS(logout)"}
        onClick={handleSignout}
      />
      <div className="w-96 m-auto mb-5">
        <Button text={"Fazer upload de nova fatura "} />
        <p>{auth?.currentUser?.displayName}</p>
      </div>
    </div>
  );
}
