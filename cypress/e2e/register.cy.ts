import { NewUserFixture } from "../support/types";

describe("Testes de registro de usuário", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  let newUser: NewUserFixture;
  before(() => {
    cy.fixture("newUsers.json").then((data) => {
      newUser = data;
    });
  });

  it("Deve registrar um usuário com sucesso", () => {
    const user = newUser.newUserValid;

    cy.get("#name").type(user.name);
    cy.get("#user_email").type(user.email);
    cy.get("#confirm_email").type(user.confirm_email);
    cy.get("#password").type(user.password);
    cy.get("#confirm_password").type(user.confirm_password);

    cy.contains("Cadastrar").click();
    cy.contains("Cadastrado com sucesso!").should("be.visible");

    cy.task("deleteUserbyEmail", user.email).then((res) => {
      cy.log("Resultado da deleção:", JSON.stringify(res));
    });
  });

  it("Deve mostrar erro se os e-mails não forem iguais", () => {
    const user = newUser.newUserEmailDifferent;

    cy.get("#name").type(user.name);
    cy.get("#user_email").type(user.email);
    cy.get("#confirm_email").type(user.confirm_email);
    cy.get("#password").type(user.password);
    cy.get("#confirm_password").type(user.confirm_password);

    cy.contains("Cadastrar").click();
    cy.contains("Os emails não são iguais").should("be.visible");
  });

  it("Deve mostrar erro se as senhas não forem iguais", () => {
    const user = newUser.newUserPasswordDifferent;

    cy.get("#name").type(user.name);
    cy.get("#user_email").type(user.email);
    cy.get("#confirm_email").type(user.confirm_email);
    cy.get("#password").type(user.password);
    cy.get("#confirm_password").type(user.confirm_password);

    cy.contains("Cadastrar").click();
    cy.contains("As senhas devem ser iguais").should("be.visible");
  });

  it("Deve mostrar erro se a senha for menor que 6 caracteres", () => {
    const user = newUser.newUserPasswordShort;

    cy.get("#name").type(user.name);
    cy.get("#user_email").type(user.email);
    cy.get("#confirm_email").type(user.confirm_email);
    cy.get("#password").type(user.password);
    cy.get("#confirm_password").type(user.confirm_password);

    cy.contains("Cadastrar").click();
    cy.contains("Minimo 6 caracteres").should("be.visible");
  });

  it("Deve mostrar erros se os campos obrigatórios estiverem vazios", () => {
    cy.get("#name").clear();
    cy.get("#user_email").clear();
    cy.get("#confirm_email").clear();
    cy.get("#password").clear();
    cy.get("#confirm_password").clear();

    cy.contains("Cadastrar").click();

    cy.contains("*").should("be.visible");
  });

  it("Deve fechar a tela de registro e voltar para login", () => {
    cy.contains("Close").click();
    cy.url().should("eq", "http://localhost:5174/");
  });
});
