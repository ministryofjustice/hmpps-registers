import page, { Page } from '../page'

const courtDetails = {
  courtName: () => cy.get('dt:contains("Name")').next(),
  description: () => cy.get('dt:contains("Description")').next(),
  active: () => cy.get('dt:contains("Active")').next(),
  courtType: () => cy.get('dt:contains("Court Type")').next(),
  inactiveDate: () => cy.get('dt:contains("Date deactivated")').next(),
  accessibleAccess: () => cy.get('dt:contains("Accessible access")').next(),
  cjitCode: () => cy.get('dt:contains("CJIT Code")').next(),
}

const verifyOnPage = (courtName: string): typeof courtDetails & Page => page(courtName, courtDetails)

export default { verifyOnPage }
