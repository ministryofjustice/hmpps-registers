import { rampton } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllHospitals from '../pages/hospital-register/allHospitals'
import hospitalData from '../../server/routes/testutils/mockHospitalData'

const sheffieldHospital = hospitalData.hospital({
  hospitalId: 'SHEFH',
  hospitalName: 'Sheffield Hospital',
  active: false,
  highSecurity: false,
})

context('Hospital register - hospital list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetHospitals', [rampton, sheffieldHospital])
    cy.signIn()
  })

  it('Will display a page of hospitals', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const hospitalRegisterPage = AllHospitals.verifyOnPage()

    {
      const { id, name, active, highSecurity } = hospitalRegisterPage.hospitals(0)
      id().contains(rampton.hospitalId)
      name().contains(rampton.hospitalName)
      active().contains('Active')
      highSecurity().should('contain.text', 'Yes')
    }
    {
      const { id, name, active, highSecurity } = hospitalRegisterPage.hospitals(1)
      id().contains(sheffieldHospital.hospitalId)
      name().contains(sheffieldHospital.hospitalName)
      active().contains('Inactive')
      highSecurity().should('contain.text', 'No')
    }
  })

  it('Will display filter', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })

  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    // Check the filter defaults to all hospitals
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.activeFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.inactiveFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the active hospitals filter has been applied
    page.allFilter().should('not.be.checked')
    page.activeFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })

  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    // Filter on active hospitals
    page.showFilterButton().click()
    page.activeFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeFilter().should('be.checked')
    // Cancel the active hospitals by clicking on the filter tag
    page.cancelActiveFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelActiveFilter().should('not.exist')
    page.activeFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })

  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

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
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

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

  it('Will change the high security filter', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    // Check the filter defaults to all hospitals
    page.showFilterButton().click()
    page.highSecurityAllFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.highSecurityYesFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.highSecurityNoFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    // Filter on high security hospitals only
    page.highSecurityYesFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.highSecurityAllFilter().should('not.be.checked')
    page.highSecurityYesFilter().should('be.checked')
    cy.url().should('include', 'highSecurity=true')
  })

  it('Will filter on hospitals that are not high security', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    page.showFilterButton().click()
    page.highSecurityNoFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.highSecurityNoFilter().should('be.checked')
    page.cancelNotHighSecurityFilter().should('exist')
    cy.url().should('include', 'highSecurity=false')
  })

  it('Will remove the high security filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    // Filter on high security hospitals
    page.showFilterButton().click()
    page.highSecurityYesFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the high security filter by clicking on the filter tag
    page.cancelHighSecurityFilter().click()
    page.showFilterButton().click()
    // Check we are not filtering on high security
    page.cancelHighSecurityFilter().should('not.exist')
    page.highSecurityAllFilter().should('be.checked')
    cy.url().should('not.contain', 'highSecurity=true')
  })

  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    const page = AllHospitals.verifyOnPage()

    // Filter on active, high security hospitals named Rampton
    page.showFilterButton().click()
    page.activeFilter().click()
    page.highSecurityYesFilter().click()
    page.textSearchFilter().type('Rampton')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.activeFilter().should('be.checked')
    page.highSecurityYesFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Rampton')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'highSecurity=true')
    cy.url().should('contain', 'textSearch=Rampton')
    // Cancel the high security filter by clicking on the filter tag
    page.cancelHighSecurityFilter().click()
    page.showFilterButton().click()
    // Check the other filters are still applied
    page.highSecurityAllFilter().should('be.checked')
    page.activeFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Rampton')
    cy.url().should('not.contain', 'highSecurity=true')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'textSearch=Rampton')
  })
})
