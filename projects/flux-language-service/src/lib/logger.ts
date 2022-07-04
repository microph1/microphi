import { Logger as _Logger } from 'typescript-template-language-service-decorator';

export class Logger implements _Logger {
  constructor(
    private readonly info: ts.server.PluginCreateInfo
  ) { }

  public log(msg: string) {
    this.info.project.projectService.logger.info(`[@flux]: ${JSON.stringify(msg)}`);
  }
}
