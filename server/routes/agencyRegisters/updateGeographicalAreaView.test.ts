import UpdateAgencyGeographicalAreaView from './updateGeographicalAreaView'

describe('UpdateAgencyGeographicalAreaView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('renders the court name, navigation, errors and submitted form unchanged', () => {
    const errors = [{ href: '#geographicalArea', text: 'Select a valid geographical area from the suggestions' }]
    const form = { geographicalAreaCode: 'INVALID', geographicalAreaDescription: 'An unrecognised geographical area' }

    const view = new UpdateAgencyGeographicalAreaView('Sheffield Crown Court', navigation, errors, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors, form })
  })

  it('defaults absent errors to an empty array', () => {
    const form = { geographicalAreaCode: '', geographicalAreaDescription: '' }

    const view = new UpdateAgencyGeographicalAreaView('Sheffield Crown Court', navigation, undefined, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors: [], form })
  })
})
