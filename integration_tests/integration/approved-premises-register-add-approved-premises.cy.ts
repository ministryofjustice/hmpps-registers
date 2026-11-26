import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllApprovedPremises from '../pages/approved-premises-register/allApprovedPremises'
import ApprovedPremisesDetails from '../pages/approved-premises-register/approvedPremisesDetails'
import {
  AddApprovedPremisesCheckAnswers,
  AddApprovedPremisesAccessibleAccess,
  AddApprovedPremisesCjitCode,
  AddApprovedPremisesDetails,
  AddApprovedPremisesReferenceData,
  ReferenceField,
} from '../pages/approved-premises-register/addApprovedPremises'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'
import { ApprovedPremises } from '../../server/@types/prisonRegister'

const existingOffice = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFAP',
  approvedPremisesName: 'Sheffield Approved Premises',
})

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  approvedPremisesId: string
  approvedPremisesName: string
  description?: string
  contact?: string
  cjitCode?: string
  accessibleAccess?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  approvedPremisesId: 'NEWPO',
  approvedPremisesName: 'New Approved Premises',
  description: 'A brand new approved premises',
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
  approvedPremisesId: 'NEWPO',
  approvedPremisesName: 'New Approved Premises',
  description: 'A brand new approved premises',
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

const createdOffice = (approvedPremisesId: string, approvedPremisesName: string): ApprovedPremises =>
  approvedPremisesData.approvedPremises({
    approvedPremisesId,
    approvedPremisesName,
    active: true,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  })

const createdOffices = () => cy.task('getCreatedApprovedPremises')

const stubNewOffice = (approvedPremisesId: string, approvedPremisesName: string) => {
  const office = createdOffice(approvedPremisesId, approvedPremisesName)
  cy.task('stubApprovedPremisesIdAvailable', office)
  cy.task('stubCreateApprovedPremises', office)
}

const journeyUrl = (step: string) =>
  cy.get<string>('@journeyId').then(id => `/approved-premises-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/approved-premises-register')
  AllApprovedPremises.verifyOnPage().addApprovedPremisesLink().click()
  cy.location('pathname')
    .should('match', /^\/approved-premises-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddApprovedPremisesDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (
  answers: Pick<Answers, 'approvedPremisesId' | 'approvedPremisesName' | 'description' | 'contact'>,
) => {
  const page = AddApprovedPremisesDetails.verifyOnPage()
  typeOrClear(page.approvedPremisesId, answers.approvedPremisesId)
  typeOrClear(page.approvedPremisesName, answers.approvedPremisesName)
  typeOrClear(page.description, answers.description)
  typeOrClear(page.contact, answers.contact)
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddApprovedPremisesCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectAccessibleAccess = (value?: string) => {
  const page = AddApprovedPremisesAccessibleAccess.verifyOnPage()
  if (value) page.option(value).check()
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddApprovedPremisesReferenceData.verifyOnPage(field)
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
  return AddApprovedPremisesCheckAnswers.verifyOnPage()
}

context('Approved premises register - add approved premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [existingOffice])
    cy.task('stubGetApprovedPremises', existingOffice)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingOffice.approvedPremisesId,
      name: existingOffice.approvedPremisesName,
      legacyType: 'APPROVED_PREMISES',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewOffice('NEWPO', 'New Approved Premises')
    cy.signIn()
  })

  it('will add a approved premises with every field and show the created office', () => {
    cy.visit('/approved-premises-register')
    AllApprovedPremises.verifyOnPage()
      .addApprovedPremisesLink()
      .should('have.attr', 'href', '/approved-premises-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('approvedPremisesId').should('contain.text', 'NEWPO')
    checkAnswers.value('approvedPremisesName').should('contain.text', 'New Approved Premises')
    checkAnswers.value('description').should('contain.text', 'A brand new approved premises')
    checkAnswers.value('contact').should('contain.text', 'Front desk')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('accessibleAccess').should('contain.text', 'Has wheelchair access')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdOffices().should('be.empty')

    checkAnswers.createApprovedPremisesButton().should('contain.text', 'Confirm and add approved premises').click()

    const details = ApprovedPremisesDetails.verifyOnPage('New Approved Premises')
    cy.url().should('include', '/approved-premises-register/details?id=NEWPO&action=CREATED')
    details.confirmCreated().should('contain.text', 'Approved premises has been added successfully')
    details.link('add-address-link').should('exist')
    details.link('add-phone-number-link').should('exist')
    createdOffices().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers from the create request', () => {
    stubNewOffice('NEWL', 'New Local Office')
    startJourney()
    const checkAnswers = completeJourney({ approvedPremisesId: 'NEWL', approvedPremisesName: 'New Local Office' })
    checkAnswers.value('cjitCode').should('contain.text', 'Not provided')
    checkAnswers.value('accessibleAccess').should('contain.text', "Don't know")
    checkAnswers.createApprovedPremisesButton().click()

    ApprovedPremisesDetails.verifyOnPage('New Local Office')
    createdOffices().should('deep.equal', [
      {
        approvedPremisesId: 'NEWL',
        approvedPremisesName: 'New Local Office',
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
      return AddApprovedPremisesCheckAnswers.verifyOnPage()
    }

    AddApprovedPremisesCheckAnswers.verifyOnPage().changeLink('approvedPremisesId').click()
    AddApprovedPremisesDetails.verifyOnPage().approvedPremisesId().should('have.value', 'NEWPO')
    enterDetails({
      approvedPremisesId: 'NEWM',
      approvedPremisesName: 'Changed Office Name',
      description: 'Changed description',
      contact: 'Front desk',
    })
    backOnCheckAnswers().value('approvedPremisesName').should('contain.text', 'Changed Office Name')

    AddApprovedPremisesCheckAnswers.verifyOnPage().changeLink('area').click()
    const area = AddApprovedPremisesReferenceData.verifyOnPage('area')
    area.input().should('have.value', 'South Yorkshire')
    area.code().should('have.value', 'SY')
    selectReference('area', { search: 'West', code: 'SW', description: 'South West' })
    backOnCheckAnswers().value('area').should('contain.text', 'South West')

    AddApprovedPremisesCheckAnswers.verifyOnPage().createApprovedPremisesButton().click()
    ApprovedPremisesDetails.verifyOnPage('Changed Office Name')
    createdOffices().should('deep.equal', [
      {
        ...fullPayload,
        approvedPremisesId: 'NEWM',
        approvedPremisesName: 'Changed Office Name',
        description: 'Changed description',
        areaCode: 'SW',
      },
    ])
  })

  it('will preserve answers when navigating back and can be cancelled', () => {
    startJourney()
    enterDetails(fullAnswers)
    AddApprovedPremisesCjitCode.verifyOnPage().backLink().click()
    const details = AddApprovedPremisesDetails.verifyOnPage()
    details.approvedPremisesId().should('have.value', 'NEWPO')
    details.approvedPremisesName().should('have.value', 'New Approved Premises')

    details.cancelButton().click()
    AllApprovedPremises.verifyOnPage()
    createdOffices().should('be.empty')
  })

  it('will validate approved premises details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddApprovedPremisesDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.approvedPremisesIdError().should('be.visible')
    details.approvedPremisesNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.approvedPremisesId().clear().type('A')
    details.approvedPremisesName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.contact().invoke('val', 'C'.repeat(81))
    details.continueButton().click()

    details = AddApprovedPremisesDetails.verifyOnPage()
    details.approvedPremisesIdError().should('be.visible')
    details.approvedPremisesNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.contactError().should('be.visible')
    details.approvedPremisesId().should('have.value', 'A')

    enterDetails({ approvedPremisesId: 'NEWPO', approvedPremisesName: 'N'.repeat(40) })
    AddApprovedPremisesCjitCode.verifyOnPage()
  })

  it('will reject an id already in use and show the agency name', () => {
    startJourney()
    enterDetails({
      approvedPremisesId: existingOffice.approvedPremisesId,
      approvedPremisesName: 'Duplicate Office',
    })

    const details = AddApprovedPremisesDetails.verifyOnPage()
    const message = `This approved premises ID is already used by ${existingOffice.approvedPremisesName}`
    details.approvedPremisesIdError().should('contain.text', message)
    details.errorSummary().should('contain.text', message)
    details.approvedPremisesName().should('have.value', 'Duplicate Office')
    createdOffices().should('be.empty')
  })

  it('will validate CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    const cjit = AddApprovedPremisesCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', '12345678')
    cjit.continueButton().click()
    AddApprovedPremisesCjitCode.verifyOnPage().error().should('contain.text', 'CJIT code must be 7 characters or fewer')
    enterCjitCode('1234567')
    selectAccessibleAccess()

    const area = AddApprovedPremisesReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    AddApprovedPremisesReferenceData.verifyOnPage('area')
      .error()
      .should('contain.text', 'Select a valid area from the suggestions')
  })

  it('will redirect to the first incomplete step when skipping ahead', () => {
    startJourney()
    cy.get<string>('@journeyId').then(id => {
      cy.visit(`/approved-premises-register/create/${id}/check-answers`)
    })
    AddApprovedPremisesDetails.verifyOnPage()
  })

  it('will show an API error on check answers and keep the answers', () => {
    cy.task('stubCreateApprovedPremisesError', 'Approved premises could not be created')
    startJourney()
    completeJourney(fullAnswers)
    AddApprovedPremisesCheckAnswers.verifyOnPage().createApprovedPremisesButton().click()

    const checkAnswers = AddApprovedPremisesCheckAnswers.verifyOnPage()
    checkAnswers.errorSummary().should('contain.text', 'Approved premises could not be created')
    checkAnswers.value('approvedPremisesName').should('contain.text', 'New Approved Premises')
  })
})
