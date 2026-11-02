import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllOtherAgencies from '../pages/other-agency-register/allOtherAgencies'
import OtherAgencyDetails from '../pages/other-agency-register/otherAgencyDetails'
import {
  AddOtherAgencyCheckAnswers,
  AddOtherAgencyAccessibleAccess,
  AddOtherAgencyType,
  AddOtherAgencyCjitCode,
  AddOtherAgencyDetails,
  AddOtherAgencyReferenceData,
  ReferenceField,
} from '../pages/other-agency-register/addOtherAgency'
import otherAgencyData from '../../server/routes/testutils/mockOtherAgencyData'
import { OtherAgency } from '../../server/@types/prisonRegister'

const existingOffice = otherAgencyData.otherAgency({
  agencyId: 'SHFAG',
  agencyName: 'Sheffield Agency',
})

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  agencyId: string
  agencyName: string
  description?: string
  agencyType?: string
  cjitCode?: string
  accessibleAccess?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  agencyId: 'NEWAG',
  agencyName: 'New Agency',
  description: 'A brand new other agency',
  agencyType: 'AIRPORT',
  cjitCode: 'C00NW00',
  accessibleAccess: 'WHEELCHAIR_ACCESS',
  area: { search: 'South', code: 'SY', description: 'South Yorkshire' },
  region: { search: 'North', code: 'NE', description: 'North East' },
  geographicalArea: { search: 'West', code: 'SW', description: 'South West' },
  localAuthority: { search: 'Leeds', code: 'LEED', description: 'Leeds' },
  payrollRegion: { search: 'North', code: 'NE', description: 'North East' },
}

const fullPayload = {
  agencyId: 'NEWAG',
  agencyName: 'New Agency',
  description: 'A brand new other agency',
  otherAgencyType: 'AIRPORT',
  active: true,
  accessibleAccess: 'WHEELCHAIR_ACCESS',
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

const createdOffice = (agencyId: string, agencyName: string): OtherAgency =>
  otherAgencyData.otherAgency({
    agencyId,
    agencyName,
    active: true,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  })

const createdOffices = () => cy.task('getCreatedOtherAgency')

const stubNewOffice = (agencyId: string, agencyName: string) => {
  const office = createdOffice(agencyId, agencyName)
  cy.task('stubOtherAgencyIdAvailable', office)
  cy.task('stubCreateOtherAgency', office)
}

const journeyUrl = (step: string) =>
  cy.get<string>('@journeyId').then(id => `/other-agency-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/other-agency-register')
  AllOtherAgencies.verifyOnPage().addOtherAgencyLink().click()
  cy.location('pathname')
    .should('match', /^\/other-agency-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddOtherAgencyDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (answers: Pick<Answers, 'agencyId' | 'agencyName' | 'description'>) => {
  const page = AddOtherAgencyDetails.verifyOnPage()
  typeOrClear(page.agencyId, answers.agencyId)
  typeOrClear(page.agencyName, answers.agencyName)
  typeOrClear(page.description, answers.description)
  page.continueButton().click()
}

const selectAgencyType = (value?: string) => {
  const page = AddOtherAgencyType.verifyOnPage()
  if (value) page.option(value).check()
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddOtherAgencyCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectAccessibleAccess = (value?: string) => {
  const page = AddOtherAgencyAccessibleAccess.verifyOnPage()
  if (value) page.option(value).check()
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddOtherAgencyReferenceData.verifyOnPage(field)
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
  selectAgencyType(answers.agencyType)
  enterCjitCode(answers.cjitCode)
  selectAccessibleAccess(answers.accessibleAccess)
  referenceFields.forEach(field => selectReference(field, answers[field]))
  return AddOtherAgencyCheckAnswers.verifyOnPage()
}

context('Other agency register - add other agency', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetOtherAgencies', [existingOffice])
    cy.task('stubGetOtherAgency', existingOffice)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingOffice.agencyId,
      name: existingOffice.agencyName,
      legacyType: 'OTHER',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewOffice('NEWAG', 'New Agency')
    cy.signIn()
  })

  it('will add an other agency with every field and show the created office', () => {
    cy.visit('/other-agency-register')
    AllOtherAgencies.verifyOnPage()
      .addOtherAgencyLink()
      .should('have.attr', 'href', '/other-agency-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('agencyId').should('contain.text', 'NEWAG')
    checkAnswers.value('agencyName').should('contain.text', 'New Agency')
    checkAnswers.value('description').should('contain.text', 'A brand new other agency')
    checkAnswers.value('agencyType').should('contain.text', 'Airport')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('accessibleAccess').should('contain.text', 'Has wheelchair access')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdOffices().should('be.empty')

    checkAnswers.createOtherAgencyButton().should('contain.text', 'Confirm and add other agency').click()

    const details = OtherAgencyDetails.verifyOnPage('New Agency')
    cy.url().should('include', '/other-agency-register/details?id=NEWAG&action=CREATED')
    details.confirmCreated().should('contain.text', 'Other agency has been added successfully')
    details.link('add-address-link').should('exist')
    details.link('add-phone-number-link').should('exist')
    createdOffices().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers from the create request', () => {
    stubNewOffice('NEWL', 'New Local Office')
    startJourney()
    const checkAnswers = completeJourney({ agencyId: 'NEWL', agencyName: 'New Local Office', agencyType: 'PECS' })
    checkAnswers.value('cjitCode').should('contain.text', 'Not provided')
    checkAnswers.value('accessibleAccess').should('contain.text', "Don't know")
    checkAnswers.createOtherAgencyButton().click()

    OtherAgencyDetails.verifyOnPage('New Local Office')
    createdOffices().should('deep.equal', [
      {
        agencyId: 'NEWL',
        agencyName: 'New Local Office',
        otherAgencyType: 'PECS',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      },
    ])
  })

  it('will prefill answers from change links and return directly to check answers', () => {
    stubNewOffice('NEWM', 'Changed Office Name')
    startJourney()
    completeJourney(fullAnswers)
    const backOnCheckAnswers = () => {
      journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))
      return AddOtherAgencyCheckAnswers.verifyOnPage()
    }

    AddOtherAgencyCheckAnswers.verifyOnPage().changeLink('agencyId').click()
    AddOtherAgencyDetails.verifyOnPage().agencyId().should('have.value', 'NEWAG')
    enterDetails({
      agencyId: 'NEWM',
      agencyName: 'Changed Office Name',
      description: 'Changed description',
    })
    backOnCheckAnswers().value('agencyName').should('contain.text', 'Changed Office Name')

    AddOtherAgencyCheckAnswers.verifyOnPage().changeLink('area').click()
    const area = AddOtherAgencyReferenceData.verifyOnPage('area')
    area.input().should('have.value', 'South Yorkshire')
    area.code().should('have.value', 'SY')
    selectReference('area', { search: 'West', code: 'SW', description: 'South West' })
    backOnCheckAnswers().value('area').should('contain.text', 'South West')

    AddOtherAgencyCheckAnswers.verifyOnPage().createOtherAgencyButton().click()
    OtherAgencyDetails.verifyOnPage('Changed Office Name')
    createdOffices().should('deep.equal', [
      {
        ...fullPayload,
        agencyId: 'NEWM',
        agencyName: 'Changed Office Name',
        description: 'Changed description',
        areaCode: 'SW',
      },
    ])
  })

  it('will preserve answers when navigating back and can be cancelled', () => {
    startJourney()
    enterDetails(fullAnswers)
    AddOtherAgencyType.verifyOnPage().backLink().click()
    const details = AddOtherAgencyDetails.verifyOnPage()
    details.agencyId().should('have.value', 'NEWAG')
    details.agencyName().should('have.value', 'New Agency')

    details.cancelButton().click()
    AllOtherAgencies.verifyOnPage()
    createdOffices().should('be.empty')
  })

  it('will validate other agency details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddOtherAgencyDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.agencyIdError().should('be.visible')
    details.agencyNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.agencyId().clear().type('A')
    details.agencyName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.continueButton().click()

    details = AddOtherAgencyDetails.verifyOnPage()
    details.agencyIdError().should('be.visible')
    details.agencyNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.agencyId().should('have.value', 'A')

    enterDetails({ agencyId: 'NEWAG', agencyName: 'N'.repeat(40) })
    AddOtherAgencyType.verifyOnPage()
  })

  it('will reject an id already in use and show the agency name', () => {
    startJourney()
    enterDetails({
      agencyId: existingOffice.agencyId,
      agencyName: 'Duplicate Office',
    })

    const details = AddOtherAgencyDetails.verifyOnPage()
    const message = `This agency ID is already used by ${existingOffice.agencyName}`
    details.agencyIdError().should('contain.text', message)
    details.errorSummary().should('contain.text', message)
    details.agencyName().should('have.value', 'Duplicate Office')
    createdOffices().should('be.empty')
  })

  it('will validate CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    selectAgencyType()
    AddOtherAgencyType.verifyOnPage().error().should('contain.text', 'Select an agency type')
    selectAgencyType('PECS')

    const cjit = AddOtherAgencyCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', '12345678')
    cjit.continueButton().click()
    AddOtherAgencyCjitCode.verifyOnPage().error().should('contain.text', 'CJIT code must be 7 characters or fewer')
    enterCjitCode('1234567')
    selectAccessibleAccess()

    const area = AddOtherAgencyReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    AddOtherAgencyReferenceData.verifyOnPage('area')
      .error()
      .should('contain.text', 'Select a valid area from the suggestions')
  })

  it('will redirect to the first incomplete step when skipping ahead', () => {
    startJourney()
    cy.get<string>('@journeyId').then(id => {
      cy.visit(`/other-agency-register/create/${id}/check-answers`)
    })
    AddOtherAgencyDetails.verifyOnPage()
  })

  it('will show an API error on check answers and keep the answers', () => {
    cy.task('stubCreateOtherAgencyError', 'Other agency could not be created')
    startJourney()
    completeJourney(fullAnswers)
    AddOtherAgencyCheckAnswers.verifyOnPage().createOtherAgencyButton().click()

    const checkAnswers = AddOtherAgencyCheckAnswers.verifyOnPage()
    checkAnswers.errorSummary().should('contain.text', 'Other agency could not be created')
    checkAnswers.value('agencyName').should('contain.text', 'New Agency')
  })
})
