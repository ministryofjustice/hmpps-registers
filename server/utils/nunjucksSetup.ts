import nunjucks from 'nunjucks'
import express from 'express'
import path from 'path'
import querystring from 'querystring'
import { PageMetaData } from './page'
import { CourtType } from '../@types/courtRegister'
import { AllCourtsFilter } from '../routes/courtRegister/courtMapper'

type Error = {
  href: string
  text: string
}

export default function nunjucksSetup(app: express.Application): nunjucks.Environment {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend',
    ],
    {
      autoescape: true,
      express: app,
    }
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

  njkEnv.addFilter('toSelect', (array, value) => {
    return array.map((item: { value: string; text: string }) => ({
      value: item.value,
      text: item.text,
      selected: item.value === value,
    }))
  })

  njkEnv.addFilter('toCourtTypeFilterCheckboxes', (courtTypes: CourtType[], allCourtsFilter: AllCourtsFilter) => {
    const courtTypeItems = courtTypes.map((courtType: CourtType) => {
      return {
        value: courtType.courtType,
        text: courtType.courtName,
        checked: allCourtsFilter.courtTypeIds?.includes(courtType.courtType),
      }
    })
    return {
      idPrefix: 'courtType',
      name: 'courtTypeIds',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Court Types',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display selected court types only',
      },
      items: courtTypeItems,
    }
  })

  njkEnv.addFilter('toActiveFilterRadioButtons', (allCourtsFilter: AllCourtsFilter) => {
    return {
      idPrefix: 'active',
      name: 'active',
      classes: 'govuk-radios--inline',
      fieldset: {
        legend: {
          text: 'Open or Closed',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: 'Display open or closed courts only',
      },
      items: [
        {
          value: '',
          text: 'All',
          checked: allCourtsFilter.active === null,
        },
        {
          value: true,
          text: 'Open',
          checked: allCourtsFilter.active === true,
        },
        {
          value: false,
          text: 'Closed',
          checked: allCourtsFilter.active === false,
        },
      ],
    }
  })

  njkEnv.addFilter(
    'toCourtListFilter',
    (courtTypes: CourtType[], allCourtsFilter: AllCourtsFilter, filterOptionsHtml: string) => {
      const hrefBase = '/court-register?'
      const cancelCourtTypeFilterTags = getCancelCourtTypeFilterTags(allCourtsFilter, hrefBase, courtTypes)
      const cancelActiveFilterTags = getCancelActiveFilterTags(allCourtsFilter, hrefBase)
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
                text: 'Open or Closed',
              },
              items: cancelActiveFilterTags,
            },
            {
              heading: {
                text: 'Court Types',
              },
              items: cancelCourtTypeFilterTags,
            },
          ],
        },
        optionsHtml: filterOptionsHtml,
      }
    }
  )

  function getCancelCourtTypeFilterTags(allCourtsFilter: AllCourtsFilter, hrefBase: string, courtTypes: CourtType[]) {
    return allCourtsFilter.courtTypeIds?.map(courtTypeId => {
      const newFilter = removeCourtTypeId(allCourtsFilter, courtTypeId)
      return {
        href: `${hrefBase}${querystring.stringify(newFilter)}`,
        text: findCourtTypeName(courtTypes, courtTypeId),
      }
    })
  }

  function removeCourtTypeId(allCourtsFilter: AllCourtsFilter, courtTypeId: string): AllCourtsFilter {
    const courtTypeIds = allCourtsFilter.courtTypeIds.map(x => x)
    courtTypeIds.splice(courtTypeIds.indexOf(courtTypeId), 1)
    return { ...allCourtsFilter, courtTypeIds }
  }

  function findCourtTypeName(courtTypes: CourtType[], courtTypeId: string) {
    return courtTypes.filter(courtType => courtType.courtType === courtTypeId)[0].courtName
  }

  function getCancelActiveFilterTags(allCourtsFilter: AllCourtsFilter, hrefBase: string) {
    const newFilter = { courtTypeIds: allCourtsFilter.courtTypeIds }
    if (allCourtsFilter.active === true) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Open',
        },
      ]
    }
    if (allCourtsFilter.active === false) {
      return [
        {
          href: `${hrefBase}${querystring.stringify(newFilter)}`,
          text: 'Closed',
        },
      ]
    }
    return null
  }

  return njkEnv
}
