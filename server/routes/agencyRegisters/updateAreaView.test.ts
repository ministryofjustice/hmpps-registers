import UpdateAgencyAreaView from './updateAreaView'

describe('UpdateAgencyAreaView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('renders the court name, navigation, errors and submitted form unchanged', () => {
    const errors = [{ href: '#area', text: 'Select a valid area from the suggestions' }]
    const form = { areaName: 'INVALID - An unrecognised area' }

    const view = new UpdateAgencyAreaView('Sheffield Crown Court', navigation, errors, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors, form })
  })

  it.each([{ errors: undefined }, { errors: null }, { errors: [] }])(
    'defaults absent errors to an empty array: %j',
    ({ errors }) => {
      const form = { areaName: '' }

      const view = new UpdateAgencyAreaView('Sheffield Crown Court', navigation, errors, form)

      expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors: [], form })
    },
  )
})
