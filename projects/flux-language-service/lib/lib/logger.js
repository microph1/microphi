"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(info) {
        this.info = info;
    }
    log(msg) {
        this.info.project.projectService.logger.info(`[@flux]: ${JSON.stringify(msg)}`);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map