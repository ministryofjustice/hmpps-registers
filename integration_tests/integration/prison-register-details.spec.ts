import { albanyPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'

context('Prison register - prison details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison])
    cy.task('stubGetPrison', albanyPrison)
    cy.login()
  })

  it('Will display prison details', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(albanyPrison.prisonId)
      .should('contain.text', albanyPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(albanyPrison.prisonName)

    prisonDetailsPage.prisonDetailsSection().should('contain.text', albanyPrison.prisonId)
    prisonDetailsPage.prisonDetailsSection().should('contain.text', albanyPrison.prisonName)
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Open')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Male prison')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Female prison')
  })

  it('Will display prison address details', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(albanyPrison.prisonId)
      .should('contain.text', albanyPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(albanyPrison.prisonName)

    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].addressLine1)
    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].addressLine2)
    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].town)
    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].county)
    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].postcode)
    prisonDetailsPage.addressDetailsSection().should('contain.text', albanyPrison.addresses[0].country)
  })
})
