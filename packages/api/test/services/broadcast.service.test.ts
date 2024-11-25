import WebSocket from 'ws';
import { FastifyInstance } from 'fastify';
import { 
    validateWebSocketToken, 
    registerWebSocket, 
    removeWebSocket, 
    notifyUser, 
    notifyUsersByRole 
} from '../../src/services/broadcast.service';
import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';
import { ready } from '../../src';
import supertest from 'supertest';
import { password } from '../utils/utils';

const wsServerUrl = 'ws://localhost:3000/ws'; // URL for WebSocket connection
// Declare variables for supertest request and admin token
let request: supertest.SuperTest<supertest.Test>;
let adminToken: string = '';

jest.mock('@prisma/client');
const prisma = new PrismaClient();

const mockFastifyInstance = {
    jwt: {
        verify: jest.fn(),
    },
} as unknown as FastifyInstance;

describe('WebSocket Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: validateWebSocketToken should validate a valid token and return user ID.
     */
    it('should validate a valid WebSocket token and return user ID', () => {
        const token = 'valid_token';
        const decodedToken = { id: '123' };
        (mockFastifyInstance.jwt.verify as jest.Mock).mockReturnValue(decodedToken);

        const userId = validateWebSocketToken(mockFastifyInstance, token);

        expect(userId).toBe(decodedToken.id);
        expect(mockFastifyInstance.jwt.verify).toHaveBeenCalledWith(token);
    });

    /**
     * Test: validateWebSocketToken should throw an error for an invalid token.
     */
    it('should throw an error for an invalid token', () => {
        const token = 'invalid_token';
        (mockFastifyInstance.jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid Token');
        });

        expect(() => validateWebSocketToken(mockFastifyInstance, token)).toThrow('Invalid Token');
    });

    /**
     * Test: notifyUser should return false if the user is not connected.
     */
    it('should return false if the user is not connected', () => {
        const userId = '123';
        const message = 'Hello User!';

        const isNotified = notifyUser(userId, message);

        expect(isNotified).toBe(false);
    });
});
