import UpdateAccessibleAccessView from './updateAccessibleAccessView'

describe('UpdateAccessibleAccessView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('renders all accessible access options with their labels', () => {
    const { accessibleAccessOptions } = new UpdateAccessibleAccessView('Sheffield Crown Court', navigation).renderArgs

    expect(accessibleAccessOptions).toEqual([
      { value: 'NONE', text: 'No accessible access', checked: false },
      { value: 'ACCESSIBLE', text: 'Yes, access is accessible', checked: false },
      { value: 'BY_ARRANGEMENT_ONLY', text: 'Yes, but by arrangement only', checked: false },
      { value: 'WHEELCHAIR_ACCESS', text: 'Has wheelchair access', checked: false },
      { value: 'UNKNOWN', text: "Don't know", checked: false },
    ])
  })

  it.each(['NONE', 'ACCESSIBLE', 'BY_ARRANGEMENT_ONLY', 'WHEELCHAIR_ACCESS', 'UNKNOWN'])(
    'checks only the selected accessible access option: %s',
    accessibleAccess => {
      const { accessibleAccessOptions } = new UpdateAccessibleAccessView(
        'Sheffield Crown Court',
        navigation,
        [],
        accessibleAccess,
      ).renderArgs

      expect(accessibleAccessOptions.filter(option => option.checked).map(option => option.value)).toEqual([
        accessibleAccess,
      ])
    },
  )

  it('renders the court name, navigation and default errors', () => {
    expect(new UpdateAccessibleAccessView('Sheffield Crown Court', navigation).renderArgs).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors: [],
      accessibleAccessOptions: expect.any(Array),
    })
  })

  it('passes validation errors through to the page', () => {
    const errors = [{ href: '#accessibleAccess', text: 'Select an accessible access option' }]

    expect(new UpdateAccessibleAccessView('Sheffield Crown Court', navigation, errors).renderArgs.errors).toEqual(
      errors,
    )
  })
})
