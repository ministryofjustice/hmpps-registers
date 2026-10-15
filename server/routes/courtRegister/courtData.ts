export const courtTypes = [
  { value: 'CB', text: 'Combined Court (CB)' },
  { value: 'CC', text: 'Crown Court (CC)' },
  { value: 'CO', text: 'County Court (CO)' },
  { value: 'DCM', text: 'District Court Marshal (DCM)' },
  { value: 'GCM', text: 'General Court Marshal (GCM)' },
  { value: 'IMM', text: 'Immigration Court (IMM)' },
  { value: 'MC', text: 'Magistrates Court (MC)' },
  { value: 'OTHER', text: 'Courts Outside England and Wales (OTHER)' },
  { value: 'YC', text: 'Youth Court (YC)' },
]

export const allCourtTypes = [
  { code: 'CACD', description: 'Court of Appeal - Criminal Division' },
  { code: 'CB', description: 'Combined Court' },
  { code: 'CC', description: 'Crown Court' },
  { code: 'CO', description: 'County Court' },
  { code: 'DCM', description: 'District Court Marshal' },
  { code: 'GCM', description: 'General Court Marshal' },
  { code: 'IMM', description: 'Immigration Court' },
  { code: 'MC', description: 'Magistrates Court' },
  { code: 'OTHER', description: 'Courts Outside England and Wales' },
  { code: 'YC', description: 'Youth Court' },
  { code: 'UNK', description: 'Unknown' },
]

const data = { courtTypes, allCourtTypes }
export default data
