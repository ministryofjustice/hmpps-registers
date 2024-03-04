/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import path from 'path'
import querystring, { ParsedUrlQueryInput } from 'querystring'
import { PageMetaData } from './page'
import { AllPrisonsFilter } from '../routes/prisonRegister/prisonMapper'
import { prisonTypes } from '../routes/prisonRegister/prisonData'
import config from '../config'

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
        ],
      },
      optionsHtml: filterOptionsHtml,
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

  function removeTypes(allPrisonsFilter: AllPrisonsFilter, type: string): AllPrisonsFilter {
    const prisonTypeCodes = allPrisonsFilter.prisonTypeCodes?.map(x => x) || []
    prisonTypeCodes.splice(prisonTypeCodes.indexOf(type), 1)
    return { ...allPrisonsFilter, prisonTypeCodes }
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

  return njkEnv
}
