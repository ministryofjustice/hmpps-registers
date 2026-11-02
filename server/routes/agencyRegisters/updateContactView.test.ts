import UpdateAgencyContactView from './updateContactView'

describe('UpdateAgencyContactView', () => {
  const navigation = { cancelButton: '/probation-office-register/details?id=SHFPO' }

  it('renders the agency name, navigation and default errors', () => {
    expect(new UpdateAgencyContactView('Sheffield Probation Office', navigation).renderArgs).toEqual({
      name: 'Sheffield Probation Office',
      navigation,
      errors: [],
      contact: undefined,
    })
  })

  it('passes errors and the submitted contact through to the page', () => {
    const errors = [{ href: '#contact', text: 'Contact must be 80 characters or fewer' }]

    expect(
      new UpdateAgencyContactView('Sheffield Probation Office', navigation, errors, 'Duty Officer').renderArgs,
    ).toEqual({ name: 'Sheffield Probation Office', navigation, errors, contact: 'Duty Officer' })
  })
})
