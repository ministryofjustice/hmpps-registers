import page, { Page } from '../page'

const summaryValue = (key: string) => cy.get(`dt:contains("${key}")`).next()

const hospitalDetails = {
  hospitalId: () => summaryValue('Code'),
  hospitalName: () => summaryValue('Name'),
  description: () => summaryValue('Description'),
  active: () => summaryValue('Active'),
  inactiveDate: () => summaryValue('Date deactivated'),
  highSecurity: () => summaryValue('High security'),
  cjitCode: () => summaryValue('CJIT Code'),
  area: () => summaryValue('Area'),
  region: () => summaryValue('Region'),
  geographicalArea: () => summaryValue('Geographical area'),
  localAuthority: () => summaryValue('Local Authority'),
  payrollRegion: () => summaryValue('Payroll region'),
  address: () => summaryValue('Address'),
  phoneNumber: () => summaryValue('Number'),
  summaryKeys: () => cy.get('dt'),
}

const verifyOnPage = (hospitalName: string): typeof hospitalDetails & Page => page(hospitalName, hospitalDetails)

export default { verifyOnPage }
