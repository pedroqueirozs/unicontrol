-- Garante que não existam dois grupos de contas a pagar com o mesmo nome na
-- mesma empresa (ex: dois grupos "Fornecedores" cadastrados por engano).
-- Verificado antes de criar esta migration: não há nomes duplicados nos dados
-- atuais, então este índice único pode ser criado sem precisar corrigir dados
-- existentes antes.
CREATE UNIQUE INDEX "PayableGroup_companyId_name_key" ON "PayableGroup"("companyId", "name");
