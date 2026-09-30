import page, { Page } from '../page'

const summaryValue = (key: string) => cy.get(`dt:contains("${key}")`).next()

const approvedPremisesDetails = {
  approvedPremisesId: () => summaryValue('Code'),
  approvedPremisesName: () => summaryValue('Name'),
  description: () => summaryValue('Description'),
  contact: () => summaryValue('Contact'),
  active: () => summaryValue('Active'),
  inactiveDate: () => summaryValue('Date deactivated'),
  cjitCode: () => summaryValue('CJIT Code'),
  accessibleAccess: () => summaryValue('Accessible access'),
  area: () => summaryValue('Area'),
  region: () => summaryValue('Region'),
  geographicalArea: () => summaryValue('Geographical area'),
  localAuthority: () => summaryValue('Local Authority'),
  payrollRegion: () => summaryValue('Payroll region'),
  address: () => summaryValue('Address'),
  phoneNumber: () => summaryValue('Number'),
  emailAddress: () => summaryValue('Email'),
  summaryKeys: () => cy.get('dt'),
}

const verifyOnPage = (approvedPremisesName: string): typeof approvedPremisesDetails & Page =>
  page(approvedPremisesName, approvedPremisesDetails)

export default { verifyOnPage }
