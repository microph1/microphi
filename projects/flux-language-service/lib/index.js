"use strict";
const typescript_template_language_service_decorator_1 = require("typescript-template-language-service-decorator");
const language_service_1 = require("./lib/language.service");
const logger_1 = require("./lib/logger");
module.exports = (mod) => {
    return {
        create(info) {
            const logger = new logger_1.Logger(info);
            logger.log(`creating plugin`);
            return (0, typescript_template_language_service_decorator_1.decorateWithTemplateLanguageService)(mod.typescript, info.languageService, info.project, new language_service_1.LanguageService(logger), {
                tags: []
            });
        }
    };
};
//# sourceMappingURL=index.js.map