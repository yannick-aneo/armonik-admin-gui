import { ApplicationRaw } from "@aneoconsultingfr/armonik.api.angular";

export type ApplicationColumn = keyof ApplicationRaw.AsObject

export interface ModifyColumnsDialogData {
  currentColumns: ApplicationColumn[]
  availableColumns: ApplicationColumn[]
}
