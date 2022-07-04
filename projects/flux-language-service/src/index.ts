import * as ts from 'typescript/lib/tsserverlibrary';
import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import { LanguageService } from './lib/language.service';
import { Logger } from './lib/logger';

export = (mod: { typescript: typeof ts }) => {
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {

      const logger = new Logger(info);

      logger.log(`creating plugin`);

      return decorateWithTemplateLanguageService(
        mod.typescript,
        info.languageService,
        info.project,
        new LanguageService(logger),
        {
          tags: []
        });
    }
  };
};
