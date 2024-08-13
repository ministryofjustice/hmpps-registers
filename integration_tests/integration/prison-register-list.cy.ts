import { moorlandPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'

context('Prison register - prison list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [moorlandPrison])
    cy.signIn()
  })

  it('Will display a page of prisons', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const prisonRegisterPage = AllPrisons.verifyOnPage()

    {
      const { id, name, active, types } = prisonRegisterPage.prisons(0)
      id().contains(moorlandPrison.prisonId)
      name().contains(moorlandPrison.prisonName)
      active().contains('Active')
      types().contains('HMP, YOI')
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
    page.activeFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.inactiveFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.lthseFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    // Set filter to active prisons only
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the active prisons filter has been applied
    page.allFilter().should('not.be.checked')
    page.activeFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on active prisons
    page.showFilterButton().click()
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeFilter().should('be.checked')
    // Cancel the active prisons by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelActiveFilter().should('not.exist')
    page.activeFilter().should('not.be.checked')
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
    // Check we are not filtering on prisons
    page.cancelTextSearchFilter('Albany').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Albany')
  })

  it('Will change the gender filter', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Check the filter defaults to all prisons
    page.showFilterButton().click()
    page.maleFilter().should('have.attr', 'type', 'checkbox').should('be.checked')
    page.femaleFilter().should('have.attr', 'type', 'checkbox').should('be.checked')
    // Filter on female prisons only
    page.maleFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the female prisons filter has been applied
    page.maleFilter().should('not.be.checked')
    page.femaleFilter().should('be.checked')
    cy.url().should('include', 'genders=FEMALE')
    // Add back in male prisons
    page.maleFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has reset
    page.maleFilter().should('be.checked')
    page.femaleFilter().should('be.checked')
    // Filter on male prisons only
    page.femaleFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the male prisons filter has been applied
    page.maleFilter().should('be.checked')
    page.femaleFilter().should('not.be.checked')
    cy.url().should('include', 'genders=MALE')
    // Untick male so both are unchecked
    page.maleFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check both checkboxes have been reset and now checked
    page.maleFilter().should('be.checked')
    page.femaleFilter().should('be.checked')
  })

  it('Will remove the gender filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on female prison
    page.showFilterButton().click()
    page.maleFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the gender filter by clicking on the filter tag
    page.cancelFemaleFilter().click()
    page.showFilterButton().click()
    // Check we are not filtering on gender
    page.cancelTextSearchFilter('Female').should('not.exist')
    page.femaleFilter().should('be.checked')
    cy.url().should('not.contain', 'genders=FEMALE')
  })

  it('Will change the prison type filter', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Check there is no filter on prison type by default
    page.showFilterButton().click()
    page.hmpFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.yoiFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    // Filter on hmp and yoi prisons only
    page.hmpFilter().click()
    page.yoiFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.hmpFilter().should('be.checked')
    page.yoiFilter().should('be.checked')
    cy.url().should('include', 'prisonTypeCodes=HMP')
    cy.url().should('include', 'prisonTypeCodes=YOI')
  })

  it('Will remove the prison type filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on hmp prison
    page.showFilterButton().click()
    page.hmpFilter().click()
    page.lthseFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the type filter by clicking on the filter tag
    page.cancelHmpFilter().click()
    page.showFilterButton().click()
    page.cancelLthseFilter().click()
    // Check we are not filtering on type
    page.cancelTextSearchFilter('HMP').should('not.exist')
    page.hmpFilter().should('not.be.checked')
    page.lthseFilter().should('not.be.checked')
    cy.url().should('not.contain', 'prisonTypeCodes=HMP')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const page = AllPrisons.verifyOnPage()

    // Filter on active prisons , named Albany , and male
    page.showFilterButton().click()
    page.activeFilter().click()
    page.textSearchFilter().type('Albany')
    page.femaleFilter().click()
    page.lthseFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.activeFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Albany')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'textSearch=Albany')
    cy.url().should('contain', 'genders=MALE')
    cy.url().should('contain', 'lthse=true')
    // Cancel the active prison filter by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on Albany and male
    page.activeFilter().should('not.be.checked')
    page.textSearchFilter().should('have.value', 'Albany')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'textSearch=Albany')
    cy.url().should('contain', 'genders=MALE')
    cy.url().should('contain', 'lthse=true')
  })
})
