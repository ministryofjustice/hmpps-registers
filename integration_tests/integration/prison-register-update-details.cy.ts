import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import UpdatePrisonDetail from '../pages/prison-register/updatePrisonDetail'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  prisonNameInWelsh: '',
  active: true,
  male: false,
  female: true,
  contracted: true,
  lthse: false,
  types: [
    { code: 'HMP', description: 'His Majesty’s Prison' },
    { code: 'YOI', description: 'His Majesty’s Youth Offender Institution' },
  ],
  operators: [{ name: 'G4S' }],
})

const expectedUpdate = (changes: Record<string, unknown>) => ({
  prisonName: 'HMP Moorland',
  prisonNameInWelsh: '',
  active: true,
  male: false,
  female: true,
  contracted: true,
  lthse: false,
  prisonTypes: ['HMP', 'YOI'],
  ...changes,
})

const updatedPrisons = () => cy.task('getUpdatedPrisons', prison.prisonId)

context('Prison register - update main details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrison', prison)
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubUpdatePrison', prison)
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
  })

  it('shows one item per row with the Welsh name as Not provided', () => {
    const details = PrisonDetails.verifyOnPage(prison.prisonName)
    details.prisonDetailsSection().should('contain.text', 'Welsh name')
    details.prisonDetailsSection().should('contain.text', 'Not provided')
    details.updateNameLink().should('have.attr', 'href', '/prison-register/name/update?id=MDI')
    details.updateDescriptionLink().should('have.attr', 'href', '/prison-register/description/update?id=MDI')
    details.updateWelshNameLink().should('have.attr', 'href', '/prison-register/welsh-name/update?id=MDI')
    details.updateGenderLink().should('have.attr', 'href', '/prison-register/gender/update?id=MDI')
    details.updatePrisonTypesLink().should('have.attr', 'href', '/prison-register/prison-types/update?id=MDI')
    details.updateContractedLink().should('have.attr', 'href', '/prison-register/contracted/update?id=MDI')
    details.updateLthseLink().should('have.attr', 'href', '/prison-register/lthse/update?id=MDI')
  })

  it('updates the name', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateNameLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland')
    page.name().should('have.value', 'HMP Moorland')
    page.name().clear().type('HMP Moorland New')
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    updatedPrisons().should('deep.equal', [expectedUpdate({ prisonName: 'HMP Moorland New' })])
  })

  it('validates the name and retains the input', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateNameLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland')
    page.name().clear().type('A')
    page.saveButton().click()
    const withErrors = UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland')
    withErrors.errorSummary().should('contain.text', 'Enter a prison name between 3 and 80 characters')
    withErrors.name().should('have.value', 'A')
    updatedPrisons().should('be.empty')
  })

  it('updates the description', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateDescriptionLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update description for HMP Moorland')
    page.description().should('have.value', '')
    page.description().type('A category B local prison')
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ prisonDescription: 'A category B local prison' })])
  })

  it('validates the description length', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateDescriptionLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update description for HMP Moorland')
    page.description().invoke('val', 'a'.repeat(257))
    page.saveButton().click()
    UpdatePrisonDetail.verifyOnPage('Update description for HMP Moorland')
      .errorSummary()
      .should('contain.text', 'Description must be 256 characters or fewer')
    updatedPrisons().should('be.empty')
  })

  it('updates the Welsh name', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateWelshNameLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update Welsh name for HMP Moorland')
    page.welshName().type('Carchar Rhosan')
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ prisonNameInWelsh: 'Carchar Rhosan' })])
  })

  it('updates gender', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateGenderLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update gender for HMP Moorland')
    page.maleCheckbox().should('not.be.checked')
    page.femaleCheckbox().should('be.checked')
    page.maleCheckbox().check()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ male: true })])
  })

  it('updates prison types', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updatePrisonTypesLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update prison types for HMP Moorland')
    page.hmpCheckbox().should('be.checked')
    page.yoiCheckbox().should('be.checked')
    page.stcCheckbox().check()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ prisonTypes: ['HMP', 'YOI', 'STC'] })])
  })

  it('updates contracted status', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateContractedLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update contracted status for HMP Moorland')
    page.contractedYes().should('be.checked')
    page.contractedNo().check()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ contracted: false })])
  })

  it('updates long term high security estate status', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateLthseLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update long term high security estate status for HMP Moorland')
    page.lthseNo().should('be.checked')
    page.lthseYes().check()
    page.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('deep.equal', [expectedUpdate({ lthse: true })])
  })

  it('cancels without updating', () => {
    PrisonDetails.verifyOnPage(prison.prisonName).updateNameLink().click()
    UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland').cancelLink().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisons().should('be.empty')
  })

  it('displays API errors and retains the input', () => {
    cy.task('stubUpdatePrisonError', { prisonId: prison.prisonId, userMessage: 'Name could not be updated' })
    PrisonDetails.verifyOnPage(prison.prisonName).updateNameLink().click()
    const page = UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland')
    page.name().clear().type('HMP Moorland New')
    page.saveButton().click()
    const withErrors = UpdatePrisonDetail.verifyOnPage('Update name for HMP Moorland')
    withErrors.errorSummary().should('contain.text', 'Name could not be updated')
    withErrors.name().should('have.value', 'HMP Moorland New')
  })
})
