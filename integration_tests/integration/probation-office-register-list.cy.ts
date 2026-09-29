import IndexPage from '../pages'
import AllProbationOffices from '../pages/probation-office-register/allProbationOffices'
import probationOfficeData from '../../server/routes/testutils/mockProbationOfficeData'

const sheffield = probationOfficeData.probationOffice({
  probationOfficeId: 'SHFPO',
  probationOfficeName: 'Sheffield Probation Office',
  active: true,
})

const leeds = probationOfficeData.probationOffice({
  probationOfficeId: 'LDSPO',
  probationOfficeName: 'Leeds Probation Office',
  active: false,
})

context('Probation office register - probation office list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetProbationOffices', [sheffield, leeds])
    cy.signIn()
  })

  it('Will display a page of probation offices', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    page.tableHeaders().should('have.length', 3)
    page.tableHeaders().eq(0).should('contain.text', 'Code')
    page.tableHeaders().eq(1).should('contain.text', 'Name')
    page.tableHeaders().eq(2).should('contain.text', 'Active')
    {
      const { id, name, active } = page.probationOffices(0)
      id().contains(sheffield.probationOfficeId)
      name().contains(sheffield.probationOfficeName)
      active().contains('Active')
    }
    {
      const { id, name, active } = page.probationOffices(1)
      id().contains(leeds.probationOfficeId)
      name().contains(leeds.probationOfficeName)
      active().contains('Inactive')
    }
  })

  it('Will display a message when there are no probation offices', () => {
    cy.task('stubGetProbationOffices', [])
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    AllProbationOffices.verifyOnPage().noProbationOffices().should('contain.text', 'There are no probation offices')
  })

  it('Will display filter with only active and text search options', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.textSearchFilter().should('exist')
    page.allFilter().should('exist')
    page.mojFilter().find('input[type=radio]').should('have.length', 3)
    page.mojFilter().find('input[type=checkbox]').should('not.exist')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })

  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    // Check the filter defaults to all probation offices
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.activeFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.inactiveFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the active filter has been applied
    page.allFilter().should('not.be.checked')
    page.activeFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    // Filter on active probation offices
    page.showFilterButton().click()
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeFilter().should('be.checked')
    // Cancel the active filter by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelActiveFilter().should('not.exist')
    page.activeFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })

  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

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
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    // Filter on text search
    page.showFilterButton().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the text search filter by clicking on the filter tag
    page.cancelTextSearchFilter('Sheffield').click()
    page.showFilterButton().click()
    // Check we are not filtering on text
    page.cancelTextSearchFilter('Sheffield').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Sheffield')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    const page = AllProbationOffices.verifyOnPage()

    // Filter on active probation offices named Sheffield
    page.showFilterButton().click()
    page.activeFilter().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'textSearch=Sheffield')
    // Cancel the active filter by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check the text search filter is still applied
    page.allFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'textSearch=Sheffield')
  })
})
