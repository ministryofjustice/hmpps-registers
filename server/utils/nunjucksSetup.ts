import nunjucks from 'nunjucks'
import express from 'express'
import path from 'path'
import { PageMetaData } from './page'
import { AllCourtsFilter } from '../routes/courtRegister/allCourtsPagedView'
import { CourtType } from '../@types/courtRegister'

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
        from: (pageMetaData.pageNumber - 1) * pageMetaData.pageSize + 1,
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

  njkEnv.addFilter('toCourtTypeFilterCheckboxes', (courtTypes: CourtType[], allCourtsFilter: AllCourtsFilter) => {
    const courtTypeItems = courtTypes.map((courtType: CourtType) => {
      return {
        value: courtType.courtType,
        text: courtType.courtName,
        checked: allCourtsFilter.courtTypeIds.includes(courtType.courtType),
      }
    })
    return {
      idPrefix: 'courtType',
      name: 'courtType',
      classes: 'govuk-checkboxes--small',
      fieldset: {
        legend: {
          text: 'Court Types',
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: courtTypeItems,
    }
  })

  return njkEnv
}
