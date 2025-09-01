import 'whatwg-fetch';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const supportedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

export function createServer(handlerConfig) {
    const handlers = handlerConfig.map((config) => {
        const method = supportedMethods.includes(config.method) ? config.method : 'get';
        if (!rest[method]) {
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
        return rest[method](config.path, (req, res, ctx) => {
            return res(ctx.json(config.res(req, res, ctx)));
        });
    });

    const server = setupServer(...handlers);

    beforeAll(() => {
        server.listen();
    });

        afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    });

    return server;
}