export function getLambdaConfig<T>(): T {
    try {
        if (!process.env['CONFIG']) {
            throw new Error(`Missing 'CONFIG' environment variable`);
        }
        const config = JSON.parse(JSON.stringify(process.env['CONFIG']));
        return config as T;
    } catch (error) {
        throw new Error('Invalid configuration');
    }
}
