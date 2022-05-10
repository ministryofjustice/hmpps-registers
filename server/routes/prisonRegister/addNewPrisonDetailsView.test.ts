import AddNewPrisonDetailsView from './addNewPrisonDetailsView'

describe('AddNewPrisonDetailsView', () => {
  const view = new AddNewPrisonDetailsView(
    {
      id: 'MDI',
      name: 'Moorland Prison',
      gender: ['male'],
      contracted: 'yes',
      prisonTypes: ['HMP', 'STC'],
      addresstown: 'Doncaster',
      addresspostcode: 'DN12 3AB',
      addresscountry: 'England',
    },
    'http://get-back'
  )
  it('will pass through the gender value items', () => {
    expect(view.renderArgs.genderValues).toEqual([
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
    ])
  })
  it('will pass through the prison type value items', () => {
    expect(view.renderArgs.prisonTypesValues).toEqual([
      { text: "Her Majesty's Prison", value: 'HMP' },
      { text: "Her Majesty's Youth Offender Institution", value: 'YOI' },
      { text: 'Secure Training Centre', value: 'STC' },
      { text: 'Immigration Removal Centre', value: 'IRC' },
    ])
  })
  it('will pass through the back link', () => {
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
