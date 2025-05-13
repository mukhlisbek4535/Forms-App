import axios from "axios";
import dotenv from "dotenv";
import xmlrpc from "xmlrpc";

dotenv.config();

const FORMFIFY_API_TOKEN = "YOUR_API_TOKEN_HERE";
const FORMFIFY_ENDPOINT = `https://forms-app-vff5.onrender.com/odoo/templates/${FORMFIFY_API_TOKEN}`;

const ODOO_CONFIG = {
  url: "https://mukhlisbek.odoo.com",
  db: "mukhlisbek.odoo.com",
  username: "mukhlisbekkirgizov@gmail.com",
  password: "Kingsman4535",
};

const common = xmlrpc.createClient({
  url: `${ODOO_CONFIG.url}/xmlrpc/2/common`,
});
const object = xmlrpc.createClient({
  url: `${ODOO_CONFIG.url}/xmlrpc/2/object`,
});

async function main() {
  try {
    const uid = await new Promise((resolve, reject) => {
      common.methodCall(
        "authenticate",
        [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.password, {}],
        (err, value) => {
          if (err) return reject(err);
          resolve(value);
        }
      );
    });

    console.log("✅ Authenticated with Odoo as UID:", uid);

    const res = await axios.get(FORMFIFY_ENDPOINT);
    const templates = res.data;

    console.log(`✅ Retrieved ${templates.length} templates from Formify`);

    for (const template of templates) {
      const result = await new Promise((resolve, reject) => {
        object.methodCall(
          "execute_kw",
          [
            ODOO_CONFIG.db,
            uid,
            ODOO_CONFIG.password,
            "x_formsappcrm.form_templates",
            "create",
            [
              {
                template_title: template.templateTitle,
                author_name: template.author,
                number_of_responses: template.questions.length,
                date_imported: new Date().toISOString().slice(0, 10),
              },
            ],
          ],
          (err, value) => {
            if (err) return reject(err);
            resolve(value);
          }
        );
      });

      console.log(
        `📦 Imported template: ${template.templateTitle} (ID: ${result})`
      );
    }

    console.log("🎉 All data imported successfully.");
  } catch (err) {
    console.error("❌ Import failed:", err.message);
  }
}

main();
