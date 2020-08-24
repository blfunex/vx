// import OMT from "@surma/rollup-plugin-off-main-thread";
// import DSV from '@rollup/plugin-dsv';

import GLSL from "rollup-plugin-glsl";
import TypeScript from "@rollup/plugin-typescript";
import { terser as Terser } from "rollup-plugin-terser";

import Package from "./package.json";
import TSConfig from "./tsconfig.json";

import { join } from "path";

const external = Object.keys(Package.dependencies || {});

export default [
  {
    input: join(__dirname, "source/client/main.ts"),
    external,

    output: {
      file: join(__dirname, "public/bundle.js"),
      format: "esm",
      sourcemap: process.env.NODE_ENV != "production"
    },

    plugins: [
      GLSL({ include: "**/*.(frag|vert|fs|vs|glsl)" }),
      TypeScript(TSConfig.compilerOptions),
      Terser({
        compress: true,
        mangle: {
          properties: {
            regex: /^[_A-Z]/
          }
        },
        ecma: 5,
        keep_classnames: process.env.NODE_ENV != "production",
        keep_fnames: false,
        safari10: false,
        ie8: false
      })
    ]
  }
];
