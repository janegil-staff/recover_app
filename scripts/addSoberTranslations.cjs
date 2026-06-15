// scripts/addSoberTranslations.js

const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "../src/translations/index.js"
);

let content = fs.readFileSync(file, "utf8");

const translations = {
  en: "Sober",
  no: "Rusfri",
  da: "Rusfri",
  sv: "Nykter",
  fi: "Raitis",
  de: "Nüchtern",
  fr: "Sobre",
  es: "Sobrio",
  it: "Sobrio",
  pt: "Sóbrio",
  pl: "Trzeźwy",
  tr: "Ayık",
};

Object.entries(translations).forEach(([lang, value]) => {
  const regex = new RegExp(
    `(const\\s+${lang}\\s*=\\s*\\{)`,
    "m"
  );

  content = content.replace(
    regex,
    `$1\n  sober: "${value}",`
  );
});

fs.writeFileSync(file, content);

console.log("✅ Added sober translations");