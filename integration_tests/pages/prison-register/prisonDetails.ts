import page, { Page } from '../page'

const prisonDetails = {
  prisonDetailsSection: () => cy.get('[data-qa=prison-summary-section]'),
  addressDetailsSection: (addressId: string) => cy.get(`[data-qa=address-details-section-${addressId}]`),
  departmentsSection: () => cy.get('[data-qa=departments-section]'),
  updateDepartmentLink: (type: string) => cy.get(`[data-qa=update-department-link-${type}]`),
  deleteDepartmentLink: (type: string) => cy.get(`[data-qa=delete-department-link-${type}]`),
  addDepartmentLink: () => cy.get('[data-qa=add-department-link]'),
  updateNameLink: () => cy.get('[data-qa=update-name-link]'),
  updateWelshNameLink: () => cy.get('[data-qa=update-welsh-name-link]'),
  updateGenderLink: () => cy.get('[data-qa=update-gender-link]'),
  updatePrisonTypesLink: () => cy.get('[data-qa=update-prison-types-link]'),
  updateContractedLink: () => cy.get('[data-qa=update-contracted-link]'),
  updateLthseLink: () => cy.get('[data-qa=update-lthse-link]'),
  prisonUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
  markAsInactiveButton: (id: string) => cy.get(`[data-qa=mark-as-inactive-${id}]`),
  markAsActiveButton: (id: string) => cy.get(`[data-qa=mark-as-active-${id}]`),
  activatedConfirmationBlock: () => cy.get(`[data-qa=confirm-prison-activation]`),
  deactivatedConfirmationBlock: () => cy.get(`[data-qa=confirm-prison-deactivation]`),
  addWelshAddressLink: (addressId: string) => cy.get(`[data-qa=add-welsh-address-link-${addressId}]`),
  addPrisonAddressLink: (prisonId: string) => cy.get(`[data-qa=add-prison-address-link-${prisonId}]`),
  deletePrisonAddressLink: (addressId: string) => cy.get(`[data-qa=delete-address-details-link-${addressId}]`),
  amendAddressDetailsLink: (addressId: string) => cy.get(`[data-qa=amend-address-details-link-${addressId}]`),
  amendWelshAddressDetailsLink: (addressId: string) =>
    cy.get(`[data-qa=amend-welsh-address-details-link-${addressId}]`),
  deleteWelshAddressDetailsLink: (addressId: string) =>
    cy.get(`[data-qa=delete-welsh-address-details-link-${addressId}]`),
  updateCjitCodeLink: () => cy.get('[data-qa=update-cjit-code-link]'),
  updateAreaLink: () => cy.get('[data-qa=update-area-link]'),
  updateRegionLink: () => cy.get('[data-qa=update-region-link]'),
  updateGeographicalAreaLink: () => cy.get('[data-qa=update-geographical-area-link]'),
  updateLocalAuthorityLink: () => cy.get('[data-qa=update-local-authority-link]'),
  updatePayrollRegionLink: () => cy.get('[data-qa=update-payroll-region-link]'),
}

const verifyOnPage = (prisonName: string): typeof prisonDetails & Page => page(prisonName, prisonDetails)

export default { verifyOnPage }
