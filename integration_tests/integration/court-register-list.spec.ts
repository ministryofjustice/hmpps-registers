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
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Active')
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
    const courtRegisterPagedPage = AllCourtsPagedPage.verifyOnPage()

    const pageLinks = courtRegisterPagedPage.pageLinks()
    pageLinks.then(items => {
      // TODO There must be a better way than this?
      expect(items[0].href).to.equal(undefined)
      expect(items[0].text).to.equal('1')
      expect(items[0].selected).to.equal(true)
      expect(items[1].href).to.equal('/court-register/paged?page=2')
      expect(items[1].text).to.equal('2')
      expect(items[1].selected).to.equal(false)
      expect(items[2].href).to.equal('/court-register/paged?page=2')
      expect(items[2].text).to.contain('Next')
      expect(items[2].selected).to.equal(false)
    })

    const pageResults = courtRegisterPagedPage.pageResults()
    pageResults.contains('Showing 1 to 3 of 4 results')
  })
})
