import AddNewPrisonAddressView from './addNewPrisonAddressView'

describe('AddNewPrisonAddressView', () => {
  it('will pass through the current form', () => {
    const view = new AddNewPrisonAddressView(
      {
        id: 'MDI',
        name: 'Moorland Prison',
        contracted: 'yes',
        addresscountry: 'England',
        addresspostcode: 'S1 1WS',
        addresstown: 'Sheffield',
        gender: ['male'],
      },
      '',
      []
    )
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
      addresscountry: 'England',
      addresspostcode: 'S1 1WS',
      addresstown: 'Sheffield',
      gender: ['male'],
      contracted: 'yes',
    })
  })
  it('will pass through the back link', () => {
    const view = new AddNewPrisonAddressView(
      {
        id: 'MDI',
        name: 'Moorland Prison',
        addresscountry: 'England',
        addresspostcode: 'S1 1WS',
        addresstown: 'Sheffield',
        gender: ['male'],
        contracted: 'yes',
      },
      'http://get-back',
      []
    )
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
