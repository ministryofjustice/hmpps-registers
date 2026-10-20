import { areas, regions, localAuthorities, payrollRegions } from '../mockApis/referenceData'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import {
  AddCourtAccessibleAccess,
  AddCourtCheckAnswers,
  AddCourtCjitCode,
  AddCourtDetails,
  AddCourtReferenceData,
  AddCourtType,
  CheckAnswersField,
  ReferenceField,
} from '../pages/court-register/addCourt'
import courtData from '../../server/routes/testutils/mockCourtData'
import { Court, LegacyAgencyUsage } from '../../server/@types/prisonRegister'

const existingCourt = courtData.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' })

type ReferenceAnswer = { search: string; code: string; description: string }
type Answers = {
  courtId: string
  courtName: string
  description?: string
  courtType: string
  accessibleAccess: string
  cjitCode?: string
} & Partial<Record<ReferenceField, ReferenceAnswer>>

const referenceFields: ReferenceField[] = ['area', 'region', 'geographicalArea', 'localAuthority', 'payrollRegion']

const fullAnswers: Answers = {
  courtId: 'NEWCC',
  courtName: 'New Crown Court',
  description: 'A brand new Crown Court',
  courtType: 'CC',
  accessibleAccess: 'ACCESSIBLE',
  cjitCode: 'C00NW00',
  area: { search: 'South', code: 'SY', description: 'South Yorkshire' },
  region: { search: 'North', code: 'NE', description: 'North East' },
  geographicalArea: { search: 'West', code: 'SW', description: 'South West' },
  localAuthority: { search: 'Leeds', code: 'LEED', description: 'Leeds' },
  payrollRegion: { search: 'North', code: 'NE', description: 'North East' },
}

const fullPayload = {
  courtId: 'NEWCC',
  courtName: 'New Crown Court',
  description: 'A brand new Crown Court',
  active: true,
  courtTypeCode: 'CC',
  accessibleAccess: 'ACCESSIBLE',
  cjitCode: 'C00NW00',
  areaCode: 'SY',
  regionCode: 'NE',
  geographicalAreaCode: 'SW',
  localAuthorityCode: 'LEED',
  payrollRegionCode: 'NE',
  addresses: [],
  phoneNumbers: [],
  emailAddresses: [],
}

const createdCourt = (courtId: string, courtName: string): Court =>
  courtData.court({ courtId, courtName, active: true, addresses: [], phoneNumbers: [], emailAddresses: [] })

const createdCourts = () => cy.task('getCreatedCourts')

const stubNewCourt = (courtId: string, courtName: string) => {
  const court = createdCourt(courtId, courtName)
  cy.task('stubCourtIdAvailable', court)
  cy.task('stubCreateCourt', court)
}

const journeyUrl = (step: string) => cy.get<string>('@journeyId').then(id => `/court-register/create/${id}/${step}`)

const startJourney = () => {
  cy.visit('/court-register')
  AllCourts.verifyOnPage().addCourtLink().click()
  cy.location('pathname')
    .should('match', /^\/court-register\/create\/[0-9a-f-]{36}\/details$/)
    .then(pathname => pathname.split('/')[3])
    .as('journeyId')
  return AddCourtDetails.verifyOnPage()
}

const typeOrClear = (input: () => Cypress.Chainable, value?: string) => {
  input().clear()
  if (value) input().type(value)
}

const enterDetails = (answers: Pick<Answers, 'courtId' | 'courtName' | 'description'>) => {
  const page = AddCourtDetails.verifyOnPage()
  typeOrClear(page.courtId, answers.courtId)
  typeOrClear(page.courtName, answers.courtName)
  typeOrClear(page.description, answers.description)
  page.continueButton().click()
}

const selectCourtType = (code: string) => {
  const page = AddCourtType.verifyOnPage()
  page.option(code).check()
  page.continueButton().click()
}

const selectAccessibleAccess = (value: string) => {
  const page = AddCourtAccessibleAccess.verifyOnPage()
  page.option(value).check()
  page.continueButton().click()
}

const enterCjitCode = (value?: string) => {
  const page = AddCourtCjitCode.verifyOnPage()
  typeOrClear(page.cjitCode, value)
  page.continueButton().click()
}

const selectReference = (field: ReferenceField, answer?: ReferenceAnswer) => {
  const page = AddCourtReferenceData.verifyOnPage(field)
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
  selectCourtType(answers.courtType)
  selectAccessibleAccess(answers.accessibleAccess)
  enterCjitCode(answers.cjitCode)
  referenceFields.forEach(field => selectReference(field, answers[field]))
  return AddCourtCheckAnswers.verifyOnPage()
}

context('Court register - add court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [existingCourt])
    cy.task('stubGetCourt', existingCourt)
    cy.task('stubAgencyIdUsed', {
      agencyId: existingCourt.courtId,
      name: existingCourt.courtName,
      legacyType: 'COURT',
    })
    cy.task('stubGetAreas', areas)
    cy.task('stubGetRegions', regions)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.task('stubGetPayrollRegions', payrollRegions)
    stubNewCourt('NEWCC', 'New Crown Court')
    cy.signIn()
  })

  it('will add a court with every field across the nine steps and show the created court', () => {
    cy.visit('/court-register')
    AllCourts.verifyOnPage().addCourtLink().should('have.attr', 'href', '/court-register/create/start')
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))

    checkAnswers.value('courtId').should('contain.text', 'NEWCC')
    checkAnswers.value('courtName').should('contain.text', 'New Crown Court')
    checkAnswers.value('description').should('contain.text', 'A brand new Crown Court')
    checkAnswers.value('courtType').should('contain.text', 'Crown Court')
    checkAnswers.value('cjitCode').should('contain.text', 'C00NW00')
    checkAnswers.value('area').should('contain.text', 'South Yorkshire')
    checkAnswers.value('region').should('contain.text', 'North East')
    checkAnswers.value('geographicalArea').should('contain.text', 'South West')
    checkAnswers.value('localAuthority').should('contain.text', 'Leeds')
    checkAnswers.value('payrollRegion').should('contain.text', 'North East')
    createdCourts().should('be.empty')

    checkAnswers.createCourtButton().should('contain.text', 'Confirm and add court').click()

    const details = CourtsDetails.verifyOnPage('New Crown Court')
    cy.url().should('include', '/court-register/details?id=NEWCC&action=CREATED')
    details.addAddressLink().should('exist')
    details.addPhoneNumberLink().should('exist')
    details.addEmailAddressLink().should('exist')
    createdCourts().should('deep.equal', [fullPayload])
  })

  it('will omit optional answers, including unknown accessible access, from the create request', () => {
    stubNewCourt('NEWYC', 'New Youth Court')
    startJourney()
    const checkAnswers = completeJourney({
      courtId: 'NEWYC',
      courtName: 'New Youth Court',
      courtType: 'UNK',
      accessibleAccess: 'UNKNOWN',
    })
    checkAnswers.createCourtButton().click()

    CourtsDetails.verifyOnPage('New Youth Court')
    cy.url().should('include', '/court-register/details?id=NEWYC&action=CREATED')
    createdCourts().should('deep.equal', [
      {
        courtId: 'NEWYC',
        courtName: 'New Youth Court',
        active: true,
        courtTypeCode: 'UNK',
        addresses: [],
        phoneNumbers: [],
        emailAddresses: [],
      },
    ])
  })

  it('will prefill every answer from its change link and return directly to check answers', () => {
    stubNewCourt('NEWMC', 'Changed Court Name')
    startJourney()
    completeJourney(fullAnswers)

    const change = (field: CheckAnswersField) => {
      AddCourtCheckAnswers.verifyOnPage().changeLink(field).should('have.attr', 'href').and('include', 'change=true')
      AddCourtCheckAnswers.verifyOnPage().changeLink(field).click()
    }
    const backOnCheckAnswers = () => {
      journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))
      return AddCourtCheckAnswers.verifyOnPage()
    }

    change('courtId')
    AddCourtDetails.verifyOnPage().courtId().should('have.value', 'NEWCC')
    enterDetails({ courtId: 'NEWMC', courtName: 'New Crown Court', description: 'A brand new Crown Court' })
    backOnCheckAnswers().value('courtId').should('contain.text', 'NEWMC')

    change('courtName')
    AddCourtDetails.verifyOnPage().courtName().should('have.value', 'New Crown Court')
    enterDetails({ courtId: 'NEWMC', courtName: 'Changed Court Name', description: 'A brand new Crown Court' })
    backOnCheckAnswers().value('courtName').should('contain.text', 'Changed Court Name')

    change('description')
    AddCourtDetails.verifyOnPage().description().should('have.value', 'A brand new Crown Court')
    enterDetails({ courtId: 'NEWMC', courtName: 'Changed Court Name', description: 'Changed description' })
    backOnCheckAnswers().value('description').should('contain.text', 'Changed description')

    change('courtType')
    AddCourtType.verifyOnPage().option('CC').should('be.checked')
    selectCourtType('MC')
    backOnCheckAnswers().value('courtType').should('contain.text', 'Magistrates Court')

    change('accessibleAccess')
    AddCourtAccessibleAccess.verifyOnPage().option('ACCESSIBLE').should('be.checked')
    selectAccessibleAccess('WHEELCHAIR_ACCESS')
    backOnCheckAnswers()

    change('cjitCode')
    AddCourtCjitCode.verifyOnPage().cjitCode().should('have.value', 'C00NW00')
    enterCjitCode('C00CH00')
    backOnCheckAnswers().value('cjitCode').should('contain.text', 'C00CH00')

    const referenceChanges: Record<ReferenceField, ReferenceAnswer> = {
      area: { search: 'West', code: 'SW', description: 'South West' },
      region: { search: 'West', code: 'SW', description: 'South West' },
      geographicalArea: { search: 'Humber', code: 'YH', description: 'Yorkshire and the Humber' },
      localAuthority: { search: 'Chester', code: 'CHEST', description: 'Chesterfield' },
      payrollRegion: { search: 'Humber', code: 'YH', description: 'Yorkshire and the Humber' },
    }
    referenceFields.forEach(field => {
      change(field)
      const page = AddCourtReferenceData.verifyOnPage(field)
      page.input().should('have.value', fullAnswers[field].description)
      page.code().should('have.value', fullAnswers[field].code)
      selectReference(field, referenceChanges[field])
      backOnCheckAnswers().value(field).should('contain.text', referenceChanges[field].description)
    })

    AddCourtCheckAnswers.verifyOnPage().createCourtButton().click()
    CourtsDetails.verifyOnPage('Changed Court Name')
    cy.url().should('include', '/court-register/details?id=NEWMC&action=CREATED')
    createdCourts().should('deep.equal', [
      {
        ...fullPayload,
        courtId: 'NEWMC',
        courtName: 'Changed Court Name',
        description: 'Changed description',
        courtTypeCode: 'MC',
        accessibleAccess: 'WHEELCHAIR_ACCESS',
        cjitCode: 'C00CH00',
        areaCode: 'SW',
        regionCode: 'SW',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'CHEST',
        payrollRegionCode: 'YH',
      },
    ])
  })

  it('will preserve answers when navigating back through the journey', () => {
    startJourney()
    enterDetails(fullAnswers)
    selectCourtType('CC')

    AddCourtAccessibleAccess.verifyOnPage().backLink().click()
    AddCourtType.verifyOnPage().option('CC').should('be.checked')
    AddCourtType.verifyOnPage().backLink().click()

    const details = AddCourtDetails.verifyOnPage()
    details.courtId().should('have.value', 'NEWCC')
    details.courtName().should('have.value', 'New Crown Court')
    details.description().should('have.value', 'A brand new Crown Court')
    details.continueButton().click()

    AddCourtType.verifyOnPage().checked().should('have.value', 'CC')
    AddCourtType.verifyOnPage().continueButton().click()
    selectAccessibleAccess('ACCESSIBLE')
    enterCjitCode('C00NW00')
    referenceFields.forEach(field => selectReference(field, fullAnswers[field]))

    AddCourtCheckAnswers.verifyOnPage().backLink().click()
    const payrollRegion = AddCourtReferenceData.verifyOnPage('payrollRegion')
    payrollRegion.input().should('have.value', 'North East')
    payrollRegion.code().should('have.value', 'NE')
    payrollRegion.backLink().click()
    AddCourtReferenceData.verifyOnPage('localAuthority').input().should('have.value', 'Leeds')
    createdCourts().should('be.empty')
  })

  it('will validate the court details and retain entered values', () => {
    let details = startJourney()
    details.continueButton().click()

    details = AddCourtDetails.verifyOnPage()
    details.errorSummary().should('be.visible')
    details.courtIdError().should('be.visible')
    details.courtNameError().should('be.visible')
    details.descriptionError().should('not.exist')

    details.courtId().clear().type('A')
    details.courtName().invoke('val', 'N'.repeat(41))
    details.description().invoke('val', 'D'.repeat(3001))
    details.continueButton().click()

    details = AddCourtDetails.verifyOnPage()
    details.courtIdError().should('be.visible')
    details.courtNameError().should('be.visible')
    details.descriptionError().should('be.visible')
    details.courtId().should('have.value', 'A')

    details.courtId().invoke('val', 'ABCDEFG')
    details.courtName().invoke('val', 'N'.repeat(40))
    details.description().invoke('val', 'D'.repeat(3000))
    details.continueButton().click()
    details = AddCourtDetails.verifyOnPage()
    details.courtIdError().should('be.visible')
    details.courtNameError().should('not.exist')
    details.descriptionError().should('not.exist')

    details.courtId().invoke('val', 'AB-1')
    details.continueButton().click()
    details = AddCourtDetails.verifyOnPage()
    details.courtIdError().should('be.visible')
    details.courtId().should('have.value', 'AB-1')

    enterDetails({ courtId: 'NEWCC', courtName: 'N'.repeat(40) })
    AddCourtType.verifyOnPage()
  })

  it('will reject a court id that is already in use before continuing', () => {
    startJourney()
    enterDetails({ courtId: existingCourt.courtId, courtName: 'Duplicate Court', description: 'Duplicate' })

    const details = AddCourtDetails.verifyOnPage()
    details.courtIdError().should('contain.text', `This court ID is already used by ${existingCourt.courtName}`)
    details.courtId().should('have.value', existingCourt.courtId)
    details.courtName().should('have.value', 'Duplicate Court')
    details.description().should('have.value', 'Duplicate')
    journeyUrl('details').then(url => cy.location('pathname').should('equal', url))

    enterDetails({ courtId: 'NEWCC', courtName: 'Duplicate Court', description: 'Duplicate' })
    AddCourtType.verifyOnPage()
    createdCourts().should('be.empty')
  })

  const conflictingAgencies: LegacyAgencyUsage[] = [
    { agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' },
    { agencyId: 'PROB1', name: 'Sheffield probation office', legacyType: 'PROBATION_OFFICE' },
  ]
  conflictingAgencies.forEach(agency => {
    it(`will reject an ID used by a ${agency.legacyType} and show its name`, () => {
      cy.task('stubAgencyIdUsed', agency)
      startJourney()
      enterDetails({ courtId: agency.agencyId, courtName: 'New Court' })

      const details = AddCourtDetails.verifyOnPage()
      const message = `This court ID is already used by ${agency.name}`
      details.courtIdError().should('contain.text', message)
      details.errorSummary().should('contain.text', message)
      details.courtId().should('have.value', agency.agencyId)
      createdCourts().should('be.empty')
    })
  })

  it('will validate court type, accessible access, CJIT code and reference data selections', () => {
    startJourney()
    enterDetails(fullAnswers)

    let courtType = AddCourtType.verifyOnPage()
    courtType.options().should('have.length', 11)
    courtType.option('UNK').should('exist')
    courtType.continueButton().click()
    courtType = AddCourtType.verifyOnPage()
    courtType.errorSummary().should('be.visible')
    courtType.error().should('be.visible')
    courtType.option('MC').invoke('attr', 'value', 'XX')
    courtType.option('XX').check()
    courtType.continueButton().click()
    AddCourtType.verifyOnPage().error().should('be.visible')
    selectCourtType('CC')

    let access = AddCourtAccessibleAccess.verifyOnPage()
    ;['NONE', 'ACCESSIBLE', 'BY_ARRANGEMENT_ONLY', 'WHEELCHAIR_ACCESS', 'UNKNOWN'].forEach(value =>
      access.option(value).should('exist'),
    )
    access.continueButton().click()
    access = AddCourtAccessibleAccess.verifyOnPage()
    access.error().should('be.visible')
    access.option('NONE').invoke('attr', 'value', 'INVALID')
    access.option('INVALID').check()
    access.continueButton().click()
    AddCourtAccessibleAccess.verifyOnPage().error().should('be.visible')
    selectAccessibleAccess('ACCESSIBLE')

    const cjit = AddCourtCjitCode.verifyOnPage()
    cjit.cjitCode().invoke('val', 'C00NW001')
    cjit.continueButton().click()
    AddCourtCjitCode.verifyOnPage().error().should('be.visible')
    AddCourtCjitCode.verifyOnPage().cjitCode().should('have.value', 'C00NW001')
    enterCjitCode('C00NW00')

    let area = AddCourtReferenceData.verifyOnPage('area')
    area.input().type('Not a real area')
    area.continueButton().click()
    area = AddCourtReferenceData.verifyOnPage('area')
    area.error().should('be.visible')
    area.input().should('have.value', 'Not a real area')
    selectReference('area', fullAnswers.area)

    selectReference('region')
    selectReference('geographicalArea')

    const localAuthority = AddCourtReferenceData.verifyOnPage('localAuthority')
    localAuthority.input().type('Leeds')
    localAuthority.suggestions().contains('Leeds').click()
    localAuthority.input().type(' edited')
    localAuthority.continueButton().click()
    AddCourtReferenceData.verifyOnPage('localAuthority').error().should('be.visible')
    selectReference('localAuthority')
    selectReference('payrollRegion')

    AddCourtCheckAnswers.verifyOnPage().createCourtButton().click()
    CourtsDetails.verifyOnPage('New Crown Court')
    createdCourts().should('deep.equal', [
      {
        courtId: 'NEWCC',
        courtName: 'New Crown Court',
        description: 'A brand new Crown Court',
        active: true,
        courtTypeCode: 'CC',
        accessibleAccess: 'ACCESSIBLE',
        cjitCode: 'C00NW00',
        areaCode: 'SY',
        addresses: [],
        phoneNumbers: [],
        emailAddresses: [],
      },
    ])
  })

  it('will retain the API rejection message on check answers and allow a retry', () => {
    startJourney()
    const checkAnswers = completeJourney(fullAnswers)
    cy.task('stubCreateCourtError', 'Court could not be created')
    checkAnswers.createCourtButton().click()

    AddCourtCheckAnswers.verifyOnPage()
    cy.get('main').should('contain.text', 'Court could not be created')
    journeyUrl('check-answers').then(url => cy.location('pathname').should('equal', url))
    AddCourtCheckAnswers.verifyOnPage().value('courtName').should('contain.text', 'New Crown Court')

    cy.task('stubCreateCourt', createdCourt('NEWCC', 'New Crown Court'))
    AddCourtCheckAnswers.verifyOnPage().createCourtButton().click()
    CourtsDetails.verifyOnPage('New Crown Court')
    cy.url().should('include', '/court-register/details?id=NEWCC&action=CREATED')
    createdCourts().should('deep.equal', [fullPayload, fullPayload])
  })

  it('will ignore tampered fields that are not part of the journey', () => {
    startJourney()
    const injectHidden = (name: string, value: string) =>
      cy
        .get('[data-qa=continue-button], [data-qa=create-court-button]')
        .first()
        .closest('form')
        .then($form => {
          $form.append(`<input type="hidden" name="${name}" value="${value}">`)
        })
    injectHidden('active', 'false')
    injectHidden('inactiveDate', '2020-01-01')
    injectHidden('addresses', 'tampered')
    enterDetails(fullAnswers)

    injectHidden('active', 'false')
    injectHidden('courtTypeCode', 'XX')
    selectCourtType('CC')
    selectAccessibleAccess('ACCESSIBLE')
    enterCjitCode('C00NW00')
    referenceFields.forEach(field => selectReference(field, fullAnswers[field]))

    injectHidden('active', 'false')
    injectHidden('courtId', 'HACKED')
    AddCourtCheckAnswers.verifyOnPage().createCourtButton().click()
    CourtsDetails.verifyOnPage('New Crown Court')
    createdCourts().should('deep.equal', [fullPayload])
  })

  it('will keep parallel drafts with different journey ids independent', () => {
    stubNewCourt('NEWMC', 'Second Draft Court')
    startJourney()
    cy.get<string>('@journeyId').as('firstJourneyId', { type: 'static' })
    enterDetails({ courtId: 'NEWCC', courtName: 'First Draft Court', description: 'First draft' })
    selectCourtType('CC')

    startJourney()
    cy.get<string>('@journeyId').as('secondJourneyId', { type: 'static' })
    cy.get<string>('@firstJourneyId').then(firstId => cy.get<string>('@secondJourneyId').should('not.equal', firstId))
    let details = AddCourtDetails.verifyOnPage()
    details.courtId().should('have.value', '')
    details.courtName().should('have.value', '')
    details.description().should('have.value', '')
    enterDetails({ courtId: 'NEWMC', courtName: 'Second Draft Court' })
    selectCourtType('MC')

    cy.get<string>('@firstJourneyId').then(id => cy.visit(`/court-register/create/${id}/details`))
    details = AddCourtDetails.verifyOnPage()
    details.courtId().should('have.value', 'NEWCC')
    details.courtName().should('have.value', 'First Draft Court')
    details.description().should('have.value', 'First draft')
    cy.get<string>('@firstJourneyId').then(id => cy.visit(`/court-register/create/${id}/court-type`))
    AddCourtType.verifyOnPage().checked().should('have.value', 'CC')

    cy.get<string>('@secondJourneyId').then(id => cy.visit(`/court-register/create/${id}/details`))
    details = AddCourtDetails.verifyOnPage()
    details.courtId().should('have.value', 'NEWMC')
    details.courtName().should('have.value', 'Second Draft Court')
    details.description().should('have.value', '')
    cy.get<string>('@secondJourneyId').then(id => cy.visit(`/court-register/create/${id}/court-type`))
    AddCourtType.verifyOnPage().checked().should('have.value', 'MC')

    AddCourtType.verifyOnPage().continueButton().click()
    selectAccessibleAccess('NONE')
    enterCjitCode()
    referenceFields.forEach(field => selectReference(field))
    AddCourtCheckAnswers.verifyOnPage().createCourtButton().click()
    CourtsDetails.verifyOnPage('Second Draft Court')
    createdCourts().should('deep.equal', [
      {
        courtId: 'NEWMC',
        courtName: 'Second Draft Court',
        active: true,
        courtTypeCode: 'MC',
        accessibleAccess: 'NONE',
        addresses: [],
        phoneNumbers: [],
        emailAddresses: [],
      },
    ])

    cy.get<string>('@firstJourneyId').then(id => cy.visit(`/court-register/create/${id}/details`))
    AddCourtDetails.verifyOnPage().courtName().should('have.value', 'First Draft Court')
  })

  it('will cancel the journey, discard the draft and not create a court', () => {
    startJourney()
    cy.get<string>('@journeyId').then(firstId => {
      startJourney()
      cy.get<string>('@journeyId').should('not.equal', firstId)
    })

    enterDetails(fullAnswers)
    journeyUrl('cancel').then(url =>
      AddCourtType.verifyOnPage().cancelButton().should('have.attr', 'href', url).click(),
    )
    AllCourts.verifyOnPage()
    cy.location('pathname').should('equal', '/court-register')

    journeyUrl('court-type').then(url => cy.visit(url))
    AllCourts.verifyOnPage()
    cy.location('pathname').should('equal', '/court-register')
    createdCourts().should('be.empty')
  })

  it('will redirect a missing journey to the register and skipped steps to the first incomplete step', () => {
    ;['details', 'court-type', 'check-answers'].forEach(step => {
      cy.visit(`/court-register/create/00000000-0000-4000-8000-000000000000/${step}`)
      AllCourts.verifyOnPage()
      cy.location('pathname').should('equal', '/court-register')
    })

    startJourney()
    journeyUrl('check-answers').then(url => cy.visit(url))
    AddCourtDetails.verifyOnPage()
    journeyUrl('details').then(url => cy.location('pathname').should('equal', url))

    enterDetails(fullAnswers)
    selectCourtType('CC')
    journeyUrl('payroll-region').then(url => cy.visit(url))
    AddCourtAccessibleAccess.verifyOnPage()
    journeyUrl('accessible-access').then(url => cy.location('pathname').should('equal', url))

    journeyUrl('check-answers').then(url => cy.visit(url))
    AddCourtAccessibleAccess.verifyOnPage()
    createdCourts().should('be.empty')
  })
})
