import { defineConfig } from "cypress";
import * as admin from "firebase-admin";
import serviceAccount from "./cypress/firebase/serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5174/",
    setupNodeEvents(on, config) {
      on("task", {
        async deleteUserbyEmail(email: string) {
          try {
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().deleteUser(user.uid);
            return { success: true };
          } catch (error) {
            console.error("Erro ao remover usuário:", error);
            return { success: false, error: String(error) };
          }
        },
      });
      return config;
    },
  },
});
