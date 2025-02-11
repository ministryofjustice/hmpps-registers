import type { WelshPrisonAddressForm } from 'prisonForms'
import AddWelshPrisonAddressView from './addWelshPrisonAddressView'

describe('AddWelshPrisonAddressView', () => {
  const form: WelshPrisonAddressForm = {
    prisonId: 'CFI',
    addressId: '123',
    addressline1inwelsh: 'Line 1',
    addressline2inwelsh: 'Line 2',
    addresstowninwelsh: 'Caerdydd',
    addresscountyinwelsh: 'Glamorgan',
  }

  it('will pass through the form', () => {
    const view = new AddWelshPrisonAddressView(form, [])
    expect(view.renderArgs.form).toEqual({
      addressId: '123',
      prisonId: 'CFI',
      addressline1inwelsh: 'Line 1',
      addressline2inwelsh: 'Line 2',
      addresscountyinwelsh: 'Glamorgan',
      addresstowninwelsh: 'Caerdydd',
    })
  })
})
