import { areas, localAuthorities, payrollRegions, regions } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
import UpdateAgencyRegion from '../pages/components/edit/updateAgencyRegion'
import UpdateAgencyGeographicalArea from '../pages/components/edit/updateAgencyGeographicalArea'
import UpdateAgencyLocalAuthority from '../pages/components/edit/updateAgencyLocalAuthority'
import UpdateAgencyPayrollRegion from '../pages/components/edit/updateAgencyPayrollRegion'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  cjitCode: 'C00MD00',
  area: areas[0],
  region: regions[0],
  geographicalArea: areas[1],
  localAuthority: localAuthorities[0],
  payrollRegion: payrollRegions[0],
})

const unchangedFields = {
  cjitCode: 'C00MD00',
  areaCode: areas[0].code,
  regionCode: regions[0].code,
  geographicalAreaCode: areas[1].code,
  localAuthorityCode: localAuthorities[0].code,
  payrollRegionCode: payrollRegions[0].code,
}

type Field = {
  name: string
  label: string
  prisonKey: string
  path: string
  linkName: string
  stub: string
  items: { code: string; description: string }[]
  searchUrl: string
  search: string
  expected: { code: string; description: string }
  dtoKey: string
  currentCode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: { verifyOnPage: (name: string) => any }
}

const fields: Field[] = [
  {
    name: 'area',
    label: 'area',
    prisonKey: 'area',
    path: 'area',
    linkName: 'updateAreaLink',
    stub: 'stubGetAreas',
    items: areas,
    searchUrl: '/api/search-area?*',
    search: 'sOuTh',
    expected: areas[2],
    dtoKey: 'areaCode',
    currentCode: 'YH',
    page: UpdateAgencyArea,
  },
  {
    name: 'region',
    label: 'region',
    prisonKey: 'region',
    path: 'region',
    linkName: 'updateRegionLink',
    stub: 'stubGetRegions',
    items: regions,
    searchUrl: '/api/search-region?*',
    search: 'nOrTh',
    expected: regions[1],
    dtoKey: 'regionCode',
    currentCode: 'YH',
    page: UpdateAgencyRegion,
  },
  {
    name: 'geographicalArea',
    label: 'geographical area',
    prisonKey: 'geographicalArea',
    path: 'geographical-area',
    linkName: 'updateGeographicalAreaLink',
    stub: 'stubGetAreas',
    items: areas,
    searchUrl: '/api/search-area?*',
    search: 'wEsT',
    expected: areas[2],
    dtoKey: 'geographicalAreaCode',
    currentCode: 'SY',
    page: UpdateAgencyGeographicalArea,
  },
  {
    name: 'localAuthority',
    label: 'local authority',
    prisonKey: 'localAuthority',
    path: 'local-authority',
    linkName: 'updateLocalAuthorityLink',
    stub: 'stubGetLocalAuthorities',
    items: localAuthorities,
    searchUrl: '/api/search-local-authority?*',
    search: 'lEe',
    expected: localAuthorities[1],
    dtoKey: 'localAuthorityCode',
    currentCode: 'SHEF',
    page: UpdateAgencyLocalAuthority,
  },
  {
    name: 'payrollRegion',
    label: 'payroll region',
    prisonKey: 'payrollRegion',
    path: 'payroll-region',
    linkName: 'updatePayrollRegionLink',
    stub: 'stubGetPayrollRegions',
    items: payrollRegions,
    searchUrl: '/api/search-payroll-region?*',
    search: 'nOrTh',
    expected: payrollRegions[1],
    dtoKey: 'payrollRegionCode',
    currentCode: 'YH',
    page: UpdateAgencyPayrollRegion,
  },
]

const updatedPrisonAreas = () => cy.task('getUpdatedPrisonAreas', prison.prisonId)

fields.forEach(f => {
  context(`Prison register - update ${f.label}`, () => {
    const openUpdatePage = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(PrisonDetails.verifyOnPage(prison.prisonName) as any)[f.linkName]().click()
      return f.page.verifyOnPage(prison.prisonName)
    }

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUser')
      cy.task('stubGetPrisonsWithFilter', [prison])
      cy.task('stubGetPrisonDetails', prison)
      cy.task('stubUpdatePrisonArea', prison.prisonId)
      cy.task(f.stub, f.items)
      cy.signIn()
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
    })

    it('will link to the update page and prefill the current value', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(PrisonDetails.verifyOnPage(prison.prisonName) as any)
        [f.linkName]()
        .should('have.attr', 'href', `/prison-register/${f.path}/update?id=MDI`)
      const updatePage = openUpdatePage()
      updatePage[f.name]().should('have.value', f.items.find(i => i.code === f.currentCode).description)
      updatePage.code().should('have.value', f.currentCode)
      updatePage.cancelLink().should('have.attr', 'href', '/prison-register/details?id=MDI')
    })

    it('will prefill empty when none is assigned', () => {
      cy.task('stubGetPrisonDetails', { ...prison, [f.prisonKey]: null })
      const updatePage = openUpdatePage()
      updatePage[f.name]().should('have.value', '')
      updatePage.code().should('have.value', '')
    })

    it('will search, submit the selected code and keep the other fields unchanged', () => {
      cy.intercept('GET', f.searchUrl).as('search')
      const updatePage = openUpdatePage()
      updatePage[f.name]().clear()
      updatePage[f.name]().type(f.search)
      cy.wait('@search')
      updatePage.suggestions().should('not.contain.text', f.expected.code)
      updatePage.suggestions().contains(f.expected.description).click()
      updatePage.code().should('have.value', f.expected.code)
      updatePage.saveButton().click()
      PrisonDetails.verifyOnPage(prison.prisonName)
      cy.url().should('include', '/prison-register/details?id=MDI&action=UPDATED')
      updatedPrisonAreas().should('deep.equal', [{ ...unchangedFields, [f.dtoKey]: f.expected.code }])
    })

    it('will clear an existing value', () => {
      const updatePage = openUpdatePage()
      updatePage[f.name]().clear()
      updatePage.saveButton().click()
      PrisonDetails.verifyOnPage(prison.prisonName)
      const { [f.dtoKey]: removed, ...others } = unchangedFields as Record<string, string>
      updatedPrisonAreas().should('deep.equal', [others])
    })

    it('will reject unselected free text and retain it', () => {
      const updatePage = openUpdatePage()
      updatePage[f.name]().clear()
      updatePage[f.name]().type('Not a real value')
      updatePage.saveButton().click()
      const pageWithErrors = f.page.verifyOnPage(prison.prisonName)
      pageWithErrors.error().should('contain.text', `Select a valid ${f.label} from the suggestions`)
      pageWithErrors[f.name]().should('have.value', 'Not a real value')
      updatedPrisonAreas().should('be.empty')
    })

    it('will retain the selected value when the API rejects the update', () => {
      cy.task('stubUpdatePrisonAreaError', {
        prisonId: prison.prisonId,
        userMessage: `${f.label} could not be updated`,
      })
      const updatePage = openUpdatePage()
      updatePage[f.name]().clear()
      updatePage[f.name]().type(f.search)
      updatePage.suggestions().contains(f.expected.description).click()
      updatePage.saveButton().click()
      const pageWithErrors = f.page.verifyOnPage(prison.prisonName)
      pageWithErrors.error().should('contain.text', `${f.label} could not be updated`)
      pageWithErrors[f.name]().should('have.value', f.expected.description)
      pageWithErrors.code().should('have.value', f.expected.code)
    })
  })
})
