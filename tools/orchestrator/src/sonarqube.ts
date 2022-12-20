import * as path from 'path';
import { ChildProcess, spawn, exec } from 'child_process';
const axios = require('axios').default;

const DEFAULT_FOLDER = path.join(__dirname, '..', 'test', 'cache', 'sonarqube-9.7.1.62043', 'bin', 'macosx-universal-64');
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 9000;
const CREATE_TOKEN_PATH = '/api/user_tokens/generate';
const CREATE_PROJECT_PATH = '/api/projects/create';
const IS_ANALYSIS_FINISHED_PATH = '/api/analysis_reports/is_queue_empty';
const GET_ISSUES_PATH = '/api/issues/search';
const DEFAULT_MAX_WAIT_MS = 60 * 1000;

const instance = axios.create({
  baseURL: `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
  auth: {
    username: 'admin',
    password: 'admin',
  },
});

/**
 * Start SonarQube instance and wait for it to be operational
 *
 * @param sqPath The path where SQ was downloaded and unzipped
 * @returns
 */
export async function startAndReady(sqPath: string = DEFAULT_FOLDER, maxWaitMs: number = DEFAULT_MAX_WAIT_MS) {
  const process = start(sqPath);
  await waitForStart(process, maxWaitMs);
  return process;
}

/**
 * Start SonarQube instance
 *
 * @param sqPath The path where SQ was downloaded and unzipped
 * @returns
 */
function start(sqPath: string = DEFAULT_FOLDER) {
  const pathToBin = getPathForPlatform(sqPath);
  return spawn(`${pathToBin}`, ['console'], {stdio: ['inherit', 'pipe', 'inherit']});
}

/**
 * Get the path to the SonarQube launcher based on the OS
 *
 * @param sqPath The path where SQ was downloaded and unzipped
 * @returns The path to the SQ launcher
 */
function getPathForPlatform(sqPath: string) {
  if (isWindows()) {
    return path.join(sqPath, 'bin', 'windows-x86-64', 'StartSonar.bat');
  }
  if (isMac()) {
    return path.join(sqPath, 'bin', 'macosx-universal-64', 'sonar.sh');
  }
  if (isLinux()) {
    return path.join(sqPath, 'bin', 'linux-x86-64', 'sonar.sh');
  }

  function isWindows() {
    return /^win/.test(process.platform);
  }
  function isMac() {
    return /^darwin/.test(process.platform);
  }
  function isLinux() {
    return /^linux/.test(process.platform);
  }
}

async function waitForStart(process: ChildProcess, maxWaitMs: number = DEFAULT_MAX_WAIT_MS) {
  const logs: string[] = [];
  let logsIndex = 0;
  process.stdout?.setEncoding('utf8');
  process.stdout?.on('data', data => {
    // print logs by node process
    console.log(data.toString());
    logs.push(data.toString());
  })

  const startWaitMs = Date.now();
  let isReady = false;
  while (! isReady) {
    try {
      if (isBeyondWaitingTime(startWaitMs, maxWaitMs)) {
        return console.log(`Waiting for server ready aborted because we have waited more than ${maxWaitMs} ms.`)
      }
      const [response] = await Promise.all([
        isApiReady(logs, logsIndex),
        sleep(),
      ]);
      isReady = response.isReady;
      logsIndex = response.readIndex;
    } catch (error: any) {
      await sleep();
    }
  }

  function isBeyondWaitingTime(startWaitMs: number, maxWaitMs: number) {
    return (Date.now() - startWaitMs) > maxWaitMs;
  }
}

async function isApiReady(logs: string[], startIndex: number): Promise<any> {
  const SQ_READY_LINE = 'SonarQube is operational';
  for (let i=startIndex; i<logs.length; i++) {
    if (logs[i].includes(SQ_READY_LINE)) {
      return { isReady: true };
    }
  }
  return { isReady: false, readIndex: logs.length };
}

/**
 * Stop SonarQube instance
 *
 * @param sqPath The path where SQ was downloaded and unzipped
 * @returns
 */
export function stop(sqPath: string = DEFAULT_FOLDER) {
  return exec(`java ${__dirname}/stop.java ${sqPath}`, undefined,  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

/**
 * Generate a 'GLOBAL_ANALYSIS_TOKEN' level token with a random name
 *
 * @returns the generated token
 */
export async function generateToken(): Promise<string> {
  const name = generateId();
  const response = await instance.post(CREATE_TOKEN_PATH, {}, {
    params: {
      name,
      type: 'GLOBAL_ANALYSIS_TOKEN',
    },
  })
  return response.data.token;
}

/**
 * Create a project with a random name/key (they're the same)
 *
 * @returns the project name/key
 */
export async function createProject(): Promise<string> {
  const project = generateId();
  const response =  await instance.post(CREATE_PROJECT_PATH, {}, {
    params: {
      name: project,
      project,
    }
  });
  return response.data.project.key;
}

export async function waitForAnalysisFinished(maxWaitMs: number = DEFAULT_MAX_WAIT_MS): Promise<void> {
    const startWaitMs = Date.now();
    let isFinished = false;
    while (! isFinished) {
      try {
        if (isBeyondWaitingTime(startWaitMs, maxWaitMs)) {
          return console.log(`Waiting for server ready aborted because we have waited more than ${maxWaitMs} ms.`)
        }
        [isFinished] = await Promise.all([
          isAnalysisFinished(),
          sleep(),
        ]);
      } catch (error: any) {
        await sleep();
      }
    }

    function isBeyondWaitingTime(startWaitMs: number, maxWaitMs: number) {
      return (Date.now() - startWaitMs) > maxWaitMs;
    }


  async function isAnalysisFinished(): Promise<boolean> {
    const response = await instance.get(IS_ANALYSIS_FINISHED_PATH);
    return response.data;
  }
}



/**
 * Fetch issues for a given projectKey
 *
 * @param projectKey
 * @returns the issues for this project
 */
export async function getIssues(projectKey: string): Promise<any> {
  const response =  await instance.get(GET_ISSUES_PATH, {
    params: {
      componentKeys: projectKey,
    },
  });
  return response.data.issues;
}

/**
 * Generate random alphanumeric string of given length (+1).
 * We append '1' at the end to ensure we have at least 1 number,
 * because it's required for the projectKey
 *
 * @param length
 * @returns the random string
 */
function generateId(length: number = 10): string {
  let result             = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  // ensure that there is at least 1 number
  return result + '1';
}

function sleep(timeMs: number = 2000) {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}
