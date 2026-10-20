import { validateNameDescription, validateReference } from './agencyFields'

describe('agency fields', () => {
  const options = { nameField: 'name', nameLabel: 'Name', nameMax: 40, descriptionMax: 3000 }

  it('accepts the exact name/description limits and an optional description', () => {
    expect(validateNameDescription('N'.repeat(40), 'D'.repeat(3000), options)).toEqual([])
    expect(validateNameDescription('Name', '', options)).toEqual([])
  })

  it('rejects fields exceeding the limits', () => {
    expect(validateNameDescription('N'.repeat(41), 'D'.repeat(3001), options)).toEqual([
      { href: '#name', text: 'Name must be 40 characters or fewer' },
      { href: '#description', text: 'Description must be 3000 characters or fewer' },
    ])
  })

  it('requires a name but not a description', () => {
    expect(validateNameDescription('', '', options)).toEqual([{ href: '#name', text: 'Enter a name' }])
  })

  describe('reference fields', () => {
    const items = [{ code: 'A1', description: 'Canonical area' }]
    let getItems: jest.Mock

    beforeEach(() => {
      getItems = jest.fn().mockResolvedValue(items)
    })

    it.each([
      [undefined, undefined],
      ['', ''],
    ])('allows clearing both fields: %p', async (code, description) => {
      await expect(validateReference(code, description, 'area', 'area', getItems)).resolves.toEqual({ errors: [] })
      expect(getItems).not.toHaveBeenCalled()
    })

    it.each([
      ['', 'Unselected area'],
      ['invalid', 'Area'],
    ])('rejects an unselected or invalid code: %p', async (code, description) => {
      await expect(validateReference(code, description, 'area', 'area', getItems)).resolves.toEqual({
        errors: [{ href: '#area', text: 'Select a valid area from the suggestions' }],
      })
    })

    it('returns the canonical description rather than trusting the submitted label', async () => {
      await expect(validateReference('A1', 'Untrusted label', 'area', 'area', getItems)).resolves.toEqual({
        errors: [],
        selected: items[0],
      })
    })

    it('propagates lookup failures', async () => {
      getItems.mockRejectedValue(new Error('API unavailable'))
      await expect(validateReference('A1', 'Area', 'area', 'area', getItems)).rejects.toThrow('API unavailable')
    })
  })
})
