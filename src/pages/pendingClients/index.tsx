import Button from "../../components/Button";
import Input from "../../components/Input";
import InputSelect from "../../components/InputSelect";

export default function PendingClients() {

    return (
        <div className="border border-color_info">
            <h2>Nova pendência de cliente</h2>
            <form action="#" className="flex-col">
                <div className="border grid grid-cols-3 gap-4 w-full ">
                    <Input
                        id="name"
                        type="text"
                        labelName="Nome do Cliente"
                        labelId="name"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <Input
                        id="document_number"
                        type="number"
                        labelName="Documento/Nota Fiscal"
                        labelId="document_number"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <Input
                        id="city"
                        type="text"
                        labelName="Cidade"
                        labelId="city"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <Input
                        id="registration date"
                        type="date"
                        labelName="Data do registro"
                        labelId="registration date"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <Input
                        id="closing_date"
                        type="date"
                        labelName="Data do encerramento/Resolução"
                        labelId="closing_date"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <InputSelect
                        id="situation"
                        labelName="Situação"
                        labelId="situation" />
                    <Input
                        id="delivery_date"
                        type="date"
                        labelName="Data da Entrega"
                        labelId="delivery_date"
                    // {...register("user_email")}
                    // errorsSpan={errors.user_email?.message}
                    />
                    <Input
                        id="notes"
                        type="text"
                        labelName="Anotações"
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
