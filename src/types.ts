export type validTypeOrError<T> = [true, T] | [false, unknown];

export type CompilerRequest = {
    code: string;
    input: string;
    language: string;
};

//prettier-ignore
export type CompilerResponse = {
    success: true;
    output: string;
    error?: string;
} | {
    success: false;
    error: string;
}
