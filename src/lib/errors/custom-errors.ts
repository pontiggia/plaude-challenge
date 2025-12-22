export abstract class AppError extends Error {
    abstract get statusCode(): number;

    abstract get code(): string;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): { code: string; message: string; name: string } {
        return {
            code: this.code,
            message: this.message,
            name: this.name,
        };
    }
}

export class SlackError extends AppError {
    get statusCode(): number {
        return 502;
    }

    get code(): string {
        return "SLACK_ERROR";
    }

    constructor(message: string, public readonly slackErrorCode?: string) {
        super(message);
    }
}

export class RedisError extends AppError {
    get statusCode(): number {
        return 503;
    }

    get code(): string {
        return "REDIS_ERROR";
    }
}

export class ValidationError extends AppError {
    get statusCode(): number {
        return 400;
    }

    get code(): string {
        return "VALIDATION_ERROR";
    }

    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}

export class AuthenticationError extends AppError {
    get statusCode(): number {
        return 401;
    }

    get code(): string {
        return "AUTHENTICATION_ERROR";
    }
}

export class NotConnectedError extends AppError {
    get statusCode(): number {
        return 401;
    }

    get code(): string {
        return "NOT_CONNECTED";
    }
}

export class InternalServerError extends AppError {
    get statusCode(): number {
        return 500;
    }

    get code(): string {
        return "INTERNAL_ERROR";
    }
}
