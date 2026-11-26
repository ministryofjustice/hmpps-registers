import IndexPage from '../pages'
import AllOtherAgencies from '../pages/other-agency-register/allOtherAgencies'
import OtherAgencyDetails from '../pages/other-agency-register/otherAgencyDetails'
import otherAgencyData from '../../server/routes/testutils/mockOtherAgencyData'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldPecsAgency = otherAgencyData.otherAgency({
  agencyId: 'SHFPECS',
  agencyName: 'Sheffield PECS Agency',
  description: 'Sheffield City Centre PECS Agency',
  active: false,
  inactiveDate: '2023-01-01',
  agencyType: 'PECS',
  accessibleAccess: 'WHEELCHAIR_ACCESS',
  cjitCode: 'C00SH00',
  area: { code: '52', description: 'South Yorkshire' },
  region: { code: 'YOHUM', description: 'Yorkshire & Humberside' },
  geographicalArea: { code: 'YORK', description: 'Yorkshire and Humberside' },
  localAuthority: { code: '00CG', description: 'Sheffield City Council' },
  payrollRegion: { code: 'NEY', description: 'North East & Yorkshire' },
  addresses: [
    courtData.address({
      addressLine1: '1 Test Street',
      addressLine2: 'Testington',
      town: 'Testville',
      county: 'Testshire',
      postcode: 'TE1 1ST',
      country: 'Testland',
    }),
  ],
  emailAddresses: [
    { id: 1, address: 'test1@example.com' },
    { id: 2, address: 'test2@example.com' },
  ],
  phoneNumbers: [
    { id: 1, number: '0014 555 5555' },
    { id: 2, number: '0014 555 6666' },
  ],
})

context('Other agency register - other agency details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetOtherAgencies', [sheffieldPecsAgency])
    cy.task('stubGetOtherAgency', sheffieldPecsAgency)
    cy.signIn()
  })

  it('Will display other agency details', () => {
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    AllOtherAgencies.verifyOnPage()
      .viewOtherAgencyLink(sheffieldPecsAgency.agencyId)
      .should('contain.text', sheffieldPecsAgency.agencyName)
      .click()
    const otherAgencyDetailsPage = OtherAgencyDetails.verifyOnPage(sheffieldPecsAgency.agencyName)

    otherAgencyDetailsPage.agencyId().should('contain.text', sheffieldPecsAgency.agencyId)
    otherAgencyDetailsPage.agencyName().should('contain.text', sheffieldPecsAgency.agencyName)
    otherAgencyDetailsPage.description().should('contain.text', sheffieldPecsAgency.description)
    otherAgencyDetailsPage.active().should('contain.text', 'Inactive')
    otherAgencyDetailsPage.agencyType().should('contain.text', 'Prisoner Escort Custody Service')
    otherAgencyDetailsPage.inactiveDate().should('contain.text', '1 January 2023')
    otherAgencyDetailsPage.accessibleAccess().should('contain.text', 'Wheelchair access')
    otherAgencyDetailsPage.cjitCode().should('contain.text', 'C00SH00')
    otherAgencyDetailsPage.area().should('contain.text', 'South Yorkshire')
    otherAgencyDetailsPage.region().should('contain.text', 'Yorkshire & Humberside')
    otherAgencyDetailsPage.geographicalArea().should('contain.text', 'Yorkshire and Humberside')
    otherAgencyDetailsPage.localAuthority().should('contain.text', 'Sheffield City Council')
    otherAgencyDetailsPage.payrollRegion().should('contain.text', 'North East & Yorkshire')
    otherAgencyDetailsPage.address().should('contain.text', '1 Test Street')
    otherAgencyDetailsPage.address().should('contain.text', 'Testington')
    otherAgencyDetailsPage.address().should('contain.text', 'Testville')
    otherAgencyDetailsPage.address().should('contain.text', 'Testshire')
    otherAgencyDetailsPage.address().should('contain.text', 'TE1 1ST')
    otherAgencyDetailsPage.address().should('contain.text', 'Testland')
    otherAgencyDetailsPage.emailAddress().should('contain.text', 'test1@example.com')
    otherAgencyDetailsPage.emailAddress().should('contain.text', 'test2@example.com')
    otherAgencyDetailsPage.phoneNumber().should('contain.text', '0014 555 5555')
    otherAgencyDetailsPage.phoneNumber().should('contain.text', '0014 555 6666')
  })
})
