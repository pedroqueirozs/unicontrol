import Button from "../../components/Button";
import Header from "../../components/Header";

export default function Home() {
  return (
    <div className="max-w-7xl  mx-auto mt-20  h text-text_description">
      <Header page={"Bem vindo! xxxx"} />
      <div className="w-96 m-auto mb-5">
        <Button text={"Fazer upload de nova fatura "} />
      </div>
      <div className="border border-[#C2C2C2] w-full text-center min-h-96 m-auto ">
        <h1 className="text-[#1E2772]">Ultimas Faturas </h1>
      </div>
    </div>
  );
}
