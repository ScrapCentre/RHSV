// WhatsApp adapter barrel
import * as real from "./aisensy"
import * as mock from "./aisensy.mock"

const useReal = !!process.env.AISENSY_API_KEY
const adapter = useReal ? real : mock

export const sendTemplate = adapter.sendTemplate
export const sendDocument = adapter.sendDocument
export type { SendTemplateArgs } from "./aisensy"
