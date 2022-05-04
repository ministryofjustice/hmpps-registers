import IndexPage from '../pages'
import AllPrisonsPage from '../pages/prison-register/allPrisons'
import AddPrisonDetailsPage from '../pages/prison-register/addNewPrisonDetails'
import AddPrisonAddressPage from '../pages/prison-register/addNewPrisonAddress'
import AddPrisonSummaryPage from '../pages/prison-register/addNewPrisonSummary'
import AddPrisonFinishedPage from '../pages/prison-register/addNewPrisonFinished'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'

context('Prison register - Add new prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison }, moorlandPrison])
    cy.task('stubGetPrison', albanyPrison)
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubAddPrison')
    // cy.task('stubAddPrisonAddress')
    cy.login()
  })

  describe('adding a new prison', () => {
    const fillPrisonDetailsPage = (id = 'TEST') => {
      const prisonDetails = AddPrisonDetailsPage.verifyOnPage()
      prisonDetails.id().type(id)
      prisonDetails.name().type('Doncaster Prison')
      prisonDetails.prisonType('STC').click()
      prisonDetails.gender('female').click()
      prisonDetails.continueButton().click()
    }
    const fillPrisonAddressPage = () => {
      const addressDetails = AddPrisonAddressPage.verifyOnPage()

      addressDetails.addressLine1().type('Vulcan way')
      addressDetails.addressLine2().type('Hatfield Woodhouse')
      addressDetails.addressTown().type('Doncaster')
      addressDetails.addressCounty().type('South Yorkshire')
      addressDetails.addressPostcode().type('DN7 6BB')
      addressDetails.addressCountry().check('England')
      addressDetails.continueButton().click()
    }

    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisonsPage.verifyOnPage().addNewPrisonButton().click()
    })
    it('Can navigate to add new prison page', () => {
      AddPrisonDetailsPage.verifyOnPage()
    })

    describe('add new prison details', () => {
      it('Entering valid data allows moving to build page', () => {
        fillPrisonDetailsPage()
        AddPrisonAddressPage.verifyOnPage()
      })
      it('Entering invalid data keeps you on page with error messages', () => {
        const prisonDetails = AddPrisonDetailsPage.verifyOnPage()
        prisonDetails.id().type(' ')
        prisonDetails.name().type(' ')
        prisonDetails.continueButton().click()

        const prisonDetailsWithErrors = AddPrisonDetailsPage.verifyOnPage()
        prisonDetailsWithErrors.errorSummary().contains('Enter a prison code')
        prisonDetailsWithErrors.errorSummary().contains('Enter a prison name')
      })
      it('Entering prison id for existing prison keeps you on page with error messages', () => {
        fillPrisonDetailsPage('MDI')

        const prisonDetailsWithErrors = AddPrisonDetailsPage.verifyOnPage()
        prisonDetailsWithErrors.errorSummary().contains('Choose another code')
      })
    })

    describe('add new prison address', () => {
      beforeEach(() => {
        fillPrisonDetailsPage()
      })
      it('Entering valid data allows moving to summary page', () => {
        fillPrisonAddressPage()

        AddPrisonSummaryPage.verifyOnPage()
      })
      it('Entering invalid data keeps you on page with error messages', () => {
        const prisonAddress = AddPrisonAddressPage.verifyOnPage()
        prisonAddress.addressLine1().type(' ')
        prisonAddress.addressTown().type(' ')
        prisonAddress.addressCounty().type(' ')
        prisonAddress.addressPostcode().type(' ')
        prisonAddress.continueButton().click()

        const prisonAddressWithErrors = AddPrisonAddressPage.verifyOnPage()
        prisonAddressWithErrors.errorSummary().contains('Enter the town or city')
        prisonAddressWithErrors.errorSummary().contains('Enter the postcode')
        prisonAddressWithErrors.errorSummary().contains('Select the country')
      })
    })

    describe('viewing the summary page', () => {
      beforeEach(() => {
        fillPrisonDetailsPage()
        fillPrisonAddressPage()
      })
      it('shows prison details and can amend them', () => {
        const summaryPage = AddPrisonSummaryPage.verifyOnPage()

        summaryPage.prisonDetails().contains('TEST')
        summaryPage.prisonDetails().contains('Doncaster Prison')
        summaryPage.prisonDetails().contains('Secure Training Centre')
        summaryPage.prisonDetails().contains('Female')

        summaryPage.changePrisonDetailsLink().click()

        const prisonDetails = AddPrisonDetailsPage.verifyOnPage()
        prisonDetails.id().clear().type('TEST2')
        prisonDetails.continueButton().click()

        const summaryPageAfterChange = AddPrisonSummaryPage.verifyOnPage()

        summaryPageAfterChange.prisonDetails().contains('TEST2')
      })
      it('shows address details and can amend them', () => {
        const summaryPage = AddPrisonSummaryPage.verifyOnPage()

        summaryPage.addressDetails().contains('Vulcan way')
        summaryPage.addressDetails().contains('Hatfield Woodhouse')
        summaryPage.addressDetails().contains('Doncaster')
        summaryPage.addressDetails().contains('South Yorkshire')
        summaryPage.addressDetails().contains('DN7 6BB')
        summaryPage.addressDetails().contains('England')

        summaryPage.changeAddressDetailsLink().click()

        const prisonAddress = AddPrisonAddressPage.verifyOnPage()
        prisonAddress.continueButton().click()

        const summaryPageAfterChange = AddPrisonSummaryPage.verifyOnPage()
        summaryPageAfterChange.addressDetails().contains('Vulcan way')
      })
    })

    describe('when successfully adding a new prison', () => {
      beforeEach(() => {
        fillPrisonDetailsPage()
        fillPrisonAddressPage()

        const summary = AddPrisonSummaryPage.verifyOnPage()
        summary.saveButton().click()
      })
      it('Will show success message', () => {
        const finished = AddPrisonFinishedPage.verifyOnPage()
        finished.message().contains('Prison saved')
        finished.message().contains('TEST - Doncaster Prison has been saved successfully')
      })
    })
  })
})
