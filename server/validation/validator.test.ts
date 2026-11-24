import { validateForm, validateFormAsync } from './validator'

const messages = {
  'required.name': 'Enter a name',
  'between.name': 'Name must be 3 to 10 characters',
  'max.description': 'Description is too long',
}

describe('validateForm', () => {
  it('returns no errors when the form is valid', () => {
    expect(validateForm({ name: 'Moorland' }, { name: 'required|between:3,10' }, messages)).toEqual([])
  })

  it('returns the first failure for each field, linked to the field, in the order of the rules', () => {
    expect(
      validateForm(
        { description: 'x'.repeat(11) },
        { name: ['required', 'between:3,10'], description: 'max:10' },
        messages,
      ),
    ).toEqual([
      { text: 'Enter a name', href: '#name' },
      { text: 'Description is too long', href: '#description' },
    ])
  })

  it('treats a missing form as empty', () => {
    expect(validateForm(undefined, { name: 'required' }, messages)).toEqual([{ text: 'Enter a name', href: '#name' }])
  })

  describe('required', () => {
    it.each([undefined, null, '', '   ', '\t', []])('fails for %p', value => {
      expect(validateForm({ name: value }, { name: 'required' }, messages)).toHaveLength(1)
    })

    it.each(['a', ' a ', 0, false, ['a']])('passes for %p', value => {
      expect(validateForm({ name: value }, { name: 'required' }, messages)).toEqual([])
    })
  })

  it('skips other rules when the value is empty', () => {
    expect(validateForm({ name: '  ' }, { name: 'between:3,10' }, messages)).toEqual([])
  })

  it('checks other rules when the value is an empty list', () => {
    expect(validateForm({ name: [] }, { name: 'between:1,2' }, { between: 'Choose 1 or 2' })).toEqual([
      { text: 'Choose 1 or 2', href: '#name' },
    ])
  })

  describe('required_if', () => {
    const rules = { operator: 'required_if:contracted,yes' }
    const operatorMessages = { 'required_if.operator': 'Select an operator' }

    it('fails when the other field has the value and this one is empty', () => {
      expect(validateForm({ contracted: 'yes' }, rules, operatorMessages)).toEqual([
        { text: 'Select an operator', href: '#operator' },
      ])
    })

    it('passes when the other field has another value', () => {
      expect(validateForm({ contracted: 'no' }, rules, operatorMessages)).toEqual([])
    })
  })

  describe('between and max', () => {
    it.each([
      ['ab', false],
      ['abc', true],
      ['x'.repeat(10), true],
      ['x'.repeat(11), false],
      [5, true],
      [11, false],
    ])('between:3,10 for %p passes: %p', (value, passes) => {
      expect(validateForm({ name: value }, { name: 'between:3,10' }, messages)).toHaveLength(passes ? 0 : 1)
    })

    it.each([
      ['1234567', true],
      ['12345678', false],
    ])('max:7 for %p passes: %p', (value, passes) => {
      expect(validateForm({ code: value }, { code: 'max:7' }, {})).toHaveLength(passes ? 0 : 1)
    })
  })

  describe('email', () => {
    it.each(['someone@example.com', 'first.last@sub.example.co.uk', 'josé@exämple.com'])('passes for %p', value => {
      expect(validateForm({ email: value }, { email: 'email' }, {})).toEqual([])
    })

    it.each(['someone@', '@example.com', 'some one@example.com', 'someone'])('fails for %p', value => {
      expect(validateForm({ email: value }, { email: 'email' }, {})).toHaveLength(1)
    })
  })

  it.each([
    ['ABC123', true],
    ['AB-123', false],
  ])('alpha_num for %p passes: %p', (value, passes) => {
    expect(validateForm({ id: value }, { id: 'alpha_num' }, {})).toHaveLength(passes ? 0 : 1)
  })

  it.each([
    ['+44 1234-567890', true],
    ['01234 ext 5', false],
  ])('regex for %p passes: %p', (value, passes) => {
    expect(validateForm({ phone: value }, { phone: ['regex:/^[0-9 +\\-]+$/'] }, {})).toHaveLength(passes ? 0 : 1)
  })

  describe('in', () => {
    it.each([
      ['yes', true],
      ['maybe', false],
      [['yes', 'no'], true],
      [['yes', 'maybe'], false],
    ])('in:yes,no for %p passes: %p', (value, passes) => {
      expect(validateForm({ answer: value }, { answer: 'in:yes,no' }, {})).toHaveLength(passes ? 0 : 1)
    })

    it('accepts the list of values as an object', () => {
      const rules = { courtType: ['required', { in: ['CC', 'MC'] }] }
      expect(validateForm({ courtType: 'CC' }, rules, {})).toEqual([])
      expect(validateForm({ courtType: 'XX' }, rules, {})).toHaveLength(1)
    })
  })

  describe('postcode', () => {
    it.each(['SW1A 1AA', 'sw1a1aa', 'SW1A-1AA'])('passes for %p', value => {
      expect(validateForm({ postcode: value }, { postcode: 'postcode' }, {})).toEqual([])
    })

    it('fails with its own message unless the form gives one', () => {
      expect(validateForm({ postcode: 'NOT A POSTCODE' }, { postcode: 'postcode' }, {})).toEqual([
        { text: 'Enter a real postcode, like AA11AA', href: '#postcode' },
      ])
    })
  })

  describe('messages', () => {
    it('uses a message for the rule when there is none for the rule and field', () => {
      expect(validateForm({}, { name: 'required' }, { required: 'This is required' })).toEqual([
        { text: 'This is required', href: '#name' },
      ])
    })

    it('falls back to a general message', () => {
      expect(validateForm({}, { first_name: 'required' }, {})).toEqual([
        { text: 'The first name attribute has errors.', href: '#first_name' },
      ])
    })
  })

  it('rejects rules it does not support, so a mistake is caught by tests', () => {
    expect(() => validateForm({ name: 'a' }, { name: 'numeric' }, {})).toThrow("Unknown validation rule 'numeric'")
  })
})

describe('validateFormAsync', () => {
  const uniqueCode = (taken: string[]) => ({
    'unique-code': {
      check: async (value: unknown) => !taken.includes(value as string) || `${value} is already used`,
      message: 'The code is already used',
    },
  })

  it('runs lookups alongside the other rules', async () => {
    expect(
      await validateFormAsync(
        { code: 'MDI' },
        { name: 'required', code: 'required|unique-code' },
        messages,
        uniqueCode(['MDI']),
      ),
    ).toEqual([
      { text: 'Enter a name', href: '#name' },
      { text: 'MDI is already used', href: '#code' },
    ])
  })

  it('uses the rule message when a lookup fails without one', async () => {
    const rules = { 'unique-code': { check: async () => false, message: 'The code is already used' } }
    expect(await validateFormAsync({ code: 'MDI' }, { code: 'unique-code' }, {}, rules)).toEqual([
      { text: 'The code is already used', href: '#code' },
    ])
  })

  it('reports the first failing rule for a field before a lookup failure', async () => {
    expect(
      await validateFormAsync(
        { code: 'MDI' },
        { code: ['unique-code', 'max:2'] },
        { max: 'Too long' },
        uniqueCode(['MDI']),
      ),
    ).toEqual([{ text: 'Too long', href: '#code' }])
  })

  it('does not look up empty values', async () => {
    const check = jest.fn()
    await validateFormAsync({ code: ' ' }, { code: 'unique-code' }, {}, { 'unique-code': { check, message: '' } })
    expect(check).not.toHaveBeenCalled()
  })
})
