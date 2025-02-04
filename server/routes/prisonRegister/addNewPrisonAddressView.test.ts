import AddNewPrisonAddressView from './addNewPrisonAddressView'

describe('AddNewPrisonAddressView', () => {
  it('will pass through the current form', () => {
    const view = new AddNewPrisonAddressView(
      {
        id: 'MDI',
        name: 'Moorland Prison',
        prisonNameInWelsh: '',
        contracted: 'yes',
        lthse: 'no',
        addresscountry: 'England',
        addresspostcode: 'S1 1WS',
        addresstown: 'Sheffield',
        gender: ['male'],
      },
      '',
      [],
    )
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
      prisonNameInWelsh: '',
      addresscountry: 'England',
      addresspostcode: 'S1 1WS',
      addresstown: 'Sheffield',
      gender: ['male'],
      contracted: 'yes',
      lthse: 'no',
    })
  })
  it('will pass through the back link', () => {
    const view = new AddNewPrisonAddressView(
      {
        id: 'MDI',
        name: 'Moorland Prison',
        prisonNameInWelsh: '',
        addresscountry: 'England',
        addresspostcode: 'S1 1WS',
        addresstown: 'Sheffield',
        gender: ['male'],
        contracted: 'yes',
        lthse: 'no',
      },
      'http://get-back',
      [],
    )
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
