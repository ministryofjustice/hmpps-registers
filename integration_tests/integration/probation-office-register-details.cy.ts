import IndexPage from '../pages'
import AllProbationOffices from '../pages/probation-office-register/allProbationOffices'
import ProbationOfficeDetails from '../pages/probation-office-register/probationOfficeDetails'
import probationOfficeData from '../../server/routes/testutils/mockProbationOfficeData'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffield = probationOfficeData.probationOffice({
  probationOfficeId: 'SHFPO',
  probationOfficeName: 'Sheffield Probation Office',
  description: 'Sheffield City Centre Probation Office',
  contact: 'John Smith',
  active: false,
  accessibleAccess: 'WHEELCHAIR_ACCESS',
  inactiveDate: '2023-12-31',
  cjitCode: 'C00SF00',
  area: { code: '52', description: 'South Yorkshire' },
  subarea: { code: 'SHF', description: 'Sheffield and Rotherham' },
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
    { id: 1, address: 'office1@example.com' },
    { id: 2, address: 'office2@example.com' },
  ],
})

const leeds = probationOfficeData.probationOffice({
  probationOfficeId: 'LDSPO',
  probationOfficeName: 'Leeds Probation Office',
  description: null,
  contact: null,
  active: true,
  accessibleAccess: null,
  inactiveDate: null,
  cjitCode: null,
  area: null,
  subarea: null,
  region: null,
  geographicalArea: null,
  localAuthority: null,
  payrollRegion: null,
})

context('Probation office register - probation office details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetProbationOffices', [sheffield, leeds])
    cy.task('stubGetProbationOffice', sheffield)
    cy.task('stubGetProbationOffice', leeds)
    cy.signIn()
  })

  it('Will display probation office details', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    AllProbationOffices.verifyOnPage()
      .viewProbationOfficeLink(sheffield.probationOfficeId)
      .should('contain.text', sheffield.probationOfficeName)
      .click()
    const detailsPage = ProbationOfficeDetails.verifyOnPage(sheffield.probationOfficeName)

    detailsPage.probationOfficeId().should('contain.text', sheffield.probationOfficeId)
    detailsPage.probationOfficeName().should('contain.text', sheffield.probationOfficeName)
    detailsPage.description().should('contain.text', sheffield.description)
    detailsPage.contact().should('contain.text', 'John Smith')
    detailsPage.active().should('contain.text', 'Inactive')
    detailsPage.inactiveDate().should('contain.text', '31 December 2023')
    detailsPage.cjitCode().should('contain.text', 'C00SF00')
    detailsPage.accessibleAccess().should('contain.text', 'Wheelchair access')
    detailsPage.area().should('contain.text', 'South Yorkshire')
    detailsPage.subarea().should('contain.text', 'Sheffield and Rotherham')
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
    detailsPage.emailAddress().should('contain.text', 'office1@example.com')
    detailsPage.emailAddress().should('contain.text', 'office2@example.com')
  })

  it('Will display an active probation office with optional details missing', () => {
    IndexPage.verifyOnPage().probationOfficeRegisterLink().click()
    AllProbationOffices.verifyOnPage().viewProbationOfficeLink(leeds.probationOfficeId).click()
    const detailsPage = ProbationOfficeDetails.verifyOnPage(leeds.probationOfficeName)

    detailsPage.active().should('contain.text', 'Active')
    detailsPage.summaryKeys().should('not.contain.text', 'Date deactivated')
    detailsPage.description().should('contain.text', 'Not provided')
    detailsPage.contact().should('contain.text', 'Not provided')
    detailsPage.cjitCode().should('contain.text', 'Not provided')
    detailsPage.accessibleAccess().should('contain.text', 'Not provided')
    detailsPage.subarea().should('contain.text', 'Not provided')
    detailsPage.area().should('contain.text', 'Not provided')
    detailsPage.payrollRegion().should('contain.text', 'Not provided')
  })
})
