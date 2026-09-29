import IndexPage from '../pages'
import AllHospitals from '../pages/hospital-register/allHospitals'
import HospitalDetails from '../pages/hospital-register/hospitalDetails'
import hospitalData from '../../server/routes/testutils/mockHospitalData'
import courtData from '../../server/routes/testutils/mockCourtData'

const rampton = hospitalData.hospital({
  hospitalId: 'RAMPTON',
  hospitalName: 'Rampton Secure Hospital',
  description: 'Rampton high security psychiatric hospital',
  active: false,
  inactiveDate: '2023-01-01',
  highSecurity: true,
  cjitCode: 'C00RA00',
  area: { code: '52', description: 'Nottinghamshire' },
  region: { code: 'EM', description: 'East Midlands' },
  geographicalArea: { code: 'NOTTS', description: 'Nottinghamshire and Derbyshire' },
  localAuthority: { code: '37UB', description: 'Bassetlaw District Council' },
  payrollRegion: { code: 'MID', description: 'Midlands' },
  addresses: [
    courtData.address({
      addressLine1: 'Woodbeck',
      addressLine2: 'Retford',
      town: 'Nottingham',
      county: 'Nottinghamshire',
      postcode: 'DN22 0PD',
      country: 'England',
    }),
  ],
  phoneNumbers: [
    { id: 1, number: '01777 248321' },
    { id: 2, number: '01777 248322' },
  ],
})

const sheffieldHospital = hospitalData.hospital({
  hospitalId: 'SHEFH',
  hospitalName: 'Sheffield Hospital',
  description: null,
  active: true,
  inactiveDate: null,
  highSecurity: false,
  cjitCode: null,
  area: null,
  region: null,
  geographicalArea: null,
  localAuthority: null,
  payrollRegion: null,
})

context('Hospital register - hospital details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetHospitals', [rampton, sheffieldHospital])
    cy.task('stubGetHospital', rampton)
    cy.task('stubGetHospital', sheffieldHospital)
    cy.signIn()
  })

  it('Will display hospital details', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    AllHospitals.verifyOnPage()
      .viewHospitalLink(rampton.hospitalId)
      .should('contain.text', rampton.hospitalName)
      .click()
    const hospitalDetailsPage = HospitalDetails.verifyOnPage(rampton.hospitalName)

    hospitalDetailsPage.hospitalId().should('contain.text', rampton.hospitalId)
    hospitalDetailsPage.hospitalName().should('contain.text', rampton.hospitalName)
    hospitalDetailsPage.description().should('contain.text', rampton.description)
    hospitalDetailsPage.active().should('contain.text', 'Inactive')
    hospitalDetailsPage.inactiveDate().should('contain.text', '1 January 2023')
    hospitalDetailsPage.highSecurity().should('contain.text', 'Yes')
    hospitalDetailsPage.cjitCode().should('contain.text', 'C00RA00')
    hospitalDetailsPage.area().should('contain.text', 'Nottinghamshire')
    hospitalDetailsPage.region().should('contain.text', 'East Midlands')
    hospitalDetailsPage.geographicalArea().should('contain.text', 'Nottinghamshire and Derbyshire')
    hospitalDetailsPage.localAuthority().should('contain.text', 'Bassetlaw District Council')
    hospitalDetailsPage.payrollRegion().should('contain.text', 'Midlands')
    hospitalDetailsPage.address().should('contain.text', 'Woodbeck')
    hospitalDetailsPage.address().should('contain.text', 'Retford')
    hospitalDetailsPage.address().should('contain.text', 'Nottingham')
    hospitalDetailsPage.address().should('contain.text', 'Nottinghamshire')
    hospitalDetailsPage.address().should('contain.text', 'DN22 0PD')
    hospitalDetailsPage.address().should('contain.text', 'England')
    hospitalDetailsPage.phoneNumber().should('contain.text', '01777 248321')
    hospitalDetailsPage.phoneNumber().should('contain.text', '01777 248322')
  })

  it('Will display an active, non high security hospital with optional details missing', () => {
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    AllHospitals.verifyOnPage().viewHospitalLink(sheffieldHospital.hospitalId).click()
    const hospitalDetailsPage = HospitalDetails.verifyOnPage(sheffieldHospital.hospitalName)

    hospitalDetailsPage.active().should('contain.text', 'Active')
    hospitalDetailsPage.summaryKeys().should('not.contain.text', 'Date deactivated')
    hospitalDetailsPage.highSecurity().should('contain.text', 'No')
    hospitalDetailsPage.description().should('contain.text', 'Not provided')
    hospitalDetailsPage.cjitCode().should('contain.text', 'Not provided')
    hospitalDetailsPage.area().should('contain.text', 'Not provided')
    hospitalDetailsPage.payrollRegion().should('contain.text', 'Not provided')
  })
})
