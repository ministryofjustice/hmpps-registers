import UpdateAgencyRegionView from './updateRegionView'

describe('UpdateAgencyRegionView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('renders the court name, navigation, errors and submitted form unchanged', () => {
    const errors = [{ href: '#region', text: 'Select a valid region from the suggestions' }]
    const form = { regionCode: 'INVALID', regionDescription: 'An unrecognised region' }

    const view = new UpdateAgencyRegionView('Sheffield Crown Court', navigation, errors, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors, form })
  })

  it('defaults absent errors to an empty array', () => {
    const form = { regionCode: '', regionDescription: '' }

    const view = new UpdateAgencyRegionView('Sheffield Crown Court', navigation, undefined, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors: [], form })
  })
})
