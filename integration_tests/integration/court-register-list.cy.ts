import { sheffieldCrownCourt } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'

context('Court register - court list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.signIn()
  })

  it('Will display a page of courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = AllCourts.verifyOnPage()

    {
      const { id, name, active, type } = courtRegisterPage.courts(0)
      id().contains(sheffieldCrownCourt.courtId)
      name().contains(sheffieldCrownCourt.courtName)
      active().contains('Active')
      type().contains('Crown Court')
    }
  })

  it('Will display filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })

  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Check the filter defaults to all courts
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.activeFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.inactiveFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the active courts filter has been applied
    page.allFilter().should('not.be.checked')
    page.activeFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Filter on active courts
    page.showFilterButton().click()
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeFilter().should('be.checked')
    // Cancel the active courts by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelActiveFilter().should('not.exist')
    page.activeFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })

  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

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
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Filter on text search
    page.showFilterButton().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the text search filter by clicking on the filter tag
    page.cancelTextSearchFilter('Sheffield').click()
    page.showFilterButton().click()
    // Check we are not filtering on courts
    page.cancelTextSearchFilter('Sheffield').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Sheffield')
  })
  it('Will change the court type filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Check there is no filter on court type by default
    page.showFilterButton().click()
    page.crownCourtFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.magistratesFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    // Filter on crown court and magistrates courts only
    page.crownCourtFilter().click()
    page.magistratesFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.crownCourtFilter().should('be.checked')
    page.magistratesFilter().should('be.checked')
    cy.url().should('include', 'courtTypeCodes=CC')
    cy.url().should('include', 'courtTypeCodes=MC')
  })
  it('Will remove the court type filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Filter on crown court
    page.showFilterButton().click()
    page.crownCourtFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the type filter by clicking on the filter tag
    page.cancelCrownCourtFilter().click()
    page.showFilterButton().click()
    // Check we are not filtering on type
    page.cancelTextSearchFilter('Crown Court').should('not.exist')
    page.crownCourtFilter().should('not.be.checked')
    cy.url().should('not.contain', 'courtTypeCodes=CC')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourts.verifyOnPage()

    // Filter on active courts , named Sheffield
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
    // Cancel the active court filter by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on Sheffield
    page.activeFilter().should('not.be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'textSearch=Sheffield')
  })
})
