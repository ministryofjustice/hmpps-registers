import type { AmendPrisonDetailsForm } from 'prisonForms'
import AmendPrisonDetailsView from './amendPrisonDetailsView'

describe('AmendPrisonDetailsView', () => {
  const form: AmendPrisonDetailsForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    gender: ['female'],
    prisonTypes: ['HMP', 'YOI'],
    contracted: 'yes',
    lthse: 'no',
  }
  it('will pass through the form', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
      contracted: 'yes',
      lthse: 'no',
      gender: ['female'],
      prisonTypes: ['HMP', 'YOI'],
    })
  })
  it('will pass through the gender value items', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.genderValues).toEqual([
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
    ])
  })
  it('will pass through the prison type value items', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.prisonTypesValues).toEqual([
      { text: "His Majesty's Prison (HMP)", value: 'HMP' },
      { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
      { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
      { text: 'Secure Training Centre (STC)', value: 'STC' },
      { text: 'Youth Custody Service (YCS)', value: 'YCS' },
    ])
  })
})
