import IndexPage from '../pages'
import AllApprovedPremises from '../pages/approved-premises-register/allApprovedPremises'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'

const sheffield = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFAP',
  approvedPremisesName: 'Sheffield Approved Premises',
  active: true,
})

const leeds = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'LDSAP',
  approvedPremisesName: 'Leeds Approved Premises',
  active: false,
})

context('Approved premises register - approved premises list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [sheffield, leeds])
    cy.signIn()
  })

  it('Will display a page of approved premises', () => {
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

    page.tableHeaders().should('have.length', 3)
    page.tableHeaders().eq(0).should('contain.text', 'Code')
    page.tableHeaders().eq(1).should('contain.text', 'Name')
    page.tableHeaders().eq(2).should('contain.text', 'Active')
    {
      const { id, name, active } = page.approvedPremisesList(0)
      id().contains(sheffield.approvedPremisesId)
      name().contains(sheffield.approvedPremisesName)
      active().contains('Active')
    }
    {
      const { id, name, active } = page.approvedPremisesList(1)
      id().contains(leeds.approvedPremisesId)
      name().contains(leeds.approvedPremisesName)
      active().contains('Inactive')
    }
  })

  it('Will display a message when there are no approved premises', () => {
    cy.task('stubGetAllApprovedPremises', [])
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    AllApprovedPremises.verifyOnPage().noApprovedPremises().should('contain.text', 'There are no approved premises')
  })

  it('Will display filter with only active and text search options', () => {
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

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
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

    // Check the filter defaults to all approved premises
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
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

    // Filter on active approved premises
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
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

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
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

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
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    const page = AllApprovedPremises.verifyOnPage()

    // Filter on active approved premises named Sheffield
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
