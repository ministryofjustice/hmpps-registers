import page, { Page } from '../page'

const courtDetails = {
  courtId: () => cy.get('dt:contains("Code")').next(),
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
  address: () => cy.get('dt:contains("Address")').next(),
  emailAddress: () => cy.get('dt:contains("Email")').next(),
  phoneNumber: () => cy.get('dt:contains("Number")').next(),
  addEmailAddressLink: () => cy.get('[data-qa=add-email-address-link]'),
  updateEmailAddressLink: () => cy.get('[data-qa=update-email-address-link]'),
}

const verifyOnPage = (courtName: string): typeof courtDetails & Page =>
  page(`Court details for ${courtName}`, courtDetails)

export default { verifyOnPage }
