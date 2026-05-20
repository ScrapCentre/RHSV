// VAHAN adapter barrel
// Real adapter is a stub until VAHAN approval lands (founder blocker #3).
// Mock adapter reads mode from ConfigSetting.mockConfig.services.vahan internally.
export type { VahanResult } from "./vahan.mock"
export { MockServiceError } from "./vahan.mock"
export { lookupVehicle } from "./vahan.mock"
