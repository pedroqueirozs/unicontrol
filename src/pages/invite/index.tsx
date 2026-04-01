import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { LockKeyhole, Mail, User } from "lucide-react";

import { auth, db } from "@/services/firebaseConfig";
import { UserRole } from "@/context/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { notify } from "@/utils/notify";

interface InviteData {
  companyId: string;
  role: UserRole;
  expiresAt: Timestamp;
  used: boolean;
}

type InviteFormData = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

const schema = yup.object({
  name: yup.string().required("*"),
  email: yup.string().email("Digite um e-mail válido").required("*"),
  password: yup.string().required("*").min(6, "Mínimo 6 caracteres"),
  confirm_password: yup
    .string()
    .required("*")
    .oneOf([yup.ref("password")], "As senhas devem ser iguais"),
});

export default function Invite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid" | "expired" | "used"
  >("loading");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({ resolver: yupResolver(schema) });

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      const inviteDoc = await getDoc(doc(db, "invites", token));

      if (!inviteDoc.exists()) {
        setTokenStatus("invalid");
        return;
      }

      const data = inviteDoc.data() as InviteData;

      if (data.used) {
        setTokenStatus("used");
        return;
      }

      if (data.expiresAt.toDate() < new Date()) {
        setTokenStatus("expired");
        return;
      }

      setInviteData(data);
      setTokenStatus("valid");
    }

    validateToken();
  }, [token]);

  async function onSubmit(formData: InviteFormData) {
    if (!inviteData || !token) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      await setDoc(doc(db, "users", user.uid), {
        companyId: inviteData.companyId,
        role: inviteData.role,
        name: formData.name,
        email: formData.email,
      });

      await updateDoc(doc(db, "invites", token), { used: true });

      notify.success("Cadastro realizado com sucesso! Faça login para continuar.");
      navigate("/");
    } catch {
      notify.error("Erro ao realizar cadastro. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (tokenStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Validando convite...</p>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <p className="text-lg font-semibold">Link de convite inválido.</p>
        <p className="text-sm text-gray-500">Solicite um novo convite ao administrador.</p>
      </div>
    );
  }

  if (tokenStatus === "used") {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <p className="text-lg font-semibold">Este convite já foi utilizado.</p>
        <p className="text-sm text-gray-500">Solicite um novo convite ao administrador.</p>
      </div>
    );
  }

  if (tokenStatus === "expired") {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <p className="text-lg font-semibold">Este convite expirou.</p>
        <p className="text-sm text-gray-500">Solicite um novo convite ao administrador.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-6">
      <h1 className="text-xl font-bold text-center mb-2">Criar sua conta</h1>
      <p className="text-sm text-center text-gray-500 mb-8">
        Você foi convidado como <strong>{inviteData?.role}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input
          id="name"
          type="text"
          placeholder="Seu nome completo"
          icon={<User />}
          labelName="Nome"
          labelId="name"
          {...register("name")}
          errorMessage={errors.name?.message}
        />
        <Input
          id="email"
          type="email"
          placeholder="exemplo@email.com"
          icon={<Mail />}
          labelName="E-mail"
          labelId="email"
          {...register("email")}
          errorMessage={errors.email?.message}
        />
        <Input
          id="password"
          type="password"
          placeholder="Crie uma senha"
          icon={<LockKeyhole />}
          labelName="Senha"
          labelId="password"
          {...register("password")}
          errorMessage={errors.password?.message}
        />
        <Input
          id="confirm_password"
          type="password"
          placeholder="Confirme sua senha"
          icon={<LockKeyhole />}
          labelName="Confirme sua senha"
          labelId="confirm_password"
          {...register("confirm_password")}
          errorMessage={errors.confirm_password?.message}
        />
        <Button
          isLoading={isLoading}
          type="submit"
          text="Criar conta"
          backgroundColor="#34D399"
        />
      </form>
    </div>
  );
}
