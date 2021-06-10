import { Injectable, isDevMode } from '@angular/core';

export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  level: LogLevel = LogLevel.Off;
  logWithDate = true;

  // For future enhancement, constructor could be updated to take a config struct
  // and move providedIn to a forRoot call.
  constructor() {
    if (isDevMode()) {
      this.level = LogLevel.All;
    } else {
      this.level = LogLevel.Fatal;
    }
  }

  debug(msg: any) {
    this.log(msg, LogLevel.Debug);
  }

  info(msg: any) {
    this.log(msg, LogLevel.Info);
  }

  warn(msg: any) {
    this.log(msg, LogLevel.Warn);
  }

  error(msg: any) {
    this.log(msg, LogLevel.Error);
  }

  fatal(msg: any) {
    this.log(msg, LogLevel.Fatal);
  }

  log(msg: any, level: LogLevel = LogLevel.Debug) {
    if (this.shouldLog(level)) {
      const logEntry = {
        level: level,
        date: new Date(),
        message: msg
      };

      console.log(this.entryToString(logEntry));
    }
  }

  private entryToString(logEntry) {
    return `${LogLevel[logEntry.level]}${this.logWithDate ? ' : ' + logEntry.date : ''} : ${logEntry.message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if ((level >= this.level && level !== LogLevel.Off) ||
      this.level === LogLevel.All) {
      return true;
    }

    return false;
  }
}
