import { sheffieldPecsAgency } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllOtherAgencies from '../pages/other-agency-register/allOtherAgencies'

context('Other agency register - other agency list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetOtherAgencies', [sheffieldPecsAgency])
    cy.signIn()
  })

  it('Will display a page of other agencies', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const otherAgencyRegisterPage = AllOtherAgencies.verifyOnPage()

    {
      const { id, name, active, type } = otherAgencyRegisterPage.otherAgencies(0)
      id().contains(sheffieldPecsAgency.agencyId)
      name().contains(sheffieldPecsAgency.agencyName)
      active().contains('Active')
      type().contains('Prisoner Escort Custody Service')
    }
  })

  it('Will display filter', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })

  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Check the filter defaults to all other agencies
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.activeFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.inactiveFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the active other agencies filter has been applied
    page.allFilter().should('not.be.checked')
    page.activeFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Filter on active other agencies
    page.showFilterButton().click()
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeFilter().should('be.checked')
    // Cancel the active other agencies by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelActiveFilter().should('not.exist')
    page.activeFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })

  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Check there is no filter on text search by default
    page.showFilterButton().click()
    page.textSearchFilter().should('be.empty')
    // Filter on search text
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('include', 'textSearch=Sheffield')
  })

  it('Will remove the text search filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Filter on text search
    page.showFilterButton().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the text search filter by clicking on the filter tag
    page.cancelTextSearchFilter('Sheffield').click()
    page.showFilterButton().click()
    // Check we are not filtering on other agencies
    page.cancelTextSearchFilter('Sheffield').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Sheffield')
  })

  it('Will change the other agency type filter', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Check there is no filter on other agency type by default
    page.showFilterButton().click()
    page.pecsFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.airportFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    // Filter on PECS and airport agencies only
    page.pecsFilter().click()
    page.airportFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.pecsFilter().should('be.checked')
    page.airportFilter().should('be.checked')
    cy.url().should('include', 'otherAgencyTypeCodes=PECS')
    cy.url().should('include', 'otherAgencyTypeCodes=AIRPORT')
  })

  it('Will remove the other agency type filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Filter on PECS
    page.showFilterButton().click()
    page.pecsFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the type filter by clicking on the filter tag
    page.cancelPecsFilter().click()
    page.showFilterButton().click()
    // Check we are not filtering on type
    page.pecsFilter().should('not.be.checked')
    cy.url().should('not.contain', 'otherAgencyTypeCodes=PECS')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    const page = AllOtherAgencies.verifyOnPage()

    // Filter on active other agencies, named Sheffield
    page.showFilterButton().click()
    page.activeFilter().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.activeFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'textSearch=Sheffield')
    // Cancel the active other agency filter by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on Sheffield
    page.activeFilter().should('not.be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'textSearch=Sheffield')
  })
})
