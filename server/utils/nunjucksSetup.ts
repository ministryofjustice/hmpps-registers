/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import fs from 'fs'
import express from 'express'
import path from 'path'
import querystring, { ParsedUrlQueryInput } from 'querystring'
import { PageMetaData } from './page'
import { AllPrisonsFilter } from '../routes/prisonRegister/prisonMapper'
import { prisonTypes } from '../routes/prisonRegister/prisonData'
import config from '../config'

import logger from '../../logger'
import { courtTypes } from '../routes/courtRegister/courtData'
import { CourtsFilter } from '../routes/courtRegister/courtMapper'
import { otherAgencyTypes, otherAgencyTypeDescription } from '../routes/otherAgencyRegister/otherAgencyData'
import { OtherAgencyFilter } from '../routes/otherAgencyRegister/otherAgencyMapper'
import { HospitalFilter } from '../routes/hospitalRegister/hospitalMapper'
import { PoliceCustodySuiteFilter } from '../routes/policeCustodySuiteRegister/policeCustodySuiteMapper'
import { ProbationOfficeFilter } from '../routes/probationOfficeRegister/probationOfficeMapper'
import { ApprovedPremisesFilter } from '../routes/approvedPremisesRegister/approvedPremisesMapper'
import { AgencyFilter } from '../routes/utils/filter'
import { formatDate, addressToLines } from './utils'

type Error = {
  href: string
  text: string
}

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express): nunjucks.Environment {
  app.set('view engine', 'njk')

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS Registers'
  app.locals.hmppsAuthUrl = config.apis.hmppsAuth.url

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist',
      'node_modules/govuk-frontend/dist/components/',
      'node_modules/@ministryofjustice/frontend',
    ],
    {
      autoescape: true,
      express: app,
    },
  )
  let assetManifest: Record<string, string> = {}
  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })

  njkEnv.addFilter('findError', (array: Error[], formFieldId: string) => {
    const item = array.find(error => error.href === `#${formFieldId}`)
    if (item) {
      return {
        text: item.text,
      }
    }
    return null
  })

  njkEnv.addFilter('toMojPagination', (pageMetaData: PageMetaData) => {
    const hrefForPage = (n: number) => pageMetaData.hrefTemplate.replace(':page', `${n}`)
    const items = [...Array(5).keys()]
      .map(i => i + pageMetaData.pageNumber - 2)
      .filter(page => page > 0 && page <= pageMetaData.totalPages)
      .map(page => {
        return {
          text: page,
          href: hrefForPage(page),
          selected: page === pageMetaData.pageNumber,
        }
      })
      .filter(x => x !== null)
    return {
      results: {
        from: (pageMetaData.pageNumber - 1) * pageMetaData.pageSize + (pageMetaData.totalElements > 0 ? 1 : 0),
        to: (pageMetaData.pageNumber - 1) * pageMetaData.pageSize + pageMetaData.elementsOnPage,
        count: pageMetaData.totalElements,
      },
      previous: !pageMetaData.first && {
        text: 'Previous',
        href: hrefForPage(pageMetaData.pageNumber - 1),
      },
      next: !pageMetaData.last && {
        text: 'Next',
        href: hrefForPage(pageMetaData.pageNumber + 1),
      },
      items,
    }
  })

  njkEnv.addFilter('toSimpleSelect', (array, value) => {
    return array.map((item: string) => ({
      value: item,
      text: item,
      checked: item === value,
    }))
  })

  njkEnv.addFilter(
    'setChecked',
    (items, selectedList) =>
      items &&
      items.map((entry: { value: string }) => ({
        ...entry,
        checked: entry && selectedList && selectedList.includes(entry.value),
      })),
  )

  njkEnv.addFilter('toSelect', (array, value) => {
    return array.map((item: { value: string; text: string }) => ({
      value: item.value,
      text: item.text,
      selected: item.value === value,
    }))
  })

  njkEnv.addFilter('toPrisonListFilter', (filterOptionsHtml: string, allPrisonsFilter: AllPrisonsFilter) => {
    const hrefBase = '/prison-register?'
    const textSearchFilterTags = getPrisonTextSearchFilterTags(allPrisonsFilter, hrefBase)
    const cancelActiveFilterTags = getCancelPrisonActiveFilterTags(allPrisonsFilter, hrefBase)
    const cancelGendersFilterTags = getCancelPrisonGenderFilterTags(allPrisonsFilter, hrefBase)
    const cancelTypeFilterTags = getCancelPrisonTypeFilterTags(allPrisonsFilter, hrefBase)
    const cancelLthseFilterTags = getCancelLthseFilterTags(allPrisonsFilter, hrefBase)
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/prison-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: textSearchFilterTags,
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: cancelActiveFilterTags,
          },
          {
            heading: {
              text: 'Gender',
            },
            items: cancelGendersFilterTags,
          },
          {
            heading: {
              text: 'Prison Types',
            },
            items: cancelTypeFilterTags,
          },
          {
            heading: {
              text: 'LTHSE',
            },
            items: cancelLthseFilterTags,
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toCourtListFilter', (filterOptionsHtml: string, filter: CourtsFilter) => {
    const hrefBase = '/court-register?'
    const textSearchFilterTags = getTextSearchFilterTags(filter, hrefBase)
    const activeFilterTags = getActiveFilterTags(filter, hrefBase)
    const courtTypeFilterTags = getCourtTypeFilterTags(filter, hrefBase)
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/court-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: textSearchFilterTags,
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: activeFilterTags,
          },
          {
            heading: {
              text: 'Court Types',
            },
            items: courtTypeFilterTags,
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toOtherAgencyListFilter', (filterOptionsHtml: string, filter: OtherAgencyFilter) => {
    const hrefBase = '/other-agency-register?'
    const textSearchFilterTags = getTextSearchFilterTags(filter, hrefBase)
    const activeFilterTags = getActiveFilterTags(filter, hrefBase)
    const otherAgencyTypeFilterTags = getOtherAgencyTypeFilterTags(filter, hrefBase)
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/other-agency-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: textSearchFilterTags,
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: activeFilterTags,
          },
          {
            heading: {
              text: 'Other Agency Types',
            },
            items: otherAgencyTypeFilterTags,
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toHospitalListFilter', (filterOptionsHtml: string, filter: HospitalFilter) => {
    const hrefBase = '/hospital-register?'
    const textSearchFilterTags = getTextSearchFilterTags(filter, hrefBase)
    const activeFilterTags = getActiveFilterTags(filter, hrefBase)
    const highSecurityFilterTags = getHighSecurityFilterTags(filter, hrefBase)
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/hospital-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: textSearchFilterTags,
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: activeFilterTags,
          },
          {
            heading: {
              text: 'High security',
            },
            items: highSecurityFilterTags,
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toPoliceCustodySuiteListFilter', (filterOptionsHtml: string, filter: PoliceCustodySuiteFilter) => {
    const hrefBase = '/police-custody-suite-register?'
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/police-custody-suite-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: getTextSearchFilterTags(filter, hrefBase),
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: getActiveFilterTags(filter, hrefBase),
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toProbationOfficeListFilter', (filterOptionsHtml: string, filter: ProbationOfficeFilter) => {
    const hrefBase = '/probation-office-register?'
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/probation-office-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: getTextSearchFilterTags(filter, hrefBase),
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: getActiveFilterTags(filter, hrefBase),
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toApprovedPremisesListFilter', (filterOptionsHtml: string, filter: ApprovedPremisesFilter) => {
    const hrefBase = '/approved-premises-register?'
    return {
      heading: {
        text: 'Filter',
      },
      selectedFilters: {
        heading: {
          text: 'Selected filters',
        },
        clearLink: {
          text: 'Clear filters',
          href: '/approved-premises-register',
        },
        categories: [
          {
            heading: {
              text: 'Search',
            },
            items: getTextSearchFilterTags(filter, hrefBase),
          },
          {
            heading: {
              text: 'Active or Inactive',
            },
            items: getActiveFilterTags(filter, hrefBase),
          },
        ],
      },
      optionsHtml: filterOptionsHtml,
    }
  })

  njkEnv.addFilter('toHighSecurityFilterRadioButtons', (highSecurity: boolean | undefined) => {
    return {
      idPrefix: 'highSecurity',
      name: 'highSecurity',
      classes: 'govuk-radios--inline',
      fieldset: {
        legend: {
          text: 'High security',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display high security hospitals only, or exclude them',
      },
      items: [
        {
          value: '',
          text: 'All',
          checked: highSecurity === undefined,
        },
        {
          value: true,
          text: 'Yes',
          checked: highSecurity === true,
        },
        {
          value: false,
          text: 'No',
          checked: highSecurity === false,
        },
      ],
    }
  })

  njkEnv.addFilter('toPrisonTextSearchInput', (allPrisonsFilter: AllPrisonsFilter) => {
    return {
      label: {
        text: 'Search',
        classes: 'govuk-label--m',
      },
      id: 'textSearch',
      name: 'textSearch',
      hint: {
        text: 'Search for a prison by name or code',
      },
      value: allPrisonsFilter?.textSearch,
    }
  })

  njkEnv.addFilter('toTextSearchInput', (textSearch: string | undefined) => {
    return {
      label: {
        text: 'Search',
        classes: 'govuk-label--m',
      },
      id: 'textSearch',
      name: 'textSearch',
      hint: {
        text: 'Search by name, description or code',
      },
      value: textSearch,
    }
  })

  njkEnv.addFilter('toPrisonActiveFilterRadioButtons', (allPrisonsFilter: AllPrisonsFilter) => {
    return {
      idPrefix: 'active',
      name: 'active',
      classes: 'govuk-radios--inline',
      fieldset: {
        legend: {
          text: 'Active or Inactive',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display active or inactive prisons only',
      },
      items: [
        {
          value: '',
          text: 'All',
          checked: allPrisonsFilter.active === undefined,
        },
        {
          value: true,
          text: 'Active',
          checked: allPrisonsFilter.active === true,
        },
        {
          value: false,
          text: 'Inactive',
          checked: allPrisonsFilter.active === false,
        },
      ],
    }
  })

  njkEnv.addFilter('toActiveFilterRadioButtons', (active: boolean | undefined) => {
    return {
      idPrefix: 'active',
      name: 'active',
      classes: 'govuk-radios--inline',
      fieldset: {
        legend: {
          text: 'Active or Inactive',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display active or inactive only',
      },
      items: [
        {
          value: '',
          text: 'All',
          checked: active === undefined,
        },
        {
          value: true,
          text: 'Active',
          checked: active === true,
        },
        {
          value: false,
          text: 'Inactive',
          checked: active === false,
        },
      ],
    }
  })

  njkEnv.addFilter('toPrisonMaleFemaleCheckboxes', (allPrisonsFilter: AllPrisonsFilter) => {
    return {
      idPrefix: 'gender',
      name: 'genders',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Gender',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display male or female prisons',
      },
      items: [
        {
          value: 'MALE',
          text: 'Male',
          checked: allPrisonsFilter.genders?.includes('MALE') || !allPrisonsFilter.genders,
        },
        {
          value: 'FEMALE',
          text: 'Female',
          checked: allPrisonsFilter.genders?.includes('FEMALE') || !allPrisonsFilter.genders,
        },
      ],
    }
  })

  njkEnv.addFilter('toPrisonTypeCheckboxes', (allPrisonsFilter: AllPrisonsFilter) => {
    const prisonTypeItems = prisonTypes.map(prisonType => {
      return {
        value: prisonType.value,
        text: prisonType.text,
        checked: allPrisonsFilter.prisonTypeCodes?.includes(prisonType.value) || false,
      }
    })
    return {
      idPrefix: 'prisonTypeCode',
      name: 'prisonTypeCodes',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Prison Types',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display selected prison types only',
      },
      items: prisonTypeItems,
    }
  })

  njkEnv.addFilter('toCourtTypeCheckboxes', (courtTypeCodes: string[] | undefined) => {
    const courtTypeItems = courtTypes.map(courtType => {
      return {
        value: courtType.value,
        text: courtType.text,
        checked: courtTypeCodes?.includes(courtType.value) || false,
      }
    })
    return {
      idPrefix: 'courtTypeCode',
      name: 'courtTypeCodes',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Prison Types',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display selected court types only',
      },
      items: courtTypeItems,
    }
  })

  njkEnv.addFilter('toOtherAgencyTypeCheckboxes', (otherAgencyTypeCodes: string[] | undefined) => {
    const otherAgencyTypeItems = otherAgencyTypes.map(otherAgencyType => {
      return {
        value: otherAgencyType.value,
        text: otherAgencyType.text,
        checked: otherAgencyTypeCodes?.includes(otherAgencyType.value) || false,
      }
    })
    return {
      idPrefix: 'otherAgencyTypeCode',
      name: 'otherAgencyTypeCodes',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Other Agency Types',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display selected other agency types only',
      },
      items: otherAgencyTypeItems,
    }
  })

  njkEnv.addFilter('toPrisonLthseCheckboxes', (allPrisonsFilter: AllPrisonsFilter) => {
    return {
      idPrefix: 'lthse',
      name: 'lthse',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Long Term High Security Estate (LTHSE)',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display only prisons that are part of the long term high security estate',
      },
      items: [
        {
          value: true,
          text: 'LTHSE',
          checked: allPrisonsFilter.lthse === true,
        },
      ],
    }
  })

  njkEnv.addFilter('otherAgencyTypeDescription', (agencyType: string) =>
    agencyType ? otherAgencyTypeDescription(agencyType) : 'Not provided',
  )

  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('addressToLines', addressToLines)

  njkEnv.addFilter('accessibleAccessDescription', (accessibleAccess: string) => {
    if (accessibleAccess === 'WHEELCHAIR_ACCESS') {
      return 'Wheelchair access'
    }
    if (accessibleAccess === 'NONE') {
      return 'None'
    }
    if (accessibleAccess === 'ACCESSIBLE') {
      return 'Accessible'
    }
    if (accessibleAccess === 'BY_ARRANGEMENT_ONLY') {
      return 'By arrangement only'
    }
    return 'Not provided'
  })

  function getCancelPrisonActiveFilterTags(allPrisonsFilter: AllPrisonsFilter, hrefBase: string) {
    const { active, ...newFilter }: ParsedUrlQueryInput = allPrisonsFilter
    if (allPrisonsFilter.active === true) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Active',
        },
      ]
    }
    if (allPrisonsFilter.active === false) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Inactive',
        },
      ]
    }
    return null
  }

  function getActiveFilterTags(filter: AgencyFilter, hrefBase: string) {
    const { active, ...newFilter }: ParsedUrlQueryInput = filter
    if (filter.active === true) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Active',
        },
      ]
    }
    if (filter.active === false) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Inactive',
        },
      ]
    }
    return null
  }

  function getHighSecurityFilterTags(filter: HospitalFilter, hrefBase: string) {
    const { highSecurity, ...newFilter }: ParsedUrlQueryInput = filter
    if (filter.highSecurity === true) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'High security',
        },
      ]
    }
    if (filter.highSecurity === false) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Not high security',
        },
      ]
    }
    return null
  }

  function getCancelPrisonGenderFilterTags(allPrisonsFilter: AllPrisonsFilter, hrefBase: string) {
    return allPrisonsFilter.genders?.map(gender => {
      const newFilter = removeGender(allPrisonsFilter, gender)
      return {
        href: `${hrefBase}${querystring.stringify(newFilter)}`,
        text: gender.charAt(0) + gender.slice(1).toLowerCase(),
      }
    })
  }

  function removeGender(allPrisonsFilter: AllPrisonsFilter, gender: string): AllPrisonsFilter {
    const genders = allPrisonsFilter.genders?.map(x => x) || []
    genders.splice(genders.indexOf(gender), 1)
    return { ...allPrisonsFilter, genders }
  }

  function getCancelPrisonTypeFilterTags(allPrisonsFilter: AllPrisonsFilter, hrefBase: string) {
    return allPrisonsFilter.prisonTypeCodes?.map(type => {
      const newFilter = removeTypes(allPrisonsFilter, type)
      return {
        href: `${hrefBase}${querystring.stringify(newFilter)}`,
        text: type,
      }
    })
  }

  function getCourtTypeFilterTags(filter: CourtsFilter, hrefBase: string) {
    return filter.courtTypeCodes?.map(type => {
      const newFilter = removeCourtTypes(filter, type)
      return {
        href: `${hrefBase}${querystring.stringify(newFilter)}`,
        text: type,
      }
    })
  }

  function getCancelLthseFilterTags(allPrisonsFilter: AllPrisonsFilter, hrefBase: string) {
    const { lthse, ...newFilter }: ParsedUrlQueryInput = allPrisonsFilter
    if (allPrisonsFilter.lthse === true) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'LTHSE',
        },
      ]
    }
    return null
  }

  function removeTypes(allPrisonsFilter: AllPrisonsFilter, type: string): AllPrisonsFilter {
    const prisonTypeCodes = allPrisonsFilter.prisonTypeCodes?.map(x => x) || []
    prisonTypeCodes.splice(prisonTypeCodes.indexOf(type), 1)
    return { ...allPrisonsFilter, prisonTypeCodes }
  }

  function removeCourtTypes(filter: CourtsFilter, type: string): CourtsFilter {
    const courtTypeCodes = filter.courtTypeCodes?.map(x => x) || []
    courtTypeCodes.splice(courtTypeCodes.indexOf(type), 1)
    return { ...filter, courtTypeCodes }
  }

  function getOtherAgencyTypeFilterTags(filter: OtherAgencyFilter, hrefBase: string) {
    return filter.otherAgencyTypeCodes?.map(type => {
      const newFilter = removeOtherAgencyTypes(filter, type)
      return {
        href: `${hrefBase}${querystring.stringify(newFilter)}`,
        text: type,
      }
    })
  }

  function removeOtherAgencyTypes(filter: OtherAgencyFilter, type: string): OtherAgencyFilter {
    const otherAgencyTypeCodes = filter.otherAgencyTypeCodes?.map(x => x) || []
    otherAgencyTypeCodes.splice(otherAgencyTypeCodes.indexOf(type), 1)
    return { ...filter, otherAgencyTypeCodes }
  }

  function getPrisonTextSearchFilterTags(allPrisonsFilter: AllPrisonsFilter, hrefBase: string) {
    const { textSearch, ...newFilter }: ParsedUrlQueryInput = allPrisonsFilter
    if (textSearch) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: allPrisonsFilter.textSearch,
        },
      ]
    }
    return undefined
  }

  function getTextSearchFilterTags(filter: AgencyFilter, hrefBase: string) {
    const { textSearch, ...newFilter }: ParsedUrlQueryInput = filter
    if (textSearch) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: filter.textSearch,
        },
      ]
    }
    return undefined
  }

  return njkEnv
}
