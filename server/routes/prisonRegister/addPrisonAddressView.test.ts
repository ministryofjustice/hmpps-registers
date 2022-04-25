import type { PrisonAddressForm } from 'prisonForms'
import AddPrisonAddressView from './addPrisonAddressView'

describe('AddPrisonAddressView', () => {
  const form: PrisonAddressForm = {
    prisonId: 'MDI',
    addressline1: 'Bawtry Road',
    addressline2: 'Hatfield Woodhouse',
    addresstown: 'Doncaster',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'DN7 6BW',
    addresscountry: 'England',
  }

  it('will pass through the form', () => {
    const view = new AddPrisonAddressView(form, [])
    expect(view.renderArgs.form).toEqual({
      prisonId: 'MDI',
      addressline1: 'Bawtry Road',
      addressline2: 'Hatfield Woodhouse',
      addresstown: 'Doncaster',
      addresscounty: 'South Yorkshire',
      addresspostcode: 'DN7 6BW',
      addresscountry: 'England',
    })
  })
})
