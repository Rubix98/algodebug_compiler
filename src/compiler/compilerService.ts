import { CompilerRequest, CompilerResponse, validTypeOrError } from "../types";
import { spawn } from "node:child_process";
import { isPromise } from "node:util/types";
import fs from "fs";

const DIR_NAME = "programs";
const FILE_NAME = "program";

// 256MB of unicode characters (or likely less depending on characters used)
const MAX_OUTPUT_LENGTH = 256 * 1024 * 1024 / 4;
const TIMEOUT = 10; // limit for execution time in seconds

const asyncTryCatchAssign = async <T>(promise: Promise<T> | (() => Promise<T>)): Promise<validTypeOrError<T>> => {
    try {
        if (isPromise(promise)) {
            return [true, await promise];
        } else {
            return [true, await promise()];
        }
    } catch (err) {
        return [false, err];
    }
};

const getErrorMessage = (data: unknown): string => {
    if (data instanceof Error) return data.message;
    else if (typeof data === "string") return data;
    else return "Unknown error";
};

export const compileAndExecute = async (request: CompilerRequest): Promise<CompilerResponse> => {
    const [okCreate, fileId] = await asyncTryCatchAssign(createProgramFile(request));

    if (!okCreate) {
        return {
            success: false,
            error: getErrorMessage(fileId),
        };
    }

    try {
        await compile(fileId);
    } catch (err) {
        await removeProgramFiles(fileId);

        return {
            success: false,
            error: getErrorMessage(err),
        };
    }

    const [okExecute, output] = await asyncTryCatchAssign(execute(fileId, request));
    await removeProgramFiles(fileId);

    if (!okExecute) {
        return {
            success: false,
            error: getErrorMessage(output),
        };
    } else {
        return {
            success: true,
            output: output,
        };
    }
};

const createProgramFile = async (request: CompilerRequest): Promise<number> => {
    let fileId = Math.round(Math.random() * 1000); // some random number from 0 to 1000

    fs.access(`./${DIR_NAME}`, fs.constants.F_OK, (err) => {
        if (err) {
            fs.mkdir(`./${DIR_NAME}`, (err) => {
                if (err) throw err;
            });
        }
    });

    fs.writeFile(`./${DIR_NAME}/${FILE_NAME}-${fileId}.cpp`, request.code, (err) => {
        if (err) throw err;
    });

    return fileId;
};

const compile = async (fileId: Number): Promise<void> => {
    let success = true;
    let errorMessage = "";

    return new Promise(async (resolve, reject) => {
        const [ok, compilationProcess] = await asyncTryCatchAssign(async () =>
            // prettier-ignore
            spawn("g++", [
                "-o",
                `./${DIR_NAME}/${FILE_NAME}-${fileId}`,
                `./${DIR_NAME}/${FILE_NAME}-${fileId}.cpp`
            ])
        );

        if (!ok) {
            reject(getErrorMessage(compilationProcess));
            return;
        }

        try {
            compilationProcess.stderr.on("data", (data) => {
                success = false;
                errorMessage += data.toString();
            });

            compilationProcess.on("exit", () => {
                if (success) resolve();
                else reject(errorMessage);
            });

            setTimeout(() => {
                reject(`Error: Compilation timed Out. Your code took too long to compile, over ${TIMEOUT} seconds.`);
                compilationProcess.kill();
            }, TIMEOUT * 1000);
        } catch (error) {
            reject("Error: Unexpected error during program compilation: " + getErrorMessage(error));
        }
    });
};

const execute = async (fileId: number, request: CompilerRequest): Promise<string> => {
    let success = true;
    let outputMessage = "";
    let errorMessage = "";

    return new Promise(async (resolve, reject) => {
        const [ok, executionProcess] = await asyncTryCatchAssign(async () =>
            spawn(`./${DIR_NAME}/${FILE_NAME}-${fileId}`, [])
        );

        if (!ok) {
            reject(getErrorMessage(executionProcess));
            return;
        }

        try {
            executionProcess.stdout.on("data", (data) => {
                outputMessage += data.toString();

                if (outputMessage.length > MAX_OUTPUT_LENGTH) {
                    success = false;
                    console.log(new Blob([outputMessage]).size);
                    errorMessage += `Error: Output size limit exceeded. Your program output exceeded the limit of ${MAX_OUTPUT_LENGTH} characters.`;
                    executionProcess.kill();
                }
            });

            executionProcess.stderr.on("data", (data) => {
                success = false;
                errorMessage += data.toString();
            });

            executionProcess.on("exit", () => {
                if (success) resolve(outputMessage);
                else reject(errorMessage);
            });

            setTimeout(() => {
                reject(`Error: Execution timed Out. Your code took too long to execute, over ${TIMEOUT} seconds.`);
                executionProcess.kill();
            }, TIMEOUT * 1000);

            executionProcess.stdin.write(request.input);
            executionProcess.stdin.end();
        } catch (error) {
            reject("Error: Unexpected error during program execution: " + getErrorMessage(error));
        }
    });
};

const removeProgramFiles = async (fileId: number) => {
    const path = `./${DIR_NAME}/${FILE_NAME}-${fileId}`;

    const codePath = `${path}.cpp`;
    const exePath = `${path}`;

    fs.access(codePath, fs.constants.F_OK, (err) => {
        if (err) return;
        fs.unlink(codePath, (_err) => {});
    });

    fs.access(exePath, fs.constants.F_OK, (err) => {
        if (err) return;
        fs.unlink(exePath, (_err) => {});
    });
};
