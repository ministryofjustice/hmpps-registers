import AddNewPrisonDetailsView from './addNewPrisonDetailsView'

describe('AddNewPrisonDetailsView', () => {
  const view = new AddNewPrisonDetailsView(
    {
      id: 'MDI',
      name: 'Moorland Prison',
      prisonNameInWelsh: '',
      gender: ['male'],
      contracted: 'yes',
      lthse: 'no',
      prisonTypes: ['HMP', 'STC'],
      addresstown: 'Doncaster',
      addresspostcode: 'DN12 3AB',
      addresscountry: 'England',
    },
    'http://get-back',
  )
  it('will pass through the gender value items', () => {
    expect(view.renderArgs.genderValues).toEqual([
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
    ])
  })
  it('will pass through the prison type value items', () => {
    expect(view.renderArgs.prisonTypesValues).toEqual([
      { text: "His Majesty's Prison (HMP)", value: 'HMP' },
      { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
      { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
      { text: 'Secure Training Centre (STC)', value: 'STC' },
      { text: 'Youth Custody Service (YCS)', value: 'YCS' },
    ])
  })
  it('will pass through the back link', () => {
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
