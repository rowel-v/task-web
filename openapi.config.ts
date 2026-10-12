// openapi.config.ts
import { GeneratorConfig } from 'ng-openapi';

const config: GeneratorConfig = {
  input: 'http://localhost:8080/v3/api-docs',
  output: './src/app/api',
  options: {
    dateType: 'string',
    enumStyle: 'enum',
    modelFileStructure: 'per-type',
  },
};

export default config;
