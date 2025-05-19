import Button from "../../components/Button";
import Input from "../../components/Input";
import InputSelect from "../../components/InputSelect";

export default function Financial() {

  return (
    <div className="border border-color_info">
      <h2>Adicionar boletos</h2>
      <form action="#" className="flex-col">
        <div className="border grid grid-cols-3 gap-4 w-full ">
          <Input
            id="name"
            type="text"
            labelName="Nome do Recebedor"
            labelId="name"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="ticket_value"
            type="number"
            labelName="Valor do boleto"
            labelId="ticket_value"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="maturity"
            type="date"
            labelName="Vencimento"
            labelId="maturity"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="date_of_issue"
            type="date"
            labelName="Data da emissão"
            labelId="date_of_issue"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="printing_date"
            type="date"
            labelName="Data da impressão"
            labelId="printing_date"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />
          <InputSelect
            id="document"
            labelName="Documento/ Nota Fiscal"
            labelId="document" />
          <Input
            id="notes"
            type="text"
            labelName="Anotaçôes"
            labelId="notes"
          // {...register("user_email")}
          // errorsSpan={errors.user_email?.message}
          />

        </div>
        <div className="w-52 flex gap-4 border">
          <Button
            text={"Salvar"} />
          <Button
            backgroundColor="#F5F7FA"
            color="#555555"
            borderColor="#E0E0E0"
            text={"Limpar"} />
        </div>
      </form>
    </div>
  );
}
