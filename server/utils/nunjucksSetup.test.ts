import express from 'express'
import nunjucksSetup from './nunjucksSetup'

describe('toMojPagination', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('maps a single page', () => {
    const result = njk.getFilter('toMojPagination')({
      first: true,
      last: true,
      empty: false,
      totalPages: 1,
      totalElements: 3,
      pageNumber: 1,
      pageSize: 4,
      elementsOnPage: 3,
      hrefTemplate: '/courts-register/paged?page=:page',
    })

    expect(result).toEqual({
      results: {
        from: 1,
        to: 3,
        count: 3,
      },
      previous: false,
      next: false,
      items: [
        {
          text: 1,
          href: '/courts-register/paged?page=1',
          selected: true,
        },
      ],
    })
  })
  it('maps first page', () => {
    const result = njk.getFilter('toMojPagination')({
      first: true,
      last: false,
      empty: false,
      totalPages: 4,
      totalElements: 16,
      pageNumber: 1,
      pageSize: 4,
      elementsOnPage: 4,
      hrefTemplate: '/courts-register/paged?page=:page',
    })

    expect(result).toEqual({
      results: {
        from: 1,
        to: 4,
        count: 16,
      },
      previous: false,
      next: {
        text: 'Next',
        href: '/courts-register/paged?page=2',
      },
      items: [
        {
          text: 1,
          href: '/courts-register/paged?page=1',
          selected: true,
        },
        {
          text: 2,
          href: '/courts-register/paged?page=2',
          selected: false,
        },
        {
          text: 3,
          href: '/courts-register/paged?page=3',
          selected: false,
        },
      ],
    })
  })
  it('maps a page in the middle', () => {
    const result = njk.getFilter('toMojPagination')({
      first: false,
      last: false,
      empty: false,
      totalPages: 5,
      totalElements: 19,
      pageNumber: 3,
      pageSize: 4,
      elementsOnPage: 5,
      hrefTemplate: '/courts-register/paged?page=:page',
    })

    expect(result).toEqual({
      results: {
        from: 9,
        to: 13,
        count: 19,
      },
      previous: {
        text: 'Previous',
        href: '/courts-register/paged?page=2',
      },
      next: {
        text: 'Next',
        href: '/courts-register/paged?page=4',
      },
      items: [
        {
          text: 1,
          href: '/courts-register/paged?page=1',
          selected: false,
        },
        {
          text: 2,
          href: '/courts-register/paged?page=2',
          selected: false,
        },
        {
          text: 3,
          href: '/courts-register/paged?page=3',
          selected: true,
        },
        {
          text: 4,
          href: '/courts-register/paged?page=4',
          selected: false,
        },
        {
          text: 5,
          href: '/courts-register/paged?page=5',
          selected: false,
        },
      ],
    })
  })
  it('maps last page', () => {
    const result = njk.getFilter('toMojPagination')({
      first: false,
      last: true,
      empty: false,
      totalPages: 4,
      totalElements: 16,
      pageNumber: 4,
      pageSize: 4,
      elementsOnPage: 4,
      hrefTemplate: '/courts-register/paged?page=:page',
    })

    expect(result).toEqual({
      results: {
        from: 13,
        to: 16,
        count: 16,
      },
      previous: {
        text: 'Previous',
        href: '/courts-register/paged?page=3',
      },
      next: false,
      items: [
        {
          text: 2,
          href: '/courts-register/paged?page=2',
          selected: false,
        },
        {
          text: 3,
          href: '/courts-register/paged?page=3',
          selected: false,
        },
        {
          text: 4,
          href: '/courts-register/paged?page=4',
          selected: true,
        },
      ],
    })
  })
})