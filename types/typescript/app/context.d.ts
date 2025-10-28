import { AppConfig } from './config';
import { AirtableClient } from './airtable-client';
import { GovernanceService } from './governance';
import { ExceptionStore } from './exceptions';
import { Logger } from './logger';
export interface AppContext {
    config: AppConfig;
    logger: Logger;
    airtable: AirtableClient;
    governance: GovernanceService;
    exceptions: ExceptionStore;
}
