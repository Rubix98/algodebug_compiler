# AlgoDebug Compiler API

Online compiler API in `Express.js` written in `typescript`. It was created primarily for AlgoDebug application usage. At the moment we only support C++, but we also plan to support C, C#, Java, Python and more.

This compiler is running on: http://srv16.mikr.us:40042 (work in progress)

AlgoDebug application: http://srv16.mikr.us:20232  
AlgoDebug repository: https://github.com/Rubix98/algodebug

## Api call

### POST `/compile`

#### Request

| Parameter  | Description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| "code"     | Code of the program.                                                    |
| "language" | Language that the program is written in (For C++ language it is "cpp"). |
| "input"    | Input data for standard input of the program.                           |

#### Response

| Parameter | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| "success" | `true` if the program was correctly compiled and run, `false` otherwise. |
| "output"  | Standard output of the program (if `success == true`).                   |
| "error"   | Error message. (if `success == false`).                                  |

## Environmental variables

`PORT` - what port to use to set up http server  
`ORIGINS` - origins to allow cross-origin requests separated by commas

If you want to change these values locally, you can override them in `.env.local` file.

## Running

To run compiler:  
`npm install`

then you have two options:

-   You can run this with `npm run dev` which will use `ts-node` to autocompile and run  
    OR
-   Compile to javascript yourself with `npm run build` and then you can use `npm start`  
    (note: you will need to recompile after introducing changes)

### Running application with docker

If you want you can run this compiler with docker-compose (it is recommended only for production) using this command:

`docker-compose up -d --build`
