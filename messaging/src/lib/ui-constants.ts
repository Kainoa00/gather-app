export const MSG_STATUS_BADGE: Record<string, string> = {
  DELIVERED:  'bg-green-50 text-green-700',
  SENT:       'bg-blue-50 text-blue-700',
  SUPPRESSED: 'bg-red-50 text-red-700',
  QUEUED:     'bg-amber-50 text-amber-700',
  FAILED:     'bg-red-100 text-red-800',
}

export const MSG_STATUS_LABEL: Record<string, string> = {
  DELIVERED:  'Delivered',
  SENT:       'Sent',
  SUPPRESSED: 'No consent — suppressed',
  QUEUED:     'Queued',
  FAILED:     'Failed',
}

export const EVENT_DOT_COLOR: Record<string, string> = {
  ADMISSION:                'bg-blue-400',
  DISCHARGE:                'bg-gray-400',
  LAB_RESULT:               'bg-amber-400',
  MEDICATION_CHANGE:        'bg-red-400',
  PSYCHOTROPIC_MED_CONSENT: 'bg-purple-400',
  IMMUNIZATION:             'bg-teal-400',
  WEIGHT_CHANGE:            'bg-blue-300',
  ROOM_TRANSFER:            'bg-indigo-400',
  MANUAL:                   'bg-gray-300',
}

export const MSG_STATUS_TEXT_COLOR: Record<string, string> = {
  DELIVERED:  'text-green-600',
  SENT:       'text-blue-600',
  SUPPRESSED: 'text-red-500',
  QUEUED:     'text-amber-600',
  FAILED:     'text-red-600',
}

export const ONE_DAY_MS = 86_400_000
