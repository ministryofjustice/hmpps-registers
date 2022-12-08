import IndexPage from '../pages'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import { sheffieldCrownCourt, sheffieldMagistratesCourt, sheffieldYouthCourt } from '../mockApis/courtRegister'
import { getRequests } from '../mockApis/wiremock'

context('Court register - court list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubCourtTypes')
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
    cy.signIn()
  })

  it('Will display a page of courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
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
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    page.pageLinks().then(items => {
      expect(items[0]).to.deep.equal({ href: undefined, text: '1', selected: true })
      expect(items[1]).to.deep.equal({
        href: '/court-register?page=2',
        text: '2',
        selected: false,
      })
      expect(items[2]).to.deep.equal({
        href: '/court-register?page=2',
        text: 'Next page',
        selected: false,
      })
    })

    page.pageResults().contains('Showing 1 to 3 of 4 results')
  })
  it('Will display filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    page.showFilterButton().click()
    page.mojFilter().should('be.visible')
    page.hideFilterButton().click()
    page.mojFilter().should('not.be.visible')
  })
  it('Will change the active filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Check the filter defaults to all courts
    page.showFilterButton().click()
    page.allFilter().should('have.attr', 'type', 'radio').should('be.checked')
    page.openFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    page.closedFilter().should('have.attr', 'type', 'radio').should('not.be.checked')
    // Set filter to open courts only
    page.openFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the open courts filter has been applied
    page.allFilter().should('not.be.checked')
    page.openFilter().should('be.checked')
    cy.url().should('include', 'active=true')
  })
  it('Will change the court type filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Check there is no filter on court type by default
    page.showFilterButton().click()
    page.countyFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    page.crownFilter().should('have.attr', 'type', 'checkbox').should('not.be.checked')
    // Filter on crown and county courts only
    page.crownFilter().click()
    page.countyFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.countyFilter().should('be.checked')
    page.crownFilter().should('be.checked')
    cy.url().should('include', 'courtTypeIds=CRN')
    cy.url().should('include', 'courtTypeIds=COU')
  })
  it('Will change the text search filter', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

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
  it('Will include the filter on page links', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on open courts and county courts
    page.showFilterButton().click()
    page.openFilter().click()
    page.countyFilter().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    // Check the page links will retain the filter
    page.page2Link().invoke('attr', 'href').should('contain', 'active=true')
    page.page2Link().invoke('attr', 'href').should('contain', 'courtTypeIds=COU')
    page.page2Link().invoke('attr', 'href').should('contain', 'textSearch=Sheffield')
    page.nextPageLink().invoke('attr', 'href').should('contain', 'active=true')
    page.nextPageLink().invoke('attr', 'href').should('contain', 'courtTypeIds=COU')
    page.nextPageLink().invoke('attr', 'href').should('contain', 'textSearch=Sheffield')
  })
  it('Will include the filter when retrieving another page from the server', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on open courts and count courts
    page.showFilterButton().click()
    page.openFilter().click()
    page.countyFilter().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    // Click on the page 2 link
    page
      .page2Link()
      .first()
      .click()
      // Check that the server call to the next page includes the filters
      .then(() => getRequests())
      .then((response: { body: { requests: { request: { url: string } }[] } }) =>
        response.body.requests.filter(request => request.request.url.includes('/court-register/courts/paged?page=1'))
      )
      .then(page1Requests => {
        expect(page1Requests).to.have.length(1)
        expect(page1Requests[0].request.url).to.contain('active=true')
        expect(page1Requests[0].request.url).to.contain('courtTypeIds=COU')
        expect(page1Requests[0].request.url).to.contain('textSearch=Sheffield')
      })
  })
  it('Will remove the active filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on open courts
    page.showFilterButton().click()
    page.openFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    page.openFilter().should('be.checked')
    // Cancel the open courts by clicking on the filter tag
    page.cancelOpenFilter().click()
    page.showFilterButton().click()
    // Check that the filter is no longer applied
    page.cancelOpenFilter().should('not.exist')
    page.openFilter().should('not.be.checked')
    page.allFilter().should('be.checked')
    cy.url().should('not.contain', 'active=true')
  })
  it('Will remove the court type filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on crown and county courts
    page.showFilterButton().click()
    page.crownFilter().click()
    page.countyFilter().click()
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the county courts filter by clicking on the filter tag
    page.cancelCountyFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on crown courts
    page.cancelCountyFilter().should('not.exist')
    page.cancelCrownFilter().should('exist')
    page.countyFilter().should('not.be.checked')
    page.crownFilter().should('be.checked')
    cy.url().should('not.contain', 'courtTypeIds=COU')
    cy.url().should('contain', 'courtTypeIds=CRN')
  })
  it('Will remove the text search filter when cancelling via the tag', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on text search
    page.showFilterButton().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Cancel the text search filter by clicking on the filter tag
    page.cancelTextSearchFilter('Sheffield').click()
    page.showFilterButton().click()
    // Check we are now only filtered on crown courts
    page.cancelTextSearchFilter('Sheffield').should('not.exist')
    page.textSearchFilter().should('be.empty')
    cy.url().should('not.contain', 'textSearch=Sheffield')
  })
  it('Will remove one from a combination of filter tags', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const page = AllCourtsPagedPage.verifyOnPage()

    // Filter on open courts and crown courts
    page.showFilterButton().click()
    page.openFilter().click()
    page.crownFilter().click()
    page.textSearchFilter().type('Sheffield')
    page.applyFilterButton().click()
    page.showFilterButton().click()
    // Check the filter has been applied
    page.openFilter().should('be.checked')
    page.crownFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('contain', 'active=true')
    cy.url().should('contain', 'courtTypeIds=CRN')
    cy.url().should('contain', 'textSearch=Sheffield')
    // Cancel the open courts filter by clicking on the filter tag
    page.cancelOpenFilter().click()
    page.showFilterButton().click()
    // Check we are now only filtered on crown courts
    page.openFilter().should('not.be.checked')
    page.crownFilter().should('be.checked')
    page.textSearchFilter().should('have.value', 'Sheffield')
    cy.url().should('not.contain', 'active=true')
    cy.url().should('contain', 'courtTypeIds=CRN')
    cy.url().should('contain', 'textSearch=Sheffield')
  })
})