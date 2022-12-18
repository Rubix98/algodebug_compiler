import { CompilerRequest, CompilerResponse } from './compiler';
import { spawn } from 'node:child_process';
import fs from "fs";

const DIR_NAME = "programs";
const FILE_NAME = "program";
const TIMEOUT = 10; // limit for execution time in seconds

export async function compileAndExecute(request: CompilerRequest): Promise<CompilerResponse> {
    try {
        let fileId = createProgramFile(request);
        await compile(fileId);
        let output = await execute(fileId, request);
        removeProgramFiles(fileId);

        return {
            success: true,
            output: output,
        }
    } catch (err) {
        let error = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            error: error
        }
    }
}

function createProgramFile(request: CompilerRequest): number {
    let fileId = Math.round(Math.random() * 1000); // some random number from 0 to 1000

    if (!fs.existsSync(`./${DIR_NAME}`)) {
        fs.mkdirSync(`./${DIR_NAME}`);
    }
    fs.writeFileSync(`./${DIR_NAME}/${FILE_NAME}-${fileId}.cpp`, request.code);
    return fileId;
}

async function compile(fileId: Number): Promise<void> {
    let success = true;
    let errorMessage = "";

    return new Promise((resolve, reject) => {
        try {
            const compileCommand = spawn("g++", [
                "-o",
                `./${DIR_NAME}/${FILE_NAME}-${fileId}`,
                `./${DIR_NAME}/${FILE_NAME}-${fileId}.cpp`,
            ]);
            
            compileCommand.stderr.on("data", (data) => {
                success = false;
                errorMessage += data.toString();
            });
    
            compileCommand.on("exit", () => {
                if (success) resolve()
                else reject(errorMessage);
            });

            setTimeout(() => {
                reject(`Error: Compilation timed Out. Your code took too long to compile, over ${TIMEOUT} seconds.`);
            }, TIMEOUT * 1000);
        } catch (error) {
            reject("Error: Unexpected error during compilation program.");
        }
    });
}

async function execute(fileId: number, request: CompilerRequest): Promise<string> {
    let success = true;
    let outputMessage = "";
    let errorMessage = "";

    return new Promise((resolve, reject) => {
        try {
            const executeCommand = spawn(`./${DIR_NAME}/${FILE_NAME}-${fileId}`, []);
            executeCommand.stdin.write(request.input);
            executeCommand.stdin.end();
            
            executeCommand.stdout.on("data", (data) => {
                outputMessage += data.toString();
            });

            executeCommand.stderr.on("data", (data) => {
                success = false;
                errorMessage += data.toString();
            });
    
            executeCommand.on("exit", () => {
                if (success) resolve(outputMessage)
                else reject(errorMessage);
            });

            setTimeout(() => {
                reject(`Error: Execution timed Out. Your code took too long to execute, over ${TIMEOUT} seconds.`);
            }, TIMEOUT * 1000);
        } catch (error) {
            reject("Error: Unexpected error during execution program.");
        }
    });
}

function removeProgramFiles(fileId: number): void {
    fs.unlinkSync(`./${DIR_NAME}/${FILE_NAME}-${fileId}`);
    fs.unlinkSync(`./${DIR_NAME}/${FILE_NAME}-${fileId}.cpp`);
}
