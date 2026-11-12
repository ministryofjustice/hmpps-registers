import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import DepartmentContactDetails from '../pages/prison-register/departmentContactDetails'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  departments: [{ type: 'SOCIAL_VISIT', emailAddress: 'social.visits@moorland.example.com' }],
})

const requests = () => cy.task('getPrisonContactDetailsRequests', { prisonId: 'MDI', method: 'POST' })
const title = 'Add contact details for HMP Moorland'
const openAddPage = () => {
  PrisonDetails.verifyOnPage(prison.prisonName).addDepartmentLink().click()
  return DepartmentContactDetails.verifyOnPage(title)
}

context('Prison register - add department contact details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubPrisonContactDetails', { prisonId: 'MDI', method: 'POST' })
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
  })

  it('will only offer department types not already present', () => {
    const page = openAddPage()
    page.departmentType('SOCIAL_VISIT').should('not.exist')
    page.departmentType('OFFICIAL_VISIT').should('exist')
  })

  it('will cancel without creating', () => {
    openAddPage().cancelLink().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    requests().should('be.empty')
  })

  it('will require a type and validate fields', () => {
    const page = openAddPage()
    page.emailAddress().type('bad')
    page.phoneNumber().type('abc')
    page.webAddress().type('nope')
    page.saveButton().click()
    const withErrors = DepartmentContactDetails.verifyOnPage(title)
    withErrors.error().should('have.length', 4)
    withErrors.emailAddress().should('have.value', 'bad')
    requests().should('be.empty')
  })

  it('will create contact details', () => {
    const page = openAddPage()
    page.departmentType('OFFICIAL_VISIT').check()
    page.emailAddress().type('official@moorland.example.com')
    page.phoneNumber().type('01302 333333')
    page.webAddress().type('https://official.example.com')
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    cy.url().should('include', '/prison-register/details?id=MDI&action=UPDATED')
    requests().should('deep.equal', [
      {
        type: 'OFFICIAL_VISIT',
        emailAddress: 'official@moorland.example.com',
        phoneNumber: '01302 333333',
        webAddress: 'https://official.example.com',
      },
    ])
  })

  it('will allow empty fields', () => {
    const page = openAddPage()
    page.departmentType('PRISON').check()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    requests().should('have.length', 1)
  })

  it('will display API errors', () => {
    cy.task('stubPrisonContactDetails', {
      prisonId: 'MDI',
      method: 'POST',
      status: 400,
      userMessage: 'Contact details already exist',
    })
    const page = openAddPage()
    page.departmentType('PRISON').check()
    page.saveButton().click()
    DepartmentContactDetails.verifyOnPage(title).error().should('contain.text', 'Contact details already exist')
  })
})
