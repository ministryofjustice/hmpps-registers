import { albanyPrison, moorlandPrison, cardiffPrison } from '../mockApis/hmppsAgencyRegisterApi'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'

context('Prison register - prison details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, moorlandPrison, cardiffPrison])
    cy.task('stubGetPrisonDetails', moorlandPrison)
    cy.task('stubGetPrisonDetails', albanyPrison)
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

  it('Will display departments with change, delete and add links', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(moorlandPrison.prisonId).click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(moorlandPrison.prisonName)

    prisonDetailsPage.departmentsSection().should('contain.text', 'Departments')
    prisonDetailsPage.departmentsSection().should('contain.text', 'Social visits')
    prisonDetailsPage.departmentsSection().should('contain.text', 'social.visits@moorland.example.com')
    prisonDetailsPage.departmentsSection().should('contain.text', '01302 111111')
    prisonDetailsPage.departmentsSection().should('contain.text', 'https://www.example.com/moorland/visits')
    prisonDetailsPage.departmentsSection().should('contain.text', 'Offender management unit')
    prisonDetailsPage
      .updateDepartmentLink('SOCIAL_VISIT')
      .should('have.attr', 'href', '/prison-register/department/update?id=MDI&departmentType=SOCIAL_VISIT')
    prisonDetailsPage
      .deleteDepartmentLink('SOCIAL_VISIT')
      .should('have.attr', 'href', '/prison-register/department/delete?id=MDI&departmentType=SOCIAL_VISIT')
    prisonDetailsPage.addDepartmentLink().should('have.attr', 'href', '/prison-register/department/create?id=MDI')
  })

  it('Will display prison address details without link to add welsh address', () => {
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
    prisonDetailsPage.addWelshAddressLink('21').should('not.exist')
  })

  it('Will display prison address with link to add welsh address', () => {
    cy.task('stubGetPrisonDetails', cardiffPrison)

    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage()
      .viewPrisonLink(cardiffPrison.prisonId)
      .should('contain.text', cardiffPrison.prisonName)
      .click()
    const prisonDetailsPage = PrisonDetails.verifyOnPage(cardiffPrison.prisonName)
    prisonDetailsPage.addWelshAddressLink('16').should('exist')
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
