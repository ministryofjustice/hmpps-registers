import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import { sheffieldCrownCourt, sheffieldMagistratesCourt, sheffieldYouthCourt } from '../mockApis/courtRegister'

context('Court register - court list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubAllCourts', [sheffieldCrownCourt, sheffieldMagistratesCourt])
    cy.task('stubPageOfCourts', {
      content: [sheffieldCrownCourt, { ...sheffieldMagistratesCourt, active: true }, sheffieldYouthCourt],
      last: false,
      totalPages: 2,
      totalElements: 4,
      number: 0,
      size: 3,
      first: true,
      numberOfElements: 3,
      empty: false,
    })
    cy.task('stubCourt', sheffieldCrownCourt)
    cy.task('stubCourt', sheffieldMagistratesCourt)
    cy.login()
  })

  it('Can navigate to court registers', () => {
    IndexPage.verifyOnPage().courtRegisterLink().should('contain.text', 'Court register').click()
    AllCourtsPage.verifyOnPage()
  })

  it('Will display all courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = AllCourtsPage.verifyOnPage()

    {
      const { code, name, type, status } = courtRegisterPage.courts(0)
      code().contains('SHFCC')
      name().contains('Sheffield Crown Court')
      type().contains('Crown')
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Closed')
    }
  })

  it('Will display a page of courts', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removing the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const courtRegisterPagedPage = AllCourtsPagedPage.verifyOnPage()

    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(0)
      code().contains('SHFCC')
      name().contains('Sheffield Crown Court')
      type().contains('Crown')
      status().contains('Open')
    }
    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Open')
    }
    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(2)
      code().contains('SHFYC')
      name().contains('Sheffield Youth Court')
      type().contains('Youth')
      status().contains('Closed')
    }
  })
  it('Will display pagination controls', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removign the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const page = AllCourtsPagedPage.verifyOnPage()

    page.pageLinks().then(items => {
      expect(items[0]).to.deep.equal({ href: undefined, text: '1', selected: true })
      expect(items[1]).to.deep.equal({ href: '/court-register/paged?page=2', text: '2', selected: false })
      expect(items[2]).to.deep.equal({
        href: '/court-register/paged?page=2',
        text: 'Next set of pages',
        selected: false,
      })
    })

    page.pageResults().contains('Showing 1 to 3 of 4 results')
  })
  it('Will display filter', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removign the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const page = AllCourtsPagedPage.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })
  it('Will change the active filter', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removign the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const page = AllCourtsPagedPage.verifyOnPage()

    page.showFilterButton().click()
    page.activeAllFilter().prev().should('have.attr', 'type', 'radio').should('be.checked')
    page.activeOpenFilter().prev().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeClosedFilter().prev().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.activeOpenFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.activeAllFilter().prev().should('not.be.checked')
    page.activeOpenFilter().prev().should('be.checked')
    cy.url().should('include', 'active=true')
  })
  it('Will change the court type filter', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removign the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const page = AllCourtsPagedPage.verifyOnPage()

    page.showFilterButton().click()
    page.courtTypeCountyFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.courtTypeCrownFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.courtTypeCrownFilter().click()
    page.courtTypeCountyFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.courtTypeCountyFilter().should('be.checked')
    page.courtTypeCrownFilter().should('be.checked')
    cy.url().should('include', 'courtTypeIds=CRN')
    cy.url().should('include', 'courtTypeIds=COU')
  })
})
