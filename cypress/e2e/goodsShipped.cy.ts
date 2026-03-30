import { UserFixture } from "../support/types";

describe("Testes de mercadorias enviadas", () => {
  let users: UserFixture;

  before(() => {
    cy.fixture("users.json").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.session("login", () => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit("/goods-shipped");
    cy.contains("Cadastrar nova +").click();
  });

  it("Deve mostrar erros nos campos obrigatórios ao tentar salvar sem preencher", () => {
    cy.contains("Salvar").click();
    cy.contains("span", "*").should("be.visible");
  });

  it("Deve ocultar previsão de entrega ao selecionar Retirada na Empresa", () => {
    cy.get("#carrier").select("Retirada na Empresa");
    cy.get("#delivery_forecast").should("not.exist");
  });

  it("Deve preencher automaticamente a data de entrega com a data de envio ao selecionar Retirada na Empresa", () => {
    cy.get("#carrier").select("Retirada na Empresa");
    cy.get("#shipping_date").type("2026-03-29");
    cy.get("#delivery_date").should("have.value", "2026-03-29");
  });

  it("Deve mostrar erro quando previsão de entrega for anterior à data de envio", () => {
    cy.get("#shipping_date").type("2026-03-29");
    cy.get("#delivery_forecast").type("2026-03-28");
    cy.contains("Salvar").click();
    cy.contains("Deve ser igual ou posterior à data de envio").should(
      "be.visible"
    );
  });

  it("Deve mostrar erro quando data de entrega for anterior à data de envio", () => {
    cy.get("#shipping_date").type("2026-03-29");
    cy.get("#delivery_date").type("2026-03-28");
    cy.contains("Salvar").click();
    cy.contains("Deve ser igual ou posterior à data de envio").should(
      "be.visible"
    );
  });

  it("Deve cadastrar uma mercadoria com sucesso", () => {
    cy.get("#name").type("Cliente Teste");
    cy.get("#document_number").type("NF-1234");
    cy.get("#city").type("São Paulo");
    cy.get("#uf").select("SP");
    cy.get("#carrier").select("Braspress");
    cy.get("#shipping_date").type("2026-03-29");
    cy.get("#delivery_forecast").type("2026-04-05");

    cy.contains("Salvar").click();
    cy.contains("Tem certeza que deseja cadastrar essa mercadoria?").should(
      "be.visible"
    );
    cy.contains("Confirmar").click();
    cy.contains("Cadastrado com sucesso!").should("be.visible");
  });

  it("Deve cadastrar uma retirada na empresa com sucesso", () => {
    cy.get("#name").type("Cliente Retirada");
    cy.get("#document_number").type("NF-5678");
    cy.get("#city").type("São Paulo");
    cy.get("#uf").select("SP");
    cy.get("#carrier").select("Retirada na Empresa");
    cy.get("#shipping_date").type("2026-03-29");

    cy.contains("Salvar").click();
    cy.contains("Tem certeza que deseja cadastrar essa mercadoria?").should(
      "be.visible"
    );
    cy.contains("Confirmar").click();
    cy.contains("Cadastrado com sucesso!").should("be.visible");
  });
});
