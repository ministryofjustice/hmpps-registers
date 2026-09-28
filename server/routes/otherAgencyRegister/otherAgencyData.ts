export const otherAgencyTypes = [
  { value: 'AIRPORT', description: 'Airport' },
  { value: 'CHILDREN_SECURE_HOME', description: 'Children Secure Home' },
  { value: 'FOREIGN_NATIONAL_PRISON', description: 'Foreign National Prison' },
  { value: 'IMMIGRATION_DETENTION_CENTRE', description: 'Immigration Detention Centre' },
  { value: 'OUTSIDE', description: 'Outside' },
  { value: 'PECS', description: 'Prisoner Escort Custody Service' },
  { value: 'PROBATION_CRC', description: 'Probation Community Rehabilitation Company' },
  { value: 'PSYCHIATRIC_CARE', description: 'Psychiatric Care' },
  { value: 'SECURE_TRAINING_CENTRE', description: 'Secure Training Centre' },
  { value: 'VOLUNTARY_HOSTEL', description: 'Voluntary Hostel' },
  { value: 'YOT', description: 'Youth Offending Team' },
].map(type => ({ ...type, text: `${type.description} (${type.value})` }))

export const otherAgencyTypeDescription = (code: string): string =>
  otherAgencyTypes.find(type => type.value === code)?.description || code

const data = { otherAgencyTypes }
export default data
