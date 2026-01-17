import { Command } from 'commander';
import { loadConfig, showConfig } from './config';
import { getInputFiles, readInputFile, writeOutput, clearInputFolder, ensureDirectories } from './utils';
import { processRecords } from './hash';
import { verifyRecords, VerificationInput } from './decrypt';

const program = new Command();

program
  .name('trusset-kyc')
  .description('KYC hashing tool for Trusset tokenization infrastructure')
  .version('1.0.0');

program
  .command('hash')
  .description('Hash KYC data from input folder')
  .option('--raw', 'Output without index column')
  .action((options) => {
    try {
      const config = loadConfig();
      const files = getInputFiles();

      if (files.length === 0) {
        console.log('No input files found. Place .json or .csv files in the /input folder.');
        return;
      }

      console.log(`Processing ${files.length} file(s)...`);
      let allRecords: any[] = [];

      for (const file of files) {
        console.log(`  Reading: ${file}`);
        const records = readInputFile(file);
        allRecords = allRecords.concat(records);
      }

      console.log(`Found ${allRecords.length} record(s)`);
      const results = processRecords(allRecords, config, options.raw);
      const outputPath = writeOutput(results, config, options.raw ? '_raw' : '');

      console.log(`Output saved to: ${outputPath}`);
      console.log(`Processed ${results.length} KYC hash(es)`);

      if (config.security.clearInputAfterProcessing) {
        clearInputFolder();
        console.log('Input folder cleared for security.');
      }
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('decrypt')
  .alias('verify')
  .description('Verify KYC hashes against original data')
  .action(() => {
    try {
      const config = loadConfig();
      const files = getInputFiles();

      if (files.length === 0) {
        console.log('No input files found. Place files with kycHash + original fields in /input.');
        return;
      }

      console.log(`Verifying ${files.length} file(s)...`);
      let allRecords: VerificationInput[] = [];

      for (const file of files) {
        console.log(`  Reading: ${file}`);
        const records = readInputFile(file) as VerificationInput[];
        allRecords = allRecords.concat(records);
      }

      const results = verifyRecords(allRecords, config);
      const valid = results.filter(r => r.isValid === 'valid').length;
      const invalid = results.filter(r => r.isValid === 'invalid').length;

      const outputPath = writeOutput(results as any, config, '_verification');
      
      console.log(`\nVerification Results:`);
      console.log(`  Valid: ${valid}`);
      console.log(`  Invalid: ${invalid}`);
      console.log(`Output saved to: ${outputPath}`);

      if (config.security.clearInputAfterProcessing) {
        clearInputFolder();
        console.log('Input folder cleared for security.');
      }
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('show')
  .description('Show current configuration and field mapping')
  .action(() => {
    showConfig();
  });

ensureDirectories();
program.parse();
