import page, { Page } from '../page'

const summaryValue = (key: string) => cy.get(`dt:contains("${key}")`).next()

const probationOfficeDetails = {
  probationOfficeId: () => summaryValue('Code'),
  probationOfficeName: () => summaryValue('Name'),
  description: () => summaryValue('Description'),
  contact: () => summaryValue('Contact'),
  active: () => summaryValue('Active'),
  inactiveDate: () => summaryValue('Date deactivated'),
  cjitCode: () => summaryValue('CJIT Code'),
  accessibleAccess: () => summaryValue('Accessible access'),
  area: () => summaryValue('Area'),
  subarea: () => summaryValue('Subarea'),
  region: () => summaryValue('Region'),
  geographicalArea: () => summaryValue('Geographical area'),
  localAuthority: () => summaryValue('Local Authority'),
  payrollRegion: () => summaryValue('Payroll region'),
  address: () => summaryValue('Address'),
  phoneNumber: () => summaryValue('Number'),
  emailAddress: () => summaryValue('Email'),
  summaryKeys: () => cy.get('dt'),
  link: (qa: string) => cy.get(`[data-qa=${qa}]`),
  confirmCreated: () => cy.get('[data-qa=confirm-created]'),
  confirmUpdated: () => cy.get('[data-qa=confirm-updated]'),
}

const verifyOnPage = (probationOfficeName: string): typeof probationOfficeDetails & Page =>
  page(probationOfficeName, probationOfficeDetails)

export default { verifyOnPage }
