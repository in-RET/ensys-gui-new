// eslint.config.js
import {defineConfig} from "eslint/config";
import * as eslint from "angular-eslint";
import * as tseslint from "angular-eslint";

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            semi: "error",
            "prefer-const": "error",
        },
    },
]);
