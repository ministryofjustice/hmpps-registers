import UpdateAgencyCjitCodeView from './updateCjitCodeView'

describe('UpdateAgencyCjitCodeView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('renders the agency name, navigation and default errors', () => {
    expect(new UpdateAgencyCjitCodeView('Sheffield Crown Court', navigation).renderArgs).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors: [],
      cjitCode: undefined,
    })
  })

  it.each(['C00SH00', ''])('renders the supplied CJIT code unchanged: %j', cjitCode => {
    expect(new UpdateAgencyCjitCodeView('Sheffield Crown Court', navigation, [], cjitCode).renderArgs).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors: [],
      cjitCode,
    })
  })

  it('passes errors and the submitted code through to the page', () => {
    const errors = [{ href: '#cjitCode', text: 'CJIT code must be 12 characters or fewer' }]

    expect(
      new UpdateAgencyCjitCodeView('Sheffield Crown Court', navigation, errors, '1234567890123').renderArgs,
    ).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors,
      cjitCode: '1234567890123',
    })
  })
})
