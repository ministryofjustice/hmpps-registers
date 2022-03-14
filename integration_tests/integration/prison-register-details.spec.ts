import { albanyPrison, moorlandPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'

context('Prison register - prison details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.login()
  })

  it('Will display prison details', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(moorlandPrison.prisonId)
      .should('contain.text', moorlandPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(moorlandPrison.prisonName)

    prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonId)
    prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonName)
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Open')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Male prison')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Female prison')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Her Majesty’s Prison,')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Her Majesty’s Youth Offender Institution')
  })

  it('Will display prison address details', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(moorlandPrison.prisonId)
      .should('contain.text', moorlandPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(moorlandPrison.prisonName)

    prisonDetailsPage.addressDetailsSection('21').should('not.contain.text', moorlandPrison.addresses[0].id)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].addressLine1)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].addressLine2)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].town)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].county)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].postcode)
    prisonDetailsPage.addressDetailsSection('21').should('contain.text', moorlandPrison.addresses[0].country)
  })
})
