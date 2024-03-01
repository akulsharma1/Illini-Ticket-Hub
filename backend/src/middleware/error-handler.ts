import { Request, Response, NextFunction } from "express";
import { StatusCode } from "status-code-enum";

export class RouterError {
    statusCode: number;
    message: string;
    // NOTE: eslint is required because the goal of RouterError.data is to "return any necessary data" - mostly used for debugging purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any | undefined;
    catchErrorMessage?: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(statusCode?: number, message?: string, data?: any, catchErrorMessage?: any) {
        this.statusCode = statusCode ?? StatusCode.ServerErrorInternal;
        this.message = message ?? "InternalServerError";
        this.data = data;
        if (catchErrorMessage) {
            this.catchErrorMessage = catchErrorMessage;
            console.error(catchErrorMessage);
        } else {
            this.catchErrorMessage = "";
        }
    }
}

// _next is intentionally not used in this middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorHandler(error: RouterError, _req: Request, resp: Response, _next: NextFunction): Response {
    const statusCode: number = error.statusCode;
    const message: string = error.message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any | undefined = error.data;
    const catchErrorMessage: string | undefined = error.catchErrorMessage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData: { [key: string]: any } = {
        success: statusCode === StatusCode.SuccessOK,
        error: message,
    };
    if (data) {
        jsonData["data"] = data;
    }
    if (catchErrorMessage) {
        jsonData["error_message"] = catchErrorMessage;
    }

    return resp.status(statusCode).json(jsonData);
}
