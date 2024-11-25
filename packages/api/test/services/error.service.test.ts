import { FastifyReply } from 'fastify';
import WebSocket from 'ws';
import {
    handleServiceError,
    handleHookError,
    handleWebSocketError,
    handleHttpError,
} from '../../src/services/error.service';

describe('Error Handling Service', () => {
    /**
     * Mock for FastifyReply to capture responses.
     */
    let replyMock: Partial<FastifyReply>;

    beforeEach(() => {
        replyMock = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    /**
     * Test: Handle generic validation errors in `handleServiceError`.
     */
    it('should handle generic validation errors in handleServiceError', () => {
        const validationError = new Error('Validation Error: {"field":"Field is required"}');

        handleServiceError(validationError, replyMock as FastifyReply, 'Default error');

        expect(replyMock.code).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: { field: 'Field is required' } });
    });

    /**
     * Test: Handle unknown errors in `handleServiceError`.
     */
    it('should handle unknown errors in handleServiceError', () => {
        const unknownError = new Error('Some unexpected error');

        handleServiceError(unknownError, replyMock as FastifyReply, 'Default error');

        expect(replyMock.code).toHaveBeenCalledWith(500);
        expect(replyMock.send).toHaveBeenCalledWith({ error: 'Some unexpected error' });
    });

    /**
     * Test: Handle hook errors in `handleHookError`.
     */
    it('should handle hook errors in handleHookError', () => {
        const hookError = new Error('Forbidden');

        handleHookError(hookError, replyMock as FastifyReply);

        expect(replyMock.code).toHaveBeenCalledWith(403);
        expect(replyMock.send).toHaveBeenCalledWith({ error: 'Forbidden' });
    });

    /**
     * Test: Handle unknown errors in `handleHookError`.
     */
    it('should handle unknown errors in handleHookError', () => {
        handleHookError('Unknown error', replyMock as FastifyReply);

        expect(replyMock.code).toHaveBeenCalledWith(500);
        expect(replyMock.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
    });

    /**
     * Test: Handle HTTP errors in `handleHttpError`.
     */
    it('should handle HTTP errors in handleHttpError', () => {
        const httpError = new Error('Internal Server Error');

        handleHttpError(replyMock as FastifyReply, httpError);

        expect(replyMock.code).toHaveBeenCalledWith(500);
        expect(replyMock.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });

    /**
     * Test: Handle unknown HTTP errors in `handleHttpError`.
     */
    it('should handle unknown HTTP errors in handleHttpError', () => {
        handleHttpError(replyMock as FastifyReply, 'Unknown error');

        expect(replyMock.code).toHaveBeenCalledWith(500);
        expect(replyMock.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
