import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import DeleteDepartmentContactDetails from '../pages/prison-register/deleteDepartmentContactDetails'
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

const requests = () => cy.task('getPrisonContactDetailsRequests', { prisonId: 'MDI', method: 'DELETE' })
const title = 'Delete Social visits contact details for HMP Moorland'

context('Prison register - delete department contact details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubPrisonContactDetails', { prisonId: 'MDI', method: 'DELETE' })
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
    PrisonDetails.verifyOnPage(prison.prisonName).deleteDepartmentLink('SOCIAL_VISIT').click()
  })

  it('will show the current details', () => {
    const page = DeleteDepartmentContactDetails.verifyOnPage(title)
    page.details().should('contain.text', 'social.visits@moorland.example.com')
    page.details().should('contain.text', '01302 111111')
    page.details().should('contain.text', 'https://www.example.com/moorland/visits')
  })

  it('will cancel without deleting', () => {
    DeleteDepartmentContactDetails.verifyOnPage(title).cancelLink().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    requests().should('be.empty')
  })

  it('will delete the contact details', () => {
    DeleteDepartmentContactDetails.verifyOnPage(title).deleteButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    cy.url().should('include', '/prison-register/details?id=MDI&action=UPDATED')
    requests().should('deep.equal', [{ departmentType: 'SOCIAL_VISIT' }])
  })
})
