import { Command } from 'commander';
import { loadConfig, showConfig } from './config';
import { getInputFiles, readInputFile, writeOutput, clearInputFolder, ensureDirectories } from './utils';
import { processRecords } from './hash';
import { verifyRecords, VerificationInput } from './decrypt';
import { KycRecord } from './types';

const program = new Command();

program
  .name('trusset-kyc')
  .description('KYC Merkle hashing tool for Trusset tokenization infrastructure')
  .version('2.0.0');

program
  .command('hash', { isDefault: true })
  .description('Hash KYC data from input folder')
  .option('--raw', 'Output without index column')
  .action((options) => {
    try {
      const config = loadConfig();
      ensureDirectories();
      const files = getInputFiles();

      if (files.length === 0) {
        console.log('No input files found. Place .json or .csv files in the /input folder.');
        return;
      }

      console.log(`Processing ${files.length} file(s)...`);
      const allRecords: KycRecord[] = [];
      for (const file of files) {
        console.log(`  Reading: ${file}`);
        const records = readInputFile(file);
        for (const r of records) allRecords.push(r);
      }

      console.log(`Found ${allRecords.length} record(s)`);
      if (allRecords.length === 0) {
        console.log('No records to process.');
        return;
      }

      const results = processRecords(allRecords, config, !!options.raw);
      const outputPath = writeOutput(results, config, options.raw ? '_raw' : '');

      console.log(`Output saved to: ${outputPath}`);
      console.log(`Generated ${results.length} KYC Merkle root(s)`);

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
  .description('Verify KYC Merkle hashes against original data')
  .action(() => {
    try {
      const config = loadConfig();
      ensureDirectories();
      const files = getInputFiles();

      if (files.length === 0) {
        console.log('No input files found. Place files with original fields and a kycHash column in /input.');
        return;
      }

      console.log(`Verifying ${files.length} file(s)...`);
      const allRecords: VerificationInput[] = [];
      for (const file of files) {
        console.log(`  Reading: ${file}`);
        const records = readInputFile(file) as VerificationInput[];
        for (const r of records) allRecords.push(r);
      }

      if (allRecords.length === 0) {
        console.log('No records to verify.');
        return;
      }

      const results = verifyRecords(allRecords, config);
      const valid = results.filter(r => r.isValid === 'valid').length;
      const invalid = results.length - valid;
      const outputPath = writeOutput(results, config, '_verification');

      console.log('');
      console.log('Verification Results:');
      console.log(`  Valid:   ${valid}`);
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
    try {
      showConfig();
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

ensureDirectories();
program.parse();