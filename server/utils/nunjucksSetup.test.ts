import express from 'express'
import nunjucksSetup from './nunjucksSetup'

describe('toPrisonListFilter', () => {
  const app = express()
  const njk = nunjucksSetup(app)

  it('should show filter headings', () => {
    const result = njk.getFilter('toPrisonListFilter')([], {})
    expect(result.heading.text).toBeTruthy()
    expect(result.selectedFilters.heading.text).toBeTruthy()
    expect(result.selectedFilters.clearLink.text).toBeTruthy()
  })

  it('should show active Active cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { active: true })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Active or Inactive',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'Active',
            },
          ],
        }),
      ]),
    )
  })

  it('should show active Inactive cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { active: false })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'Active or Inactive',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'Inactive',
            },
          ],
        }),
      ]),
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
      ]),
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
      ]),
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
      ]),
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
      ]),
    )
  })

  it('should show active lthse cancel tag', () => {
    const result = njk.getFilter('toPrisonListFilter')([], { lthse: true })
    expect(result.selectedFilters.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: {
            text: 'LTHSE',
          },
          items: [
            {
              href: '/prison-register?',
              text: 'LTHSE',
            },
          ],
        }),
      ]),
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

  it('should map true to active prisons', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({ active: true })
    expect(result.items).toEqual([
      {
        value: '',
        text: 'All',
        checked: false,
      },
      {
        value: true,
        text: 'Active',
        checked: true,
      },
      {
        value: false,
        text: 'Inactive',
        checked: false,
      },
    ])
  })

  it('should map false to inactive prisons', () => {
    const result = njk.getFilter('toPrisonActiveFilterRadioButtons')({ active: false })
    expect(result.items).toEqual([
      {
        value: '',
        text: 'All',
        checked: false,
      },
      {
        value: true,
        text: 'Active',
        checked: false,
      },
      {
        value: false,
        text: 'Inactive',
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
        text: "His Majesty's Prison (HMP)",
        checked: false,
      },
      {
        value: 'YOI',
        text: "His Majesty's Youth Offender Institution (YOI)",
        checked: false,
      },
      {
        value: 'IRC',
        text: 'Immigration Removal Centre (IRC)',
        checked: false,
      },
      {
        value: 'STC',
        text: 'Secure Training Centre (STC)',
        checked: false,
      },
      {
        value: 'YCS',
        text: 'Youth Custody Service (YCS)',
        checked: false,
      },
    ])
  })

  it('should map a HMP and YOI filter to checked checkboxes', () => {
    const result = njk.getFilter('toPrisonTypeCheckboxes')({ prisonTypeCodes: ['HMP', 'YOI'] })
    expect(result.items).toEqual([
      {
        value: 'HMP',
        text: "His Majesty's Prison (HMP)",
        checked: true,
      },
      {
        value: 'YOI',
        text: "His Majesty's Youth Offender Institution (YOI)",
        checked: true,
      },
      {
        value: 'IRC',
        text: 'Immigration Removal Centre (IRC)',
        checked: false,
      },
      {
        value: 'STC',
        text: 'Secure Training Centre (STC)',
        checked: false,
      },
      {
        value: 'YCS',
        text: 'Youth Custody Service (YCS)',
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
      ['male'],
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
