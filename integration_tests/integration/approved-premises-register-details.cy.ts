import IndexPage from '../pages'
import AllApprovedPremises from '../pages/approved-premises-register/allApprovedPremises'
import ApprovedPremisesDetails from '../pages/approved-premises-register/approvedPremisesDetails'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffield = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFAP',
  approvedPremisesName: 'Sheffield Approved Premises',
  description: 'Sheffield City Centre Approved Premises',
  contact: 'John Smith',
  active: false,
  accessibleAccess: 'WHEELCHAIR_ACCESS',
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
    { id: 1, address: 'office1@example.com' },
    { id: 2, address: 'office2@example.com' },
  ],
})

const leeds = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'LDSAP',
  approvedPremisesName: 'Leeds Approved Premises',
  description: null,
  contact: null,
  active: true,
  accessibleAccess: null,
  inactiveDate: null,
  cjitCode: null,
  area: null,
  region: null,
  geographicalArea: null,
  localAuthority: null,
  payrollRegion: null,
})

context('Approved premises register - approved premises details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [sheffield, leeds])
    cy.task('stubGetApprovedPremises', sheffield)
    cy.task('stubGetApprovedPremises', leeds)
    cy.signIn()
  })

  it('Will display approved premises details', () => {
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    AllApprovedPremises.verifyOnPage()
      .viewApprovedPremisesLink(sheffield.approvedPremisesId)
      .should('contain.text', sheffield.approvedPremisesName)
      .click()
    const detailsPage = ApprovedPremisesDetails.verifyOnPage(sheffield.approvedPremisesName)

    detailsPage.approvedPremisesId().should('contain.text', sheffield.approvedPremisesId)
    detailsPage.approvedPremisesName().should('contain.text', sheffield.approvedPremisesName)
    detailsPage.description().should('contain.text', sheffield.description)
    detailsPage.contact().should('contain.text', 'John Smith')
    detailsPage.active().should('contain.text', 'Inactive')
    detailsPage.inactiveDate().should('contain.text', '31 December 2023')
    detailsPage.cjitCode().should('contain.text', 'C00SF00')
    detailsPage.accessibleAccess().should('contain.text', 'Wheelchair access')
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
    detailsPage.emailAddress().should('contain.text', 'office1@example.com')
    detailsPage.emailAddress().should('contain.text', 'office2@example.com')
  })

  it('Will display an active approved premises with optional details missing', () => {
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    AllApprovedPremises.verifyOnPage().viewApprovedPremisesLink(leeds.approvedPremisesId).click()
    const detailsPage = ApprovedPremisesDetails.verifyOnPage(leeds.approvedPremisesName)

    detailsPage.active().should('contain.text', 'Active')
    detailsPage.summaryKeys().should('not.contain.text', 'Date deactivated')
    detailsPage.description().should('contain.text', 'Not provided')
    detailsPage.contact().should('contain.text', 'Not provided')
    detailsPage.cjitCode().should('contain.text', 'Not provided')
    detailsPage.accessibleAccess().should('contain.text', 'Not provided')
    detailsPage.area().should('contain.text', 'Not provided')
    detailsPage.payrollRegion().should('contain.text', 'Not provided')
  })
})
