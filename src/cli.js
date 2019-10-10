import arg from 'arg';
import path from 'path';
import fs from 'fs';
import xml2js from 'xml2js';
import AdmZip from 'adm-zip';

const taskWhiteList = [
  'USER_TASK',
  'SCRIPT_TASK',
  'MULTI_PROCESSING_TASK',
];

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--includeSub': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    includeSub: args['--includeSub'] || false,
    proc: args._[0],
    procBaseName: args._[0].replace('.bpmn', ''),
  };
}

function getRelatedTasks(mappingsFile) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    fs.readFile(mappingsFile, function(err, data) {
      parser.parseStringPromise(data)
        .then(function (result) {
          resolve(result.mappedProcess.mappedTask);
        })
        .catch(function (err) {
          console.error('Could not parse mappings file!');
          process.exit('Could not parse mappings file!');
        });
    });
  });
}

function getRelatedFiles(tasks) {
  let relatedFiles = {};
  return new Promise((resolve, reject) => {
    for (const task of tasks) {
      if (taskWhiteList.includes(task.$.type)) {
        if (!relatedFiles[task.$.type]) relatedFiles[task.$.type] = [];
        if (task.$.type === 'MULTI_PROCESSING_TASK') {
          relatedFiles[task.$.type].push(task.$.param1);
        } else {
          relatedFiles[task.$.type].push(task.$.refKey);
        }
      }
    }
    resolve(relatedFiles);
  });
}

function getRelatedForms(forms) {
  let relatedForms = [];
  return new Promise((resolve, reject) => {
    for (const form of forms) {
      const formPath = path.join(process.cwd(), '../forms/', `${form}.xml`);
      const formPermissionPath = path.join(process.cwd(), '../permissions/forms', `${form}_permissions.xml`);
      relatedForms.push(formPath);
      relatedForms.push(formPermissionPath);
    }
    resolve(relatedForms);
  });
}

function getRelatedScripts(scripts) {
  let relatedScripts = [];
  return new Promise((resolve, reject) => {
    for (const script of scripts) {
      const scriptPath = path.join(process.cwd(), '../scripts/', `${script}.xml`);
      relatedScripts.push(scriptPath);
    }
    resolve(relatedScripts);
  });
}

async function getProcFilePaths(procBaseName) {
  const proc = path.join(process.cwd(), `${procBaseName}.bpmn`);
  const permissions = path.join(process.cwd(), '../permissions/processes', `${procBaseName}_permissions.xml`);
  const mappingsFile = path.join(process.cwd(), '/mappings', `${procBaseName}.xml`);
  const tasks = await getRelatedTasks(mappingsFile);
  const files = await getRelatedFiles(tasks);
  let filePaths = await getRelatedForms(files.USER_TASK || []);
  filePaths = [...filePaths, ...await getRelatedScripts(files.SCRIPT_TASK || [])];
  filePaths = [...filePaths, permissions, mappingsFile, proc];
  const subProcs = files.MULTI_PROCESSING_TASK || false;
  return [filePaths, subProcs];
}

async function getSubProcFiles(subProcs) {
  let files = [];
  for (const sub of subProcs) {
    if (!sub) continue;
    let [filePaths, subProcs] = await getProcFilePaths(sub);
    files = [...files, ...filePaths];
    if (subProcs) {
      files = [...files, ...await getSubProcFiles(subProcs)];
    }
  }
  return files;
}

async function zipFile(filePaths, zipTargetPath, workingDir) {
  const zip = new AdmZip();
  const strip = workingDir.replace('processes', '');
  for (const file of filePaths) {
    // console.log({file});
    // console.log(file.replace(strip, ''));
    // console.log(path.dirname(file).split(path.sep).reverse());
    zip.addFile(
      `${file.replace(strip, '').replace(path.basename(file), '')}${path.basename(file)}`,
      fs.readFileSync(file),
      '',
      '0644');
  }
  zip.writeZip(zipTargetPath);
  return true;
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  const workingDir = process.cwd();
  if (!options.proc.endsWith('.bpmn')) {
    console.error('Not a valid BPMN file!');
    process.exit('Not a valid BPMN file!');
  }

  // // Get related files dir
  // const permissions = path.join(process.cwd(), '../permissions/processes', `${options.procBaseName}_permissions.xml`);
  // // console.log(permissions);
  // const proc = path.join(process.cwd(), options.proc);
  // const mappingsFile = path.join(process.cwd(), '/mappings', `${options.procBaseName}.xml`);
  // console.log(mappingsFile);
  //
  // //Get related tasks
  // const tasks = await getRelatedTasks(mappingsFile);
  // // console.log(tasks);
  //
  // //Get related filenames
  // const files = await getRelatedFiles(tasks);
  // console.log(files);
  //
  // // Get forms
  // let filePaths = await getRelatedForms(files.USER_TASK);
  //
  // // Get scripts
  // filePaths = [...filePaths, ...await getRelatedScripts(files.SCRIPT_TASK)];
  //
  // // Add proc, mapping and permission
  // filePaths = [...filePaths, permissions, mappingsFile, proc];

  let [filePaths, subProcs] = await getProcFilePaths(options.procBaseName);
  if (options.includeSub && subProcs) {
    // Sub procs!
    filePaths = [...filePaths, ...await getSubProcFiles(subProcs)];
  }

  // console.log(filePaths);

  // Zip files!!

  await zipFile(filePaths, `${workingDir}\\${options.procBaseName}.zip`, workingDir);


  // console.log(process.cwd());
  // console.log(options);
}
