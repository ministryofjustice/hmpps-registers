import UpdateAgencyLocalAuthorityView from './updateLocalAuthorityView'

describe('UpdateAgencyLocalAuthorityView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }
  const form = { localAuthorityCode: 'SHEF', localAuthorityDescription: 'Sheffield' }

  it('renders the court name, navigation, errors and submitted form unchanged', () => {
    const errors = [{ href: '#localAuthority', text: 'Local authority cannot be changed' }]
    const view = new UpdateAgencyLocalAuthorityView('Sheffield Crown Court', navigation, errors, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors, form })
  })

  it('defaults absent errors to an empty array', () => {
    const view = new UpdateAgencyLocalAuthorityView('Sheffield Crown Court', navigation, undefined, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors: [], form })
  })
})
