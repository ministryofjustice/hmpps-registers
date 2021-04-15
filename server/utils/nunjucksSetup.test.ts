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

describe('toCourtTypeFilterCheckboxes', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create checkboxes metadata', () => {
    const result = njk.getFilter('toCourtTypeFilterCheckboxes')([], { courtTypeIds: [], active: null })
    expect(result.idPrefix).toEqual('courtType')
    expect(result.name).toEqual('courtType')
    expect(result.classes).toContain('govuk-checkboxes')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })
  it('should map an empty filter to unchecked checkboxes', () => {
    const result = njk.getFilter('toCourtTypeFilterCheckboxes')(
      [
        { courtType: 'CRN', courtName: 'Crown' },
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'MAG', courtName: 'Magistrates' },
      ],
      { courtTypeIds: [], active: null }
    )
    expect(result.items).toEqual([
      {
        value: 'CRN',
        text: 'Crown',
        checked: false,
      },
      {
        value: 'COU',
        text: 'County',
        checked: false,
      },
      {
        value: 'MAG',
        text: 'Magistrates',
        checked: false,
      },
    ])
  })
  it('should map a single item to a single checked checkbox', () => {
    const result = njk.getFilter('toCourtTypeFilterCheckboxes')(
      [
        { courtType: 'CRN', courtName: 'Crown' },
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'MAG', courtName: 'Magistrates' },
      ],
      { courtTypeIds: ['CRN'], active: null }
    )
    expect(result.items).toEqual([
      {
        value: 'CRN',
        text: 'Crown',
        checked: true,
      },
      {
        value: 'COU',
        text: 'County',
        checked: false,
      },
      {
        value: 'MAG',
        text: 'Magistrates',
        checked: false,
      },
    ])
  })
  it('should map multiple items to multiple checked checkboxes', () => {
    const result = njk.getFilter('toCourtTypeFilterCheckboxes')(
      [
        { courtType: 'CRN', courtName: 'Crown' },
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'MAG', courtName: 'Magistrates' },
      ],
      { courtTypeIds: ['COU', 'MAG'], active: null }
    )
    expect(result.items).toEqual([
      {
        value: 'CRN',
        text: 'Crown',
        checked: false,
      },
      {
        value: 'COU',
        text: 'County',
        checked: true,
      },
      {
        value: 'MAG',
        text: 'Magistrates',
        checked: true,
      },
    ])
  })
})
describe('toActiveFilterRadioButtons', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create radio button metadata', () => {
    const result = njk.getFilter('toActiveFilterRadioButtons')({ courtTypeIds: [], active: null })
    expect(result.idPrefix).toEqual('active')
    expect(result.name).toEqual('active')
    expect(result.classes).toContain('govuk-radios')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })
  it('should map null to all courts', () => {
    const result = njk.getFilter('toActiveFilterRadioButtons')({ courtTypeIds: [], active: null })
    expect(result.items).toEqual([
      {
        value: '',
        text: 'All',
        checked: true,
      },
      {
        value: true,
        text: 'Open',
        checked: false,
      },
      {
        value: false,
        text: 'Closed',
        checked: false,
      },
    ])
  })
  it('should map true to open courts', () => {
    const result = njk.getFilter('toActiveFilterRadioButtons')({ courtTypeIds: [], active: true })
    expect(result.items).toEqual([
      {
        value: '',
        text: 'All',
        checked: false,
      },
      {
        value: true,
        text: 'Open',
        checked: true,
      },
      {
        value: false,
        text: 'Closed',
        checked: false,
      },
    ])
  })
  it('should map false to closed courts', () => {
    const result = njk.getFilter('toActiveFilterRadioButtons')({ courtTypeIds: [], active: false })
    expect(result.items).toEqual([
      {
        value: '',
        text: 'All',
        checked: false,
      },
      {
        value: true,
        text: 'Open',
        checked: false,
      },
      {
        value: false,
        text: 'Closed',
        checked: true,
      },
    ])
  })
})
describe('toCourtListFilterCategories', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should show selected court types', () => {
    const result = njk.getFilter('toCourtListFilterCategories')(
      [
        { courtType: 'CRN', courtName: 'Crown' },
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'MAG', courtName: 'Magistrates' },
      ],
      { courtTypeIds: ['CRN', 'MAG'], active: null }
    )
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Court Types',
          },
          items: [
            {
              href: '#',
              text: 'Crown',
            },
            {
              href: '#',
              text: 'Magistrates',
            },
          ],
        }),
      ])
    )
  })
  it('should show active All', () => {
    const result = njk.getFilter('toCourtListFilterCategories')([], { courtTypeIds: [], active: null })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Active?',
          },
          items: [
            {
              href: '#',
              text: 'All',
            },
          ],
        }),
      ])
    )
  })
  it('should show active Open', () => {
    const result = njk.getFilter('toCourtListFilterCategories')([], { courtTypeIds: [], active: true })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Active?',
          },
          items: [
            {
              href: '#',
              text: 'Open',
            },
          ],
        }),
      ])
    )
  })
  it('should show active Closed', () => {
    const result = njk.getFilter('toCourtListFilterCategories')([], { courtTypeIds: [], active: false })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Active?',
          },
          items: [
            {
              href: '#',
              text: 'Closed',
            },
          ],
        }),
      ])
    )
  })
})
