#!/usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { compile } = require('json-schema-to-typescript');

function downloadABI(contractName) {
  const command = `near contract download-abi ${contractName} save-to-file ${contractName}.abi.json network-config mainnet now`;
 return exec(command)
}

async function convertAbiToTypescript(abiFilePath) {
  const tsFilePath = `./contract_types.ts`;
  try {
    const abiJson = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));
    const convertedFile = convertToDesiredFormat(abiJson)
    const types = await compile(convertedFile, 'ContractCallArgs', {
      additionalProperties: false, 
      declareExternallyReferenced: true, 
      unknownAny: false, 
    });
    fs.writeFileSync(tsFilePath, types, 'utf8')
    console.log("Types generated succesfully")
  } catch (error) {
    console.error(`Failed to generate TypeScript types: ${error}`);
  }
}

function convertToDesiredFormat(inputJson) {
  const outputJson= {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {},
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": false
  };

  const { body } = inputJson;
  const { functions, root_schema } = body;

  functions.forEach((func) => {
    const propName = func.name;
    const properties = {};
    const required = [];

    func.params?.args.forEach((arg) => {
      const { name, type_schema } = arg;
      properties[name] = convertTypeSchema(type_schema);
      if (type_schema?.required !== false) { 
        required.push(name);
      }
    });

    outputJson.properties[propName] = {
      type: "object",
      properties,
      required,
      additionalProperties: false
    };
  });

  if (root_schema && root_schema.definitions) {
    outputJson.definitions = { ...root_schema.definitions };
  }

  return outputJson;
}

function convertTypeSchema(typeSchema) {
  if (typeSchema.$ref) {
    return { "$ref": typeSchema.$ref };
  } else if (typeSchema.type) {
    switch (typeSchema.type) {
      case 'string':
      case 'boolean':
      case 'integer':
      case 'number':
        return { "type": typeSchema.type };
      case 'array':
        if (typeSchema.items) {
          return { "type": "array", "items": convertTypeSchema(typeSchema.items) };
        } else {
          return { "type": "array" };
        }
      case 'object':
        if (typeSchema.properties) {
          const properties = Object.keys(typeSchema.properties).reduce((acc, key) => {
            acc[key] = convertTypeSchema(typeSchema.properties[key]);
            return acc;
          }, {});
          return { "type": "object", "properties": properties };
        } else {
          return { "type": "object" };
        }
      default:
        return {};
    }
  } 
}


async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error('Please provide a contract name or path to an ABI file as an argument.');
    process.exit(1);
  }

  let abiFilePath;

  if (input.startsWith('./')) {
    abiFilePath = input;
  } else {
    await downloadABI(input)  
    abiFilePath = `./${input}.abi.json`;
    
  }

  await convertAbiToTypescript(abiFilePath);
}

main();

