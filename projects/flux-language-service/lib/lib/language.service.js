"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageService = void 0;
class LanguageService {
    constructor(logger) {
        this.logger = logger;
        logger.log('constructing LanguageService');
    }
    getCompletionsAtPosition(context, position) {
        const line = context.text.split(/\n/g)[position.line];
        this.logger.log(line);
        return {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: [
                {
                    name: line.slice(0, position.character),
                    kind: '',
                    kindModifiers: 'echo',
                    sortText: 'echo'
                }
            ]
        };
    }
}
exports.LanguageService = LanguageService;
//# sourceMappingURL=language.service.js.map