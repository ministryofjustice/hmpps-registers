import { albanyPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'

context('Prison register - prison list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison])
    cy.login()
  })

  it('Will display a page of prisons', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const prisonRegisterPage = AllPrisons.verifyOnPage()

    {
      const { id, name, active } = prisonRegisterPage.prisons(0)
      id().contains(albanyPrison.prisonId)
      name().contains(albanyPrison.prisonName)
      active().contains('Open')
    }
  })

  it('Will display filter', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })

  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Check the filter defaults to all prisons
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.openFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.closedFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    // Set filter to open prisons only
    page.openFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the open prisons filter has been applied
    page.allFilter().should('not.be.checked')
    page.openFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on open prisons
    page.showFilterButton().click()
    page.openFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.openFilter().should('be.checked')
    // Cancel the open prisons by clicking on the filter tag
    page.cancelOpenFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelOpenFilter().should('not.exist')
    page.openFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })

  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Check there is no filter on text search by default
    page.showFilterButton().click()
    page.textSearchFilter().should('be.empty')
    // Filter on search text
    page.textSearchFilter().type('Albany')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.textSearchFilter().should('have.value', 'Albany')
    cy.url().should('include', 'textSearch=Albany')
  })

  it('Will remove the text search filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on text search
    page.showFilterButton().click()
    page.textSearchFilter().type('Albany')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the text search filter by clicking on the filter tag
    page.cancelTextSearchFilter('Albany').click()
    page.showFilterButton().click()
    // Check we are now only filtered on prisons
    page.cancelTextSearchFilter('Albany').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Albany')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on open prisons and named Albany
    page.showFilterButton().click()
    page.openFilter().click()
    page.textSearchFilter().type('Albany')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.openFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Albany')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'textSearch=Albany')
    // Cancel the open prison filter by clicking on the filter tag
    page.cancelOpenFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on Albany
    page.openFilter().should('not.be.checked')
    page.textSearchFilter().should('have.value', 'Albany')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'textSearch=Albany')
  })
})
