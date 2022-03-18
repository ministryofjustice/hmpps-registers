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
    expect(result.name).toEqual('courtTypeIds')
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
      {}
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
      { courtTypeIds: ['CRN'] }
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
      { courtTypeIds: ['COU', 'MAG'] }
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
describe('toCourtActiveFilterRadioButtons', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create radio button metadata', () => {
    const result = njk.getFilter('toCourtActiveFilterRadioButtons')({ courtTypeIds: [], active: null })
    expect(result.idPrefix).toEqual('active')
    expect(result.name).toEqual('active')
    expect(result.classes).toContain('govuk-radios')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })
  it('should map null to all courts', () => {
    const result = njk.getFilter('toCourtActiveFilterRadioButtons')({})
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
    const result = njk.getFilter('toCourtActiveFilterRadioButtons')({ active: true })
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
    const result = njk.getFilter('toCourtActiveFilterRadioButtons')({ active: false })
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

describe('toCourtTextSearchInput', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create text search metadata', () => {
    const result = njk.getFilter('toCourtTextSearchInput')()
    expect(result.label.text).toBeTruthy()
    expect(result.label.classes).toContain('govuk-label')
    expect(result.id).toEqual('textSearch')
    expect(result.name).toEqual('textSearch')
  })
})

describe('toCourtListFilter', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should show filter headings', () => {
    const result = njk.getFilter('toCourtListFilter')([], {})
    expect(result.heading.text).toBeTruthy()
    expect(result.selectedFilters.heading.text).toBeTruthy()
    expect(result.selectedFilters.clearLink.text).toBeTruthy()
  })
  it('should show selected court types cancel tags', () => {
    const result = njk.getFilter('toCourtListFilter')(
      [
        { courtType: 'CRN', courtName: 'Crown' },
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'MAG', courtName: 'Magistrates' },
        { courtType: 'CMT', courtName: 'Court Martial' },
        { courtType: 'COM', courtName: 'Community' },
      ],
      { courtTypeIds: ['CRN', 'CMT', 'COU'] }
    )
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Court Types',
          },
          items: [
            {
              href: '/court-register?courtTypeIds=CMT&courtTypeIds=COU',
              text: 'Crown',
            },
            {
              href: '/court-register?courtTypeIds=CRN&courtTypeIds=COU',
              text: 'Court Martial',
            },
            {
              href: '/court-register?courtTypeIds=CRN&courtTypeIds=CMT',
              text: 'County',
            },
          ],
        }),
      ])
    )
  })
  it('should show active Open cancel tag', () => {
    const result = njk.getFilter('toCourtListFilter')([], { active: true })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Open or Closed',
          },
          items: [
            {
              href: '/court-register?',
              text: 'Open',
            },
          ],
        }),
      ])
    )
  })
  it('should show active Closed cancel tag', () => {
    const result = njk.getFilter('toCourtListFilter')([], { active: false })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Open or Closed',
          },
          items: [
            {
              href: '/court-register?',
              text: 'Closed',
            },
          ],
        }),
      ])
    )
  })
  it('should show textSearch cancel tag', () => {
    const result = njk.getFilter('toCourtListFilter')([], { textSearch: 'some-text-search' })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Search',
          },
          items: [
            {
              href: '/court-register?',
              text: 'some-text-search',
            },
          ],
        }),
      ])
    )
  })
  it('should NOT show textSearch cancel tag if no text search', () => {
    const result = njk.getFilter('toCourtListFilter')([], {})
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Search',
          },
          items: undefined,
        }),
      ])
    )
  })
  it('should pass in options html', () => {
    const result = njk.getFilter('toCourtListFilter')([], { courtTypeIds: [], active: false }, 'some-options-html')
    expect(result.optionsHtml).toEqual('some-options-html')
  })
})

describe('toPrisonListFilter', () => {
  const app = express()
  const njk = nunjucksSetup(app)

  it('should show filter headings', () => {
    const result = njk.getFilter('toPrisonListFilter')([], {})
    expect(result.heading.text).toBeTruthy()
    expect(result.selectedFilters.heading.text).toBeTruthy()
    expect(result.selectedFilters.clearLink.text).toBeTruthy()
  })

  it('should show active Open cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { active: true })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Open or Closed',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'Open',
            },
          ],
        }),
      ])
    )
  })

  it('should show active Closed cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { active: false })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Open or Closed',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'Closed',
            },
          ],
        }),
      ])
    )
  })

  it('should show textSearch cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { textSearch: 'some-text-search' })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Search',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'some-text-search',
            },
          ],
        }),
      ])
    )
  })

  it('should NOT show textSearch cancel tag if no text search', () => {
    const result = njk.getFilter('toPrisonListFilter')([], {})
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Search',
          },
          items: undefined,
        }),
      ])
    )
  })

  it('should show male cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { genders: ['MALE'] })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Gender',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'Male',
            },
          ],
        }),
      ])
    )
  })

  it('should show HMP cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { prisonTypeCodes: ['HMP'] })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Prison Types',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'HMP',
            },
          ],
        }),
      ])
    )
  })

  it('should pass in options html', () => {
    const result = njk.getFilter('toPrisonListFilter')('some-options-html', { active: false })
    expect(result.optionsHtml).toEqual('some-options-html')
  })
})

describe('toPrisonTextSearchInput', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create text search metadata', () => {
    const result = njk.getFilter('toPrisonTextSearchInput')()
    expect(result.label.text).toBeTruthy()
    expect(result.label.classes).toContain('govuk-label')
    expect(result.id).toEqual('textSearch')
    expect(result.name).toEqual('textSearch')
  })
})

describe('toPrisonActiveFilterRadioButtons', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create radio button metadata', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({ active: null })
    expect(result.idPrefix).toEqual('active')
    expect(result.name).toEqual('active')
    expect(result.classes).toContain('govuk-radios')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })

  it('should map null to all courts', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({})
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

  it('should map true to open prisons', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({ active: true })
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

  it('should map false to closed prisons', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({ active: false })
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

describe('toPrisonMaleFemaleCheckboxes', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create checkboxes metadata', () => {
    const result = njk.getFilter('toPrisonMaleFemaleCheckboxes')({})
    expect(result.idPrefix).toEqual('gender')
    expect(result.name).toEqual('genders')
    expect(result.classes).toContain('govuk-checkboxes')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })

  it('should map an empty filter to checked checkboxes', () => {
    const result = njk.getFilter('toPrisonMaleFemaleCheckboxes')({})
    expect(result.items).toEqual([
      {
        value: 'MALE',
        text: 'Male',
        checked: true,
      },
      {
        value: 'FEMALE',
        text: 'Female',
        checked: true,
      },
    ])
  })

  it('should map a male filter to checked male checkbox', () => {
    const result = njk.getFilter('toPrisonMaleFemaleCheckboxes')({ genders: ['MALE'] })
    expect(result.items).toEqual([
      {
        value: 'MALE',
        text: 'Male',
        checked: true,
      },
      {
        value: 'FEMALE',
        text: 'Female',
        checked: false,
      },
    ])
  })

  it('should map a female filter to checked female checkbox', () => {
    const result = njk.getFilter('toPrisonMaleFemaleCheckboxes')({ genders: ['FEMALE'] })
    expect(result.items).toEqual([
      {
        value: 'MALE',
        text: 'Male',
        checked: false,
      },
      {
        value: 'FEMALE',
        text: 'Female',
        checked: true,
      },
    ])
  })
})

describe('toPrisonTypeCheckboxes', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should create checkboxes metadata', () => {
    const result = njk.getFilter('toPrisonTypeCheckboxes')({})
    expect(result.idPrefix).toEqual('prisonTypeCode')
    expect(result.name).toEqual('prisonTypeCodes')
    expect(result.classes).toContain('govuk-checkboxes')
    expect(result.fieldset.legend.text).toBeTruthy()
    expect(result.fieldset.legend.classes).toContain('govuk-fieldset')
  })

  it('should map an empty filter to checked checkboxes', () => {
    const result = njk.getFilter('toPrisonTypeCheckboxes')({})
    expect(result.items).toEqual([
      {
        value: 'HMP',
        text: 'Her Majesty’s Prison (HMP)',
        checked: false,
      },
      {
        value: 'YOI',
        text: 'Her Majesty’s Youth Offender Institution (YOI)',
        checked: false,
      },
      {
        value: 'STC',
        text: 'Secure Training Centre (STC)',
        checked: false,
      },
      {
        value: 'IRC',
        text: 'Immigration Removal Centre (IRC)',
        checked: false,
      },
    ])
  })

  it('should map a HMP and YOI filter to checked checkboxes', () => {
    const result = njk.getFilter('toPrisonTypeCheckboxes')({ prisonTypeCodes: ['HMP', 'YOI'] })
    expect(result.items).toEqual([
      {
        value: 'HMP',
        text: 'Her Majesty’s Prison (HMP)',
        checked: true,
      },
      {
        value: 'YOI',
        text: 'Her Majesty’s Youth Offender Institution (YOI)',
        checked: true,
      },
      {
        value: 'STC',
        text: 'Secure Training Centre (STC)',
        checked: false,
      },
      {
        value: 'IRC',
        text: 'Immigration Removal Centre (IRC)',
        checked: false,
      },
    ])
  })
})

describe('setChecked', () => {
  const app = express()
  const njk = nunjucksSetup(app)
  it('should map Male and Female checkboxes and set Male to checked', () => {
    const checkboxSettings = njk.getFilter('setChecked')(
      [
        { value: 'male', text: 'Male' },
        { value: 'female', text: 'Female' },
      ],
      ['male']
    )

    expect(checkboxSettings).toEqual([
      {
        value: 'male',
        text: 'Male',
        checked: true,
      },
      {
        value: 'female',
        text: 'Female',
        checked: false,
      },
    ])
  })
})
