import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllPoliceCustodySuites from '../pages/police-custody-suite-register/allPoliceCustodySuites'
import PoliceCustodySuiteDetails from '../pages/police-custody-suite-register/policeCustodySuiteDetails'
import {
  AddPoliceCustodySuiteCheckAnswers,
  AddPoliceCustodySuiteCjitCode,
  AddPoliceCustodySuiteDetails,
  AddPoliceCustodySuiteReferenceData,
  ReferenceField,
} from '../pages/police-custody-suite-register/addPoliceCustodySuite'
import policeCustodySuiteData from '../../server/routes/testutils/mockPoliceCustodySuiteData'
import { PoliceCustodySuite } from '../../server/@types/prisonRegister'

const existingSuite = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'SHFPCS',
  policeCustodySuiteName: 'Sheffield Police Custody Suite',
})

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  policeCustodySuiteId: string
  policeCustodySuiteName: string
  description?: string
  cjitCode?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  policeCustodySuiteId: 'NEWPCS',
  policeCustodySuiteName: 'New Police Custody Suite',
  description: 'A brand new police custody suite',
  cjitCode: 'C00NW00',
  area: { search: 'South', code: 'SY', description: 'South Yorkshire' },
  region: { search: 'North', code: 'NE', description: 'North East' },
  geographicalArea: { search: 'West', code: 'SW', description: 'South West' },
  localAuthority: { search: 'Leeds', code: 'LEED', description: 'Leeds' },
  payrollRegion: { search: 'North', code: 'NE', description: 'North East' },
}

const fullPayload = {
  policeCustodySuiteId: 'NEWPCS',
  policeCustodySuiteName: 'New Police Custody Suite',
  description: 'A brand new police custody suite',
  active: true,
  cjitCode: 'C00NW00',
  areaCode: 'SY',
  regionCode: 'NE',
  geographicalAreaCode: 'SW',
  localAuthorityCode: 'LEED',
  payrollRegionCode: 'NE',
  addresses: [],
  emailAddresses: [],
  phoneNumbers: [],
}

const createdSuite = (policeCustodySuiteId: string, policeCustodySuiteName: string): PoliceCustodySuite =>
  policeCustodySuiteData.policeCustodySuite({
    policeCustodySuiteId,
    policeCustodySuiteName,
    active: true,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  })

const createdSuites = () => cy.task('getCreatedPoliceCustodySuites')

const stubNewSuite = (policeCustodySuiteId: string, policeCustodySuiteName: string) => {
  const suite = createdSuite(policeCustodySuiteId, policeCustodySuiteName)
  cy.task('stubPoliceCustodySuiteIdAvailable', suite)
  cy.task('stubCreatePoliceCustodySuite', suite)
}

const journeyUrl = (step: string) =>
  cy.get<string>('@journeyId').then(id => `/police-custody-suite-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/police-custody-suite-register')
  AllPoliceCustodySuites.verifyOnPage().addPoliceCustodySuiteLink().click()
  cy.location('pathname')
    .should('match', /^\/police-custody-suite-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddPoliceCustodySuiteDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (answers: Pick<Answers, 'policeCustodySuiteId' | 'policeCustodySuiteName' | 'description'>) => {
  const page = AddPoliceCustodySuiteDetails.verifyOnPage()
  typeOrClear(page.policeCustodySuiteId, answers.policeCustodySuiteId)
  typeOrClear(page.policeCustodySuiteName, answers.policeCustodySuiteName)
  typeOrClear(page.description, answers.description)
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddPoliceCustodySuiteCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddPoliceCustodySuiteReferenceData.verifyOnPage(field)
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
  enterCjitCode(answers.cjitCode)
  referenceFields.forEach(field => selectReference(field, answers[field]))
  return AddPoliceCustodySuiteCheckAnswers.verifyOnPage()
}

context('Police custody suite register - add police custody suite', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPoliceCustodySuites', [existingSuite])
    cy.task('stubGetPoliceCustodySuite', existingSuite)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingSuite.policeCustodySuiteId,
      name: existingSuite.policeCustodySuiteName,
      legacyType: 'POLICE_CUSTODY_SUITE',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewSuite('NEWPCS', 'New Police Custody Suite')
    cy.signIn()
  })

  it('will add a police custody suite with every field and show the created suite', () => {
    cy.visit('/police-custody-suite-register')
    AllPoliceCustodySuites.verifyOnPage()
      .addPoliceCustodySuiteLink()
      .should('have.attr', 'href', '/police-custody-suite-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('policeCustodySuiteId').should('contain.text', 'NEWPCS')
    checkAnswers.value('policeCustodySuiteName').should('contain.text', 'New Police Custody Suite')
    checkAnswers.value('description').should('contain.text', 'A brand new police custody suite')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdSuites().should('be.empty')

    checkAnswers.createPoliceCustodySuiteButton().should('contain.text', 'Confirm and add police custody suite').click()

    const details = PoliceCustodySuiteDetails.verifyOnPage('New Police Custody Suite')
    cy.url().should('include', '/police-custody-suite-register/details?id=NEWPCS&action=CREATED')
    details.confirmCreated().should('contain.text', 'Police custody suite has been added successfully')
    details.link('add-address-link').should('exist')
    details.link('add-phone-number-link').should('exist')
    createdSuites().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers from the create request', () => {
    stubNewSuite('NEWL', 'New Local Suite')
    startJourney()
    const checkAnswers = completeJourney({ policeCustodySuiteId: 'NEWL', policeCustodySuiteName: 'New Local Suite' })
    checkAnswers.value('cjitCode').should('contain.text', 'Not provided')
    checkAnswers.createPoliceCustodySuiteButton().click()

    PoliceCustodySuiteDetails.verifyOnPage('New Local Suite')
    createdSuites().should('deep.equal', [
      {
        policeCustodySuiteId: 'NEWL',
        policeCustodySuiteName: 'New Local Suite',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      },
    ])
  })

  it('will prefill answers from change links and return directly to check answers', () => {
    stubNewSuite('NEWM', 'Changed Suite Name')
    startJourney()
    completeJourney(fullAnswers)
    const backOnCheckAnswers = () => {
      journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))
      return AddPoliceCustodySuiteCheckAnswers.verifyOnPage()
    }

    AddPoliceCustodySuiteCheckAnswers.verifyOnPage().changeLink('policeCustodySuiteId').click()
    AddPoliceCustodySuiteDetails.verifyOnPage().policeCustodySuiteId().should('have.value', 'NEWPCS')
    enterDetails({
      policeCustodySuiteId: 'NEWM',
      policeCustodySuiteName: 'Changed Suite Name',
      description: 'Changed description',
    })
    backOnCheckAnswers().value('policeCustodySuiteName').should('contain.text', 'Changed Suite Name')

    AddPoliceCustodySuiteCheckAnswers.verifyOnPage().changeLink('area').click()
    const area = AddPoliceCustodySuiteReferenceData.verifyOnPage('area')
    area.input().should('have.value', 'South Yorkshire')
    area.code().should('have.value', 'SY')
    selectReference('area', { search: 'West', code: 'SW', description: 'South West' })
    backOnCheckAnswers().value('area').should('contain.text', 'South West')

    AddPoliceCustodySuiteCheckAnswers.verifyOnPage().createPoliceCustodySuiteButton().click()
    PoliceCustodySuiteDetails.verifyOnPage('Changed Suite Name')
    createdSuites().should('deep.equal', [
      {
        ...fullPayload,
        policeCustodySuiteId: 'NEWM',
        policeCustodySuiteName: 'Changed Suite Name',
        description: 'Changed description',
        areaCode: 'SW',
      },
    ])
  })

  it('will preserve answers when navigating back and can be cancelled', () => {
    startJourney()
    enterDetails(fullAnswers)
    AddPoliceCustodySuiteCjitCode.verifyOnPage().backLink().click()
    const details = AddPoliceCustodySuiteDetails.verifyOnPage()
    details.policeCustodySuiteId().should('have.value', 'NEWPCS')
    details.policeCustodySuiteName().should('have.value', 'New Police Custody Suite')

    details.cancelButton().click()
    AllPoliceCustodySuites.verifyOnPage()
    createdSuites().should('be.empty')
  })

  it('will validate police custody suite details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddPoliceCustodySuiteDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.policeCustodySuiteIdError().should('be.visible')
    details.policeCustodySuiteNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.policeCustodySuiteId().clear().type('A')
    details.policeCustodySuiteName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.continueButton().click()

    details = AddPoliceCustodySuiteDetails.verifyOnPage()
    details.policeCustodySuiteIdError().should('be.visible')
    details.policeCustodySuiteNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.policeCustodySuiteId().should('have.value', 'A')

    enterDetails({ policeCustodySuiteId: 'NEWPCS', policeCustodySuiteName: 'N'.repeat(40) })
    AddPoliceCustodySuiteCjitCode.verifyOnPage()
  })

  it('will reject an id already in use and show the agency name', () => {
    startJourney()
    enterDetails({
      policeCustodySuiteId: existingSuite.policeCustodySuiteId,
      policeCustodySuiteName: 'Duplicate Suite',
    })

    const details = AddPoliceCustodySuiteDetails.verifyOnPage()
    const message = `This police custody suite ID is already used by ${existingSuite.policeCustodySuiteName}`
    details.policeCustodySuiteIdError().should('contain.text', message)
    details.errorSummary().should('contain.text', message)
    details.policeCustodySuiteName().should('have.value', 'Duplicate Suite')
    createdSuites().should('be.empty')
  })

  it('will validate CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    const cjit = AddPoliceCustodySuiteCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', '12345678')
    cjit.continueButton().click()
    AddPoliceCustodySuiteCjitCode.verifyOnPage()
      .error()
      .should('contain.text', 'CJIT code must be 7 characters or fewer')
    enterCjitCode('1234567')

    const area = AddPoliceCustodySuiteReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    AddPoliceCustodySuiteReferenceData.verifyOnPage('area')
      .error()
      .should('contain.text', 'Select a valid area from the suggestions')
  })

  it('will redirect to the first incomplete step when skipping ahead', () => {
    startJourney()
    cy.get<string>('@journeyId').then(id => {
      cy.visit(`/police-custody-suite-register/create/${id}/check-answers`)
    })
    AddPoliceCustodySuiteDetails.verifyOnPage()
  })

  it('will show an API error on check answers and keep the answers', () => {
    cy.task('stubCreatePoliceCustodySuiteError', 'Police custody suite could not be created')
    startJourney()
    completeJourney(fullAnswers)
    AddPoliceCustodySuiteCheckAnswers.verifyOnPage().createPoliceCustodySuiteButton().click()

    const checkAnswers = AddPoliceCustodySuiteCheckAnswers.verifyOnPage()
    checkAnswers.errorSummary().should('contain.text', 'Police custody suite could not be created')
    checkAnswers.value('policeCustodySuiteName').should('contain.text', 'New Police Custody Suite')
  })
})
