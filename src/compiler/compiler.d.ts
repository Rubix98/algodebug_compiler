export type CompilerRequest = {
    code: string;
    input: string;
    language: string;
};

//prettier-ignore
export type CompilerResponse = {
    success: true;
    output: string;
} | {
    success: false;
    error: string;
}
