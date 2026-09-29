import IndexPage from '../pages'
import AllPoliceCustodySuites from '../pages/police-custody-suite-register/allPoliceCustodySuites'
import PoliceCustodySuiteDetails from '../pages/police-custody-suite-register/policeCustodySuiteDetails'
import policeCustodySuiteData from '../../server/routes/testutils/mockPoliceCustodySuiteData'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffield = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'SHFPCS',
  policeCustodySuiteName: 'Sheffield Police Custody Suite',
  description: 'Sheffield City Centre Police Custody Suite',
  active: false,
  inactiveDate: '2023-12-31',
  cjitCode: 'C00SF00',
  area: { code: '52', description: 'South Yorkshire' },
  region: { code: 'YOHUM', description: 'Yorkshire and the Humber' },
  geographicalArea: { code: 'SYORKS', description: 'South Yorkshire and Humberside' },
  localAuthority: { code: '00CG', description: 'Sheffield City Council' },
  payrollRegion: { code: 'NE', description: 'North East' },
  addresses: [
    courtData.address({
      addressLine1: 'Shoreham Street',
      addressLine2: 'Highfield',
      town: 'Sheffield',
      county: 'South Yorkshire',
      postcode: 'S2 4SY',
      country: 'England',
    }),
  ],
  phoneNumbers: [
    { id: 1, number: '0114 220 2020' },
    { id: 2, number: '0114 220 2021' },
  ],
  emailAddresses: [
    { id: 1, address: 'custody1@example.com' },
    { id: 2, address: 'custody2@example.com' },
  ],
})

const leeds = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'LDSPCS',
  policeCustodySuiteName: 'Leeds Police Custody Suite',
  description: null,
  active: true,
  inactiveDate: null,
  cjitCode: null,
  area: null,
  region: null,
  geographicalArea: null,
  localAuthority: null,
  payrollRegion: null,
})

context('Police custody suite register - police custody suite details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPoliceCustodySuites', [sheffield, leeds])
    cy.task('stubGetPoliceCustodySuite', sheffield)
    cy.task('stubGetPoliceCustodySuite', leeds)
    cy.signIn()
  })

  it('Will display police custody suite details', () => {
    IndexPage.verifyOnPage().policeCustodySuiteRegisterLink().click()
    AllPoliceCustodySuites.verifyOnPage()
      .viewPoliceCustodySuiteLink(sheffield.policeCustodySuiteId)
      .should('contain.text', sheffield.policeCustodySuiteName)
      .click()
    const detailsPage = PoliceCustodySuiteDetails.verifyOnPage(sheffield.policeCustodySuiteName)

    detailsPage.policeCustodySuiteId().should('contain.text', sheffield.policeCustodySuiteId)
    detailsPage.policeCustodySuiteName().should('contain.text', sheffield.policeCustodySuiteName)
    detailsPage.description().should('contain.text', sheffield.description)
    detailsPage.active().should('contain.text', 'Inactive')
    detailsPage.inactiveDate().should('contain.text', '31 December 2023')
    detailsPage.cjitCode().should('contain.text', 'C00SF00')
    detailsPage.area().should('contain.text', 'South Yorkshire')
    detailsPage.region().should('contain.text', 'Yorkshire and the Humber')
    detailsPage.geographicalArea().should('contain.text', 'South Yorkshire and Humberside')
    detailsPage.localAuthority().should('contain.text', 'Sheffield City Council')
    detailsPage.payrollRegion().should('contain.text', 'North East')
    detailsPage.address().should('contain.text', 'Shoreham Street')
    detailsPage.address().should('contain.text', 'Highfield')
    detailsPage.address().should('contain.text', 'Sheffield')
    detailsPage.address().should('contain.text', 'South Yorkshire')
    detailsPage.address().should('contain.text', 'S2 4SY')
    detailsPage.address().should('contain.text', 'England')
    detailsPage.phoneNumber().should('contain.text', '0114 220 2020')
    detailsPage.phoneNumber().should('contain.text', '0114 220 2021')
    detailsPage.emailAddress().should('contain.text', 'custody1@example.com')
    detailsPage.emailAddress().should('contain.text', 'custody2@example.com')
  })

  it('Will display an active police custody suite with optional details missing', () => {
    IndexPage.verifyOnPage().policeCustodySuiteRegisterLink().click()
    AllPoliceCustodySuites.verifyOnPage().viewPoliceCustodySuiteLink(leeds.policeCustodySuiteId).click()
    const detailsPage = PoliceCustodySuiteDetails.verifyOnPage(leeds.policeCustodySuiteName)

    detailsPage.active().should('contain.text', 'Active')
    detailsPage.summaryKeys().should('not.contain.text', 'Date deactivated')
    detailsPage.description().should('contain.text', 'Not provided')
    detailsPage.cjitCode().should('contain.text', 'Not provided')
    detailsPage.area().should('contain.text', 'Not provided')
    detailsPage.payrollRegion().should('contain.text', 'Not provided')
  })
})
