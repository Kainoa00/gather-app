export { PCC_RESIDENTS, PCC_FACILITY_ID } from './residents';
export { generateAll, generateResidentData } from './generator';
export { applyScenarios } from './scenarios';
export type { GeneratedResidentData, GenerateOptions } from './generator';
export type { ScenarioMode } from './scenarios';

import { generateAll } from './generator';
import { applyScenarios } from './scenarios';
import type { GeneratedResidentData, GenerateOptions } from './generator';
import type { ScenarioMode } from './scenarios';

export function getMockData(options?: {
  seed?: number;
  scenarioMode?: ScenarioMode;
  referenceDate?: Date;
  includeTodayUpToNow?: boolean;
}): Map<string, GeneratedResidentData> {
  const referenceDate = options?.referenceDate ?? new Date();
  const scenarioMode: ScenarioMode =
    options?.scenarioMode ??
    (typeof process !== 'undefined' && process.env?.DEMO_SCENARIO === 'on' ? 'demo' : 'none');

  const generateOptions: GenerateOptions = {
    referenceDate,
    includeTodayUpToNow: options?.includeTodayUpToNow,
  };

  const raw = generateAll(options?.seed, generateOptions);
  return applyScenarios(raw, scenarioMode, referenceDate);
}
