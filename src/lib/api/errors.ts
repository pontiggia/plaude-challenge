import { NextResponse } from "next/server";
import { AppError, InternalServerError } from "@/lib/errors/custom-errors";
import { logger } from "@/lib/logger";

export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}

export function errorResponse(error: unknown): NextResponse<ErrorResponse> {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
        logger.warn(`[${error.code}] ${error.message}`, {
            code: error.code,
            stack: error.stack,
        });

        return NextResponse.json(
            {
                error: {
                    code: error.code,
                    message: error.message,
                },
                timestamp,
            },
            { status: error.statusCode }
        );
    }

    logger.error("Unhandled error in API route", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
    });

    const internalError = new InternalServerError(error instanceof Error ? error.message : "An unexpected error occurred");

    return NextResponse.json(
        {
            error: {
                code: internalError.code,
                message: internalError.message,
            },
            timestamp,
        },
        { status: internalError.statusCode }
    );
}

export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
    return NextResponse.json(data, { status });
}
