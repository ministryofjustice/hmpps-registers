import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllHospitals from '../pages/hospital-register/allHospitals'
import HospitalDetails from '../pages/hospital-register/hospitalDetails'
import {
  AddHospitalCheckAnswers,
  AddHospitalCjitCode,
  AddHospitalDetails,
  AddHospitalHighSecurity,
  AddHospitalReferenceData,
  ReferenceField,
} from '../pages/hospital-register/addHospital'
import hospitalData from '../../server/routes/testutils/mockHospitalData'
import { Hospital } from '../../server/@types/prisonRegister'

const existingHospital = hospitalData.hospital({ hospitalId: 'SHEFH', hospitalName: 'Sheffield Hospital' })

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  hospitalId: string
  hospitalName: string
  description?: string
  highSecurity: 'true' | 'false'
  cjitCode?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  hospitalId: 'NEWH',
  hospitalName: 'New Hospital',
  description: 'A brand new hospital',
  highSecurity: 'true',
  cjitCode: 'C00NW00',
  area: { search: 'South', code: 'SY', description: 'South Yorkshire' },
  region: { search: 'North', code: 'NE', description: 'North East' },
  geographicalArea: { search: 'West', code: 'SW', description: 'South West' },
  localAuthority: { search: 'Leeds', code: 'LEED', description: 'Leeds' },
  payrollRegion: { search: 'North', code: 'NE', description: 'North East' },
}

const fullPayload = {
  hospitalId: 'NEWH',
  hospitalName: 'New Hospital',
  description: 'A brand new hospital',
  active: true,
  highSecurity: true,
  cjitCode: 'C00NW00',
  areaCode: 'SY',
  regionCode: 'NE',
  geographicalAreaCode: 'SW',
  localAuthorityCode: 'LEED',
  payrollRegionCode: 'NE',
  addresses: [],
  phoneNumbers: [],
}

const createdHospital = (hospitalId: string, hospitalName: string): Hospital =>
  hospitalData.hospital({ hospitalId, hospitalName, active: true, addresses: [], phoneNumbers: [] })

const createdHospitals = () => cy.task('getCreatedHospitals')

const stubNewHospital = (hospitalId: string, hospitalName: string) => {
  const hospital = createdHospital(hospitalId, hospitalName)
  cy.task('stubHospitalIdAvailable', hospital)
  cy.task('stubCreateHospital', hospital)
}

const journeyUrl = (step: string) => cy.get<string>('@journeyId').then(id => `/hospital-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/hospital-register')
  AllHospitals.verifyOnPage().addHospitalLink().click()
  cy.location('pathname')
    .should('match', /^\/hospital-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddHospitalDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (answers: Pick<Answers, 'hospitalId' | 'hospitalName' | 'description'>) => {
  const page = AddHospitalDetails.verifyOnPage()
  typeOrClear(page.hospitalId, answers.hospitalId)
  typeOrClear(page.hospitalName, answers.hospitalName)
  typeOrClear(page.description, answers.description)
  page.continueButton().click()
}

const selectHighSecurity = (value: 'true' | 'false') => {
  const page = AddHospitalHighSecurity.verifyOnPage()
  page.option(value).check()
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddHospitalCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddHospitalReferenceData.verifyOnPage(field)
  page.input().clear()
  if (answer) {
    page.input().type(answer.search)
    page.suggestions().contains(answer.description).click()
    page.code().should('have.value', answer.code)
  }
  page.continueButton().click()
}

const completeJourney = (answers: Answers) => {
  enterDetails(answers)
  selectHighSecurity(answers.highSecurity)
  enterCjitCode(answers.cjitCode)
  referenceFields.forEach(field => selectReference(field, answers[field]))
  return AddHospitalCheckAnswers.verifyOnPage()
}

context('Hospital register - add hospital', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetHospitals', [existingHospital])
    cy.task('stubGetHospital', existingHospital)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingHospital.hospitalId,
      name: existingHospital.hospitalName,
      legacyType: 'HOSPITAL',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewHospital('NEWH', 'New Hospital')
    cy.signIn()
  })

  it('will add a hospital with every field and show the created hospital', () => {
    cy.visit('/hospital-register')
    AllHospitals.verifyOnPage().addHospitalLink().should('have.attr', 'href', '/hospital-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('hospitalId').should('contain.text', 'NEWH')
    checkAnswers.value('hospitalName').should('contain.text', 'New Hospital')
    checkAnswers.value('description').should('contain.text', 'A brand new hospital')
    checkAnswers.value('highSecurity').should('contain.text', 'Yes')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdHospitals().should('be.empty')

    checkAnswers.createHospitalButton().should('contain.text', 'Confirm and add hospital').click()

    const details = HospitalDetails.verifyOnPage('New Hospital')
    cy.url().should('include', '/hospital-register/details?id=NEWH&action=CREATED')
    details.confirmCreated().should('contain.text', 'Hospital has been added successfully')
    details.link('add-address-link').should('exist')
    details.link('add-phone-number-link').should('exist')
    createdHospitals().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers from the create request', () => {
    stubNewHospital('NEWL', 'New Local Hospital')
    startJourney()
    const checkAnswers = completeJourney({
      hospitalId: 'NEWL',
      hospitalName: 'New Local Hospital',
      highSecurity: 'false',
    })
    checkAnswers.value('cjitCode').should('contain.text', 'Not provided')
    checkAnswers.createHospitalButton().click()

    HospitalDetails.verifyOnPage('New Local Hospital')
    createdHospitals().should('deep.equal', [
      {
        hospitalId: 'NEWL',
        hospitalName: 'New Local Hospital',
        active: true,
        highSecurity: false,
        addresses: [],
        phoneNumbers: [],
      },
    ])
  })

  it('will prefill answers from change links and return directly to check answers', () => {
    stubNewHospital('NEWM', 'Changed Hospital Name')
    startJourney()
    completeJourney(fullAnswers)
    const backOnCheckAnswers = () => {
      journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))
      return AddHospitalCheckAnswers.verifyOnPage()
    }

    AddHospitalCheckAnswers.verifyOnPage().changeLink('hospitalId').click()
    AddHospitalDetails.verifyOnPage().hospitalId().should('have.value', 'NEWH')
    enterDetails({ hospitalId: 'NEWM', hospitalName: 'Changed Hospital Name', description: 'Changed description' })
    backOnCheckAnswers().value('hospitalName').should('contain.text', 'Changed Hospital Name')

    AddHospitalCheckAnswers.verifyOnPage().changeLink('highSecurity').click()
    AddHospitalHighSecurity.verifyOnPage().option('true').should('be.checked')
    selectHighSecurity('false')
    backOnCheckAnswers().value('highSecurity').should('contain.text', 'No')

    AddHospitalCheckAnswers.verifyOnPage().changeLink('area').click()
    const area = AddHospitalReferenceData.verifyOnPage('area')
    area.input().should('have.value', 'South Yorkshire')
    area.code().should('have.value', 'SY')
    selectReference('area', { search: 'West', code: 'SW', description: 'South West' })
    backOnCheckAnswers().value('area').should('contain.text', 'South West')

    AddHospitalCheckAnswers.verifyOnPage().createHospitalButton().click()
    HospitalDetails.verifyOnPage('Changed Hospital Name')
    createdHospitals().should('deep.equal', [
      {
        ...fullPayload,
        hospitalId: 'NEWM',
        hospitalName: 'Changed Hospital Name',
        description: 'Changed description',
        highSecurity: false,
        areaCode: 'SW',
      },
    ])
  })

  it('will preserve answers when navigating back and can be cancelled', () => {
    startJourney()
    enterDetails(fullAnswers)
    selectHighSecurity('true')
    AddHospitalCjitCode.verifyOnPage().backLink().click()
    AddHospitalHighSecurity.verifyOnPage().checked().should('have.value', 'true')
    AddHospitalHighSecurity.verifyOnPage().backLink().click()
    const details = AddHospitalDetails.verifyOnPage()
    details.hospitalId().should('have.value', 'NEWH')
    details.hospitalName().should('have.value', 'New Hospital')

    details.cancelButton().click()
    AllHospitals.verifyOnPage()
    createdHospitals().should('be.empty')
  })

  it('will validate hospital details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddHospitalDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.hospitalIdError().should('be.visible')
    details.hospitalNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.hospitalId().clear().type('A')
    details.hospitalName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.continueButton().click()

    details = AddHospitalDetails.verifyOnPage()
    details.hospitalIdError().should('be.visible')
    details.hospitalNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.hospitalId().should('have.value', 'A')

    enterDetails({ hospitalId: 'NEWH', hospitalName: 'N'.repeat(40) })
    AddHospitalHighSecurity.verifyOnPage()
  })

  it('will reject an id already in use and show the agency name', () => {
    startJourney()
    enterDetails({ hospitalId: existingHospital.hospitalId, hospitalName: 'Duplicate Hospital' })

    const details = AddHospitalDetails.verifyOnPage()
    const message = `This hospital ID is already used by ${existingHospital.hospitalName}`
    details.hospitalIdError().should('contain.text', message)
    details.errorSummary().should('contain.text', message)
    details.hospitalName().should('have.value', 'Duplicate Hospital')
    createdHospitals().should('be.empty')
  })

  it('will validate high security, CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    AddHospitalHighSecurity.verifyOnPage().continueButton().click()
    AddHospitalHighSecurity.verifyOnPage()
      .error()
      .should('contain.text', 'Select whether the hospital is high security')
    selectHighSecurity('true')

    const cjit = AddHospitalCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', '12345678')
    cjit.continueButton().click()
    AddHospitalCjitCode.verifyOnPage().error().should('contain.text', 'CJIT code must be 7 characters or fewer')
    enterCjitCode('1234567')

    const area = AddHospitalReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    AddHospitalReferenceData.verifyOnPage('area')
      .error()
      .should('contain.text', 'Select a valid area from the suggestions')
  })

  it('will redirect to the first incomplete step when skipping ahead', () => {
    startJourney()
    cy.get<string>('@journeyId').then(id => {
      cy.visit(`/hospital-register/create/${id}/check-answers`)
    })
    AddHospitalDetails.verifyOnPage()
  })

  it('will show an API error on check answers and keep the answers', () => {
    cy.task('stubCreateHospitalError', 'Hospital could not be created')
    startJourney()
    completeJourney(fullAnswers)
    AddHospitalCheckAnswers.verifyOnPage().createHospitalButton().click()

    const checkAnswers = AddHospitalCheckAnswers.verifyOnPage()
    checkAnswers.errorSummary().should('contain.text', 'Hospital could not be created')
    checkAnswers.value('hospitalName').should('contain.text', 'New Hospital')
  })
})
