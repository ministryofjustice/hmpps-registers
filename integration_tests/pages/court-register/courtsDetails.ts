import page, { Page } from '../page'

const courtDetails = {
  courtName: () => cy.get('dt:contains("Name")').next(),
  description: () => cy.get('dt:contains("Description")').next(),
  active: () => cy.get('dt:contains("Active")').next(),
  courtType: () => cy.get('dt:contains("Court Type")').next(),
  inactiveDate: () => cy.get('dt:contains("Date deactivated")').next(),
  accessibleAccess: () => cy.get('dt:contains("Accessible access")').next(),
  cjitCode: () => cy.get('dt:contains("CJIT Code")').next(),
  area: () => cy.get('dt:contains("Area")').next(),
  region: () => cy.get('dt:contains("Region")').next(),
  geographicalArea: () => cy.get('dt:contains("Geographical area")').next(),
  localAuthority: () => cy.get('dt:contains("Local Authority")').next(),
  payrollRegion: () => cy.get('dt:contains("Payroll region")').next(),
  address: () => cy.get('dt:contains("Details")').next(),
}

const verifyOnPage = (courtName: string): typeof courtDetails & Page => page(courtName, courtDetails)

export default { verifyOnPage }
