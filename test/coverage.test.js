const { promisify } = require('util');
const { readFile } = require("fs").promises;
const { resolve } = require("path");

const exec = promisify(require('child_process').exec);

let testResults;

beforeAll(async () =>{
  try {
    await exec(`npm run dev:test:coverage:json &> /dev/null`);
    
    const path = resolve("coverage", "coverage-summary.json");
    
    const lines = await readFile(path, "utf-8")
      .then((coverageTxt) => JSON.parse(coverageTxt))
      .then(({ total: { lines } }) => lines );
  
    testResults = {
      path,
      lines,
    };
  } catch (error) {
    throw new Error(`Não foi possível fazer a leitura da cobertura\n${error.message}`);
  }
});

afterAll(async () => {
  await exec('rm -rf coverage .nyc_output');
});

describe
  .each([
    [11,30,50], 
    [13,60,100],
    [14,90,150]
  ])
  (
    '%p - Crie testes de integração que cubram no mínimo %p porcento dos arquivos em src com um mínimo de %p linhas cobertas', 
    (_testId, percentage, coveredLines) => {
      it(
        'Será validado que o teste cobre o valor esperado',
        async () =>{
          expect(testResults.lines.skipped).toStrictEqual(0);
          expect(testResults.lines.pct).toBeGreaterThanOrEqual(percentage);
          expect(testResults.lines.covered).toBeGreaterThanOrEqual(coveredLines);
        }
      )
    }
  );
