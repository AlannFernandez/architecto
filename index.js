#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 1 && (args[0] === '-v' || args[0] === '--version')) {
  console.log('architecto version 1.0.0');
  process.exit(0);
}

if (args.length === 1 && (args[0] === '--help')) {
  console.log("To start a new proyect structure exec: architecto start <microservices>");
  console.log();
  console.log('Different microservices approaches:');
  console.log('- Monolithic');
  console.log('- Microservices');
  console.log('- Serverless');
  process.exit(0);
}

if (args.length === 0 || args[0] !== 'start') {
  console.error('Unknown command. Use "architecto --help" for help.');
  process.exit(1);
}

if (args.length === 2) {
  const microserviceType = args[1];
  if (isValidMicroserviceType(microserviceType)) {
    askFolderNameAndCreateFolder(microserviceType);
  } else {
    console.error('Invalid microservice type. Use "architecto --help" for help.');
    process.exit(1);
  }
} else {
  console.error('Usage: architecto start <microserviceType>');
  process.exit(1);
}

function isValidMicroserviceType(type) {
  const validTypes = ['monolithic', 'microservices', 'serverless'];
  return validTypes.includes(type.toLowerCase());
}

function askFolderNameAndCreateFolder(microserviceType) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Enter folder name: ', (folderName) => {
    const folderPath = path.join(process.cwd(), folderName);

    fs.mkdir(folderPath, (err) => {
      if (err) {
        console.error(`Error creating folder ${folderName}:`, err);
        process.exit(1);
      }

      console.log(`Folder ${folderName} created.`);

      createMicroserviceStructure(folderPath, microserviceType);

      exec('npm init -y', { cwd: folderPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running 'npm init -y': ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Error running 'npm init -y': ${stderr}`);
          return;
        }
        console.log(`Created package.json in ${folderPath}`);
      });

      readline.close();
    });
  });
}

function createMicroserviceStructure(folderPath, microserviceType) {
  const structure = getStructureForMicroserviceType(microserviceType);

  createDirectories(folderPath, structure);
}

function getStructureForMicroserviceType(microserviceType) {
  switch (microserviceType.toLowerCase()) {
    case 'monolithic':
      return {
        'src': {
          'api': {
            'controllers': {},
            'models': {},
            'routes': {}
          },
          'config': {},
          'lib': {},
          'tests': {}
        }
      };
    case 'microservices':
      return {
        'services': {},
        'shared': {}
      };
    case 'serverless':
      return {
        'functions': {}
      };
    default:
      return {};
  }
}

function createDirectories(parentPath, structure) {
  for (const [directory, subStructure] of Object.entries(structure)) {
    const directoryPath = path.join(parentPath, directory);
    fs.mkdirSync(directoryPath);
    if (Object.keys(subStructure).length > 0) {
      createDirectories(directoryPath, subStructure);
    }
  }
}
