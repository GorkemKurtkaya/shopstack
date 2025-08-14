import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import fs from 'fs'
import path from 'path'

// logs klasörü
const logsDir = path.resolve(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true })
}

const consoleFormat = format.combine(
	format.colorize(),
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.printf(({ timestamp, level, message, stack }) => {
		return `[${timestamp}] ${level}: ${stack || message}`
	})
)

const fileJsonFormat = format.combine(
	format.timestamp(),
	format.errors({ stack: true }),
	format.json()
)

const logger = createLogger({
	level: 'info',
	transports: [
		new DailyRotateFile({
			dirname: logsDir,
			filename: 'app-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
			level: 'info',
			format: fileJsonFormat
		}),
		new DailyRotateFile({
			dirname: logsDir,
			filename: 'error-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '30d',
			level: 'error',
			format: fileJsonFormat
		})
	],
	exceptionHandlers: [
		new transports.File({ filename: path.join(logsDir, 'exceptions.log') })
	],
	rejectionHandlers: [
		new transports.File({ filename: path.join(logsDir, 'rejections.log') })
	]
})

export default logger