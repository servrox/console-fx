import { prepareStudioArtifact } from "./studio-artifact.mjs";

const { receipt, recoveryDirectory } = prepareStudioArtifact();
console.log(
  `Prepared ${receipt.files.length} static files for Vercel; ${receipt.scriptHashes} hashed inline scripts, ${receipt.cspBytes} CSP bytes. No deployment performed.`,
);
if (recoveryDirectory)
  console.log(`Previous candidate retained at ${recoveryDirectory}`);
