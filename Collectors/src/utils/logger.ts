import * as bunyan from 'bunyan';

//Read the documentation in https://github.com/trentm/node-bunyan to know how to use it.

export const appLogger: bunyan = bunyan.createLogger({
    level: 'info',
    name: 'doitright-collectors',
    serializers: bunyan.stdSerializers,
    src: true,
    streams: [
        {
            type: 'rotating-file',
            path: './logs/doitright-scheduler.log', //TODO: Use log dir set in the settings file
            period: '1d',   // "ms" (milliseconds), "h" (hours), "d" (days), "w" (weeks), "m" (months), "y" (years)
            count: 5        // keep 15 back copies
        },
    ]
});

export function getLogger(colName: string) {
    return bunyan.createLogger({
        level: 'info',
        name: `doitright-collectors-${colName}`,
        serializers: bunyan.stdSerializers,
        src: true,
        streams: [
            {
                type: 'rotating-file',
                path: `./logs/doitright-collector-${colName}.log`, //TODO: Use log dir set in the settings file
                period: '1d',   // "ms" (milliseconds), "h" (hours), "d" (days), "w" (weeks), "m" (months), "y" (years)
                count: 5        // keep 15 back copies
            },
        ]
    });
}

function setLogLevel (logLevel: string) {
    appLogger.level(<bunyan.LogLevelString>logLevel);
    appLogger.info('Log level changed to [%s]', appLogger.level());
}

export function setLogLevelToDebug() {
	setLogLevel('trace');
}

export const installLogger: bunyan = bunyan.createLogger({
    level: 'info',
    name: 'doitright-collectors-install',
    serializers: bunyan.stdSerializers,
    src: true,
    streams: [
        {
            type: 'rotating-file',
            path: './logs/doitright-collectors-install.log',
            period: '1d',   // "ms" (milliseconds), "h" (hours), "d" (days), "w" (weeks), "m" (months), "y" (years)
            count: 5        // keep 5 back copies
        }
    ]
});

/* **************************************
 * Below is the draft code for new logger
 * It is tailored for ease of use in our scheduler and collectors
 * Scheduler and each collector will have its own logger
 * Scheduler needs to make sure there is exactly one service worker for each collector
 **************************************** */

export class MyLoggerService {
    private loggers: {[key:string]: MyLogger} = {};

    public getLogger = (colName?: string): MyLogger => {
        const name = colName ? colName : 'scheduler';
        if(! Object.keys(this.loggers).includes(name)) {
            this.loggers[name] = new MyLogger(name);
        }
        return this.loggers[name];
    }

}

export class MyLogger {
    private logger: bunyan;
    constructor(name: string) {
        this.logger = bunyan.createLogger({
            level: 'info',
            name: `doitright-${name}`,
            serializers: bunyan.stdSerializers,
            src: true,
            streams: [
                {
                    type: 'rotating-file',
                    path: `./logs/doitright-${name}.log`, //TODO: Use log dir set in the settings file
                    period: '1d',   // "ms" (milliseconds), "h" (hours), "d" (days), "w" (weeks), "m" (months), "y" (years)
                    count: 5        // keep 15 back copies
                },
            ]
        });
    }

    public enableDebugging = () => {
        this.logger.level(<bunyan.LogLevelString>'debug');
    }

    public disableDebugging = () => {
        this.logger.level(<bunyan.LogLevelString>'info');
    }

    public debug = (data: any) => {
        this.logger.debug(data);
    }
    
    public info = (data: any) => {
        this.logger.info(data);
    }

    public error = (data: any) => {
        this.logger.error(data);
    }
}

export const loggerService = new MyLoggerService();

