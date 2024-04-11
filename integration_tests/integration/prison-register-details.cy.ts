import { albanyPrison, moorlandPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'

context('Prison register - prison details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrison', albanyPrison)
    cy.signIn()
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
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Active')
    prisonDetailsPage.prisonDetailsSection().should('not.contain.text', 'Male prison')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Female prison')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Contracted')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Operator(s)')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'Type(s)')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'His Majesty’s Prison,')
    prisonDetailsPage.prisonDetailsSection().should('contain.text', 'His Majesty’s Youth Offender Institution')
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

  it('Will not display prison types when none present', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(albanyPrison.prisonId)
      .should('contain.text', albanyPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(albanyPrison.prisonName)

    prisonDetailsPage.prisonDetailsSection().should('not.contain.text', 'Type(s)')
  })

  it('Will not state prison contracted when prison not contracted', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(albanyPrison.prisonId)
      .should('contain.text', albanyPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(albanyPrison.prisonName)

    prisonDetailsPage.prisonDetailsSection().should('not.contain.text', 'Contracted')
    prisonDetailsPage.prisonDetailsSection().should('not.contain.text', 'Operator(s)')
  })
})
