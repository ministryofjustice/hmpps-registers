import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import DepartmentContactDetails from '../pages/prison-register/departmentContactDetails'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  departments: [
    {
      type: 'SOCIAL_VISIT',
      emailAddress: 'social.visits@moorland.example.com',
      phoneNumber: '01302 111111',
      webAddress: 'https://www.example.com/moorland/visits',
    },
  ],
})

const requests = () => cy.task('getPrisonContactDetailsRequests', { prisonId: 'MDI', method: 'PUT' })
const title = 'Update Social visits contact details for HMP Moorland'
const openUpdatePage = () => {
  PrisonDetails.verifyOnPage(prison.prisonName).updateDepartmentLink('SOCIAL_VISIT').click()
  return DepartmentContactDetails.verifyOnPage(title)
}

context('Prison register - update department contact details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubPrisonContactDetails', { prisonId: 'MDI', method: 'PUT' })
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
  })

  it('will prefill current values', () => {
    const page = openUpdatePage()
    page.emailAddress().should('have.value', 'social.visits@moorland.example.com')
    page.phoneNumber().should('have.value', '01302 111111')
    page.webAddress().should('have.value', 'https://www.example.com/moorland/visits')
    page.cancelLink().should('have.attr', 'href', '/prison-register/details?id=MDI')
  })

  it('will cancel without updating', () => {
    openUpdatePage().cancelLink().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    requests().should('be.empty')
  })

  it('will reject invalid values, retain input and allow correction', () => {
    const page = openUpdatePage()
    page.emailAddress().clear()
    page.emailAddress().type('not-an-email')
    page.phoneNumber().clear()
    page.phoneNumber().type('abc')
    page.webAddress().clear()
    page.webAddress().type('not a url')
    page.saveButton().click()

    const withErrors = DepartmentContactDetails.verifyOnPage(title)
    withErrors.error().should('contain.text', 'Enter a valid email address')
    withErrors.error().should('have.length', 3)
    withErrors.emailAddress().should('have.value', 'not-an-email')
    requests().should('be.empty')

    withErrors.emailAddress().clear()
    withErrors.emailAddress().type('new@moorland.example.com')
    withErrors.phoneNumber().clear()
    withErrors.phoneNumber().type('+44 1302 222222')
    withErrors.webAddress().clear()
    withErrors.webAddress().type('https://new.example.com')
    withErrors.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    cy.url().should('include', '/prison-register/details?id=MDI&action=UPDATED')
    requests().should('deep.equal', [
      {
        type: 'SOCIAL_VISIT',
        emailAddress: 'new@moorland.example.com',
        phoneNumber: '+44 1302 222222',
        webAddress: 'https://new.example.com',
      },
    ])
  })

  it('will allow all fields to be cleared', () => {
    const page = openUpdatePage()
    page.emailAddress().clear()
    page.phoneNumber().clear()
    page.webAddress().clear()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    requests().should('have.length', 1)
  })

  it('will display API errors', () => {
    cy.task('stubPrisonContactDetails', {
      prisonId: 'MDI',
      method: 'PUT',
      status: 400,
      userMessage: 'Contact details could not be updated',
    })
    const page = openUpdatePage()
    page.saveButton().click()
    DepartmentContactDetails.verifyOnPage(title).error().should('contain.text', 'Contact details could not be updated')
  })
})
