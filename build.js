#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwind = require("tailwindcss");
const { Command } = require("commander");
const pkg = require("./package.json");
const filename = "tailwind";

const main = () => {
  const program = new Command();
  program
    .version(pkg.version)
    .option(
      "-o, --output <path>",
      "output file",
      path.join(__dirname, `dist/${filename}.css`)
    )
    .option(
      "-s, --source <path>",
      "tailwind src css",
      path.join(__dirname, `${filename}.css`)
    )
    .option(
      "-c, --config <path>",
      "tailwind config file path",
      path.join(__dirname, "tailwind.config.js")
    );

  program.parse(process.argv);
  // console.log("program", program);

  const options = program.opts();
  build(options).catch((e) => {
    throw e;
  });
};
const build = async (options) => {
  return new Promise((resolve, reject) => {
    const args = process.argv.slice(2);
    const config = options.config;
    const inputFile = options.source;
    const outputFile = options.output;

    fs.readFile(inputFile, (err, css) => {
      if (err) reject(err);

      postcss([tailwind(config), require("./removeUnsupported")])
        .process(css, {
          from: inputFile,
          to: outputFile,
          map: { inline: false },
        })
        .then((result) => {
          fs.writeFileSync(outputFile, result.css);
          if (result.map) {
            fs.writeFileSync(`${outputFile}.map`, result.map.toString());
          }
          return result;
        })
        .then((result) => {
          console.log("Built success.");
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
};

main();
