import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllProbationOffices from '../pages/probation-office-register/allProbationOffices'
import ProbationOfficeDetails from '../pages/probation-office-register/probationOfficeDetails'
import {
  AddProbationOfficeCheckAnswers,
  AddProbationOfficeAccessibleAccess,
  AddProbationOfficeCjitCode,
  AddProbationOfficeDetails,
  AddProbationOfficeReferenceData,
  ReferenceField,
} from '../pages/probation-office-register/addProbationOffice'
import probationOfficeData from '../../server/routes/testutils/mockProbationOfficeData'
import { ProbationOffice } from '../../server/@types/prisonRegister'

const existingOffice = probationOfficeData.probationOffice({
  probationOfficeId: 'SHFPO',
  probationOfficeName: 'Sheffield Probation Office',
})

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  probationOfficeId: string
  probationOfficeName: string
  description?: string
  contact?: string
  cjitCode?: string
  accessibleAccess?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  probationOfficeId: 'NEWPO',
  probationOfficeName: 'New Probation Office',
  description: 'A brand new probation office',
  contact: 'Front desk',
  cjitCode: 'C00NW00',
  accessibleAccess: 'WHEELCHAIR_ACCESS',
  area: { search: 'South', code: 'SY', description: 'South Yorkshire' },
  region: { search: 'North', code: 'NE', description: 'North East' },
  geographicalArea: { search: 'West', code: 'SW', description: 'South West' },
  localAuthority: { search: 'Leeds', code: 'LEED', description: 'Leeds' },
  payrollRegion: { search: 'North', code: 'NE', description: 'North East' },
}

const fullPayload = {
  probationOfficeId: 'NEWPO',
  probationOfficeName: 'New Probation Office',
  description: 'A brand new probation office',
  contact: 'Front desk',
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

const createdOffice = (probationOfficeId: string, probationOfficeName: string): ProbationOffice =>
  probationOfficeData.probationOffice({
    probationOfficeId,
    probationOfficeName,
    active: true,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  })

const createdOffices = () => cy.task('getCreatedProbationOffices')

const stubNewOffice = (probationOfficeId: string, probationOfficeName: string) => {
  const office = createdOffice(probationOfficeId, probationOfficeName)
  cy.task('stubProbationOfficeIdAvailable', office)
  cy.task('stubCreateProbationOffice', office)
}

const journeyUrl = (step: string) =>
  cy.get<string>('@journeyId').then(id => `/probation-office-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/probation-office-register')
  AllProbationOffices.verifyOnPage().addProbationOfficeLink().click()
  cy.location('pathname')
    .should('match', /^\/probation-office-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddProbationOfficeDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (
  answers: Pick<Answers, 'probationOfficeId' | 'probationOfficeName' | 'description' | 'contact'>,
) => {
  const page = AddProbationOfficeDetails.verifyOnPage()
  typeOrClear(page.probationOfficeId, answers.probationOfficeId)
  typeOrClear(page.probationOfficeName, answers.probationOfficeName)
  typeOrClear(page.description, answers.description)
  typeOrClear(page.contact, answers.contact)
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddProbationOfficeCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectAccessibleAccess = (value?: string) => {
  const page = AddProbationOfficeAccessibleAccess.verifyOnPage()
  if (value) page.option(value).check()
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddProbationOfficeReferenceData.verifyOnPage(field)
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
  selectAccessibleAccess(answers.accessibleAccess)
  referenceFields.forEach(field => selectReference(field, answers[field]))
  return AddProbationOfficeCheckAnswers.verifyOnPage()
}

context('Probation office register - add probation office', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetProbationOffices', [existingOffice])
    cy.task('stubGetProbationOffice', existingOffice)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingOffice.probationOfficeId,
      name: existingOffice.probationOfficeName,
      legacyType: 'PROBATION_OFFICE',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewOffice('NEWPO', 'New Probation Office')
    cy.signIn()
  })

  it('will add a probation office with every field and show the created office', () => {
    cy.visit('/probation-office-register')
    AllProbationOffices.verifyOnPage()
      .addProbationOfficeLink()
      .should('have.attr', 'href', '/probation-office-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('probationOfficeId').should('contain.text', 'NEWPO')
    checkAnswers.value('probationOfficeName').should('contain.text', 'New Probation Office')
    checkAnswers.value('description').should('contain.text', 'A brand new probation office')
    checkAnswers.value('contact').should('contain.text', 'Front desk')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('accessibleAccess').should('contain.text', 'Has wheelchair access')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdOffices().should('be.empty')

    checkAnswers.createProbationOfficeButton().should('contain.text', 'Confirm and add probation office').click()

    const details = ProbationOfficeDetails.verifyOnPage('New Probation Office')
    cy.url().should('include', '/probation-office-register/details?id=NEWPO&action=CREATED')
    details.confirmCreated().should('contain.text', 'Probation office has been added successfully')
    details.link('add-address-link').should('exist')
    details.link('add-phone-number-link').should('exist')
    createdOffices().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers from the create request', () => {
    stubNewOffice('NEWL', 'New Local Office')
    startJourney()
    const checkAnswers = completeJourney({ probationOfficeId: 'NEWL', probationOfficeName: 'New Local Office' })
    checkAnswers.value('cjitCode').should('contain.text', 'Not provided')
    checkAnswers.value('accessibleAccess').should('contain.text', "Don't know")
    checkAnswers.createProbationOfficeButton().click()

    ProbationOfficeDetails.verifyOnPage('New Local Office')
    createdOffices().should('deep.equal', [
      {
        probationOfficeId: 'NEWL',
        probationOfficeName: 'New Local Office',
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
      return AddProbationOfficeCheckAnswers.verifyOnPage()
    }

    AddProbationOfficeCheckAnswers.verifyOnPage().changeLink('probationOfficeId').click()
    AddProbationOfficeDetails.verifyOnPage().probationOfficeId().should('have.value', 'NEWPO')
    enterDetails({
      probationOfficeId: 'NEWM',
      probationOfficeName: 'Changed Office Name',
      description: 'Changed description',
      contact: 'Front desk',
    })
    backOnCheckAnswers().value('probationOfficeName').should('contain.text', 'Changed Office Name')

    AddProbationOfficeCheckAnswers.verifyOnPage().changeLink('area').click()
    const area = AddProbationOfficeReferenceData.verifyOnPage('area')
    area.input().should('have.value', 'South Yorkshire')
    area.code().should('have.value', 'SY')
    selectReference('area', { search: 'West', code: 'SW', description: 'South West' })
    backOnCheckAnswers().value('area').should('contain.text', 'South West')

    AddProbationOfficeCheckAnswers.verifyOnPage().createProbationOfficeButton().click()
    ProbationOfficeDetails.verifyOnPage('Changed Office Name')
    createdOffices().should('deep.equal', [
      {
        ...fullPayload,
        probationOfficeId: 'NEWM',
        probationOfficeName: 'Changed Office Name',
        description: 'Changed description',
        areaCode: 'SW',
      },
    ])
  })

  it('will preserve answers when navigating back and can be cancelled', () => {
    startJourney()
    enterDetails(fullAnswers)
    AddProbationOfficeCjitCode.verifyOnPage().backLink().click()
    const details = AddProbationOfficeDetails.verifyOnPage()
    details.probationOfficeId().should('have.value', 'NEWPO')
    details.probationOfficeName().should('have.value', 'New Probation Office')

    details.cancelButton().click()
    AllProbationOffices.verifyOnPage()
    createdOffices().should('be.empty')
  })

  it('will validate probation office details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddProbationOfficeDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.probationOfficeIdError().should('be.visible')
    details.probationOfficeNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.probationOfficeId().clear().type('A')
    details.probationOfficeName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.contact().invoke('val', 'C'.repeat(81))
    details.continueButton().click()

    details = AddProbationOfficeDetails.verifyOnPage()
    details.probationOfficeIdError().should('be.visible')
    details.probationOfficeNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.contactError().should('be.visible')
    details.probationOfficeId().should('have.value', 'A')

    enterDetails({ probationOfficeId: 'NEWPO', probationOfficeName: 'N'.repeat(40) })
    AddProbationOfficeCjitCode.verifyOnPage()
  })

  it('will reject an id already in use and show the agency name', () => {
    startJourney()
    enterDetails({
      probationOfficeId: existingOffice.probationOfficeId,
      probationOfficeName: 'Duplicate Office',
    })

    const details = AddProbationOfficeDetails.verifyOnPage()
    const message = `This probation office ID is already used by ${existingOffice.probationOfficeName}`
    details.probationOfficeIdError().should('contain.text', message)
    details.errorSummary().should('contain.text', message)
    details.probationOfficeName().should('have.value', 'Duplicate Office')
    createdOffices().should('be.empty')
  })

  it('will validate CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    const cjit = AddProbationOfficeCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', '12345678')
    cjit.continueButton().click()
    AddProbationOfficeCjitCode.verifyOnPage().error().should('contain.text', 'CJIT code must be 7 characters or fewer')
    enterCjitCode('1234567')
    selectAccessibleAccess()

    const area = AddProbationOfficeReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    AddProbationOfficeReferenceData.verifyOnPage('area')
      .error()
      .should('contain.text', 'Select a valid area from the suggestions')
  })

  it('will redirect to the first incomplete step when skipping ahead', () => {
    startJourney()
    cy.get<string>('@journeyId').then(id => {
      cy.visit(`/probation-office-register/create/${id}/check-answers`)
    })
    AddProbationOfficeDetails.verifyOnPage()
  })

  it('will show an API error on check answers and keep the answers', () => {
    cy.task('stubCreateProbationOfficeError', 'Probation office could not be created')
    startJourney()
    completeJourney(fullAnswers)
    AddProbationOfficeCheckAnswers.verifyOnPage().createProbationOfficeButton().click()

    const checkAnswers = AddProbationOfficeCheckAnswers.verifyOnPage()
    checkAnswers.errorSummary().should('contain.text', 'Probation office could not be created')
    checkAnswers.value('probationOfficeName').should('contain.text', 'New Probation Office')
  })
})
