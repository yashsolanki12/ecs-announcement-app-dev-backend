import { StatusCode } from "./status-code.js";
export class AppError extends Error {
    constructor(message, status = StatusCode.INTERNAL_SERVER_ERROR) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=app-error.js.map