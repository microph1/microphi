import { Logger } from './logger';
import * as ts from 'typescript/lib/tsserverlibrary';
import { ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import { TemplateContext, TemplateLanguageService } from 'typescript-template-language-service-decorator';

export class LanguageService implements TemplateLanguageService {


  constructor(private logger: Logger) {
    logger.log('constructing LanguageService');
  }

  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter
  ): ts.CompletionInfo {

    const line = context.text.split(/\n/g)[position.line];

    this.logger.log(line);

    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: [
        {
          name: line.slice(0, position.character),
          kind: '' as ScriptElementKind,
          kindModifiers: 'echo',
          sortText: 'echo'
        }
      ]
    };
  }
}
