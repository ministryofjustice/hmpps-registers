import type { AddAddressForm } from 'agencyForms'
import { Request } from 'express'
import validate from './addAddressValidator'
import { UpdatePrisonAddress } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

describe('addAddressValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const addAddress = jest.fn<Promise<CourtMutationResponse>, [UpdatePrisonAddress]>()

  const validForm: AddAddressForm = {
    addressline1: '1 High Street',
    addressline2: 'City Centre',
    addresstown: 'Sheffield',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'S1 2BJ',
    addresscountry: 'England',
  }

  const createPage = '/court-register/address/create?id=SHFCC'

  beforeEach(() => {
    jest.resetAllMocks()
    addAddress.mockResolvedValue({ success: true })
  })

  it('returns to court details page with a success confirmation when valid', async () => {
    expect(await validate(validForm, req, addAddress)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(req.flash).not.toHaveBeenCalled()
  })

  it('adds the address when valid', async () => {
    await validate(validForm, req, addAddress)

    expect(addAddress).toHaveBeenCalledWith({
      addressLine1: '1 High Street',
      addressLine2: 'City Centre',
      town: 'Sheffield',
      county: 'South Yorkshire',
      postcode: 'S1 2BJ',
      country: 'England',
    })
  })

  it('flashes the API user message and returns to the form when adding fails', async () => {
    addAddress.mockResolvedValue({ success: false, userMessage: 'This address already exists' })

    expect(await validate(validForm, req, addAddress)).toEqual(createPage)
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#addressline1', text: 'This address already exists' }])
  })

  it('allows the optional fields to be empty', async () => {
    const form = { ...validForm, addressline1: '', addressline2: '', addresscounty: '' }

    expect(await validate(form, req, addAddress)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(addAddress).toHaveBeenCalled()
  })

  it.each([
    ['addresstown', '', 'Enter the town or city'],
    ['addresstown', 'A'.repeat(81), 'Enter the town or city not greater than 80 characters'],
    ['addressline1', 'A'.repeat(81), 'Enter the first line of the address not greater than 80 characters'],
    ['addressline2', 'A'.repeat(81), 'Enter the second line of the address not greater than 80 characters'],
    ['addresscounty', 'A'.repeat(81), 'Enter the county not greater than 80 characters'],
    ['addresspostcode', '', 'Enter the postcode, like AA11AA'],
    ['addresspostcode', 'S1----2BJ', 'Enter the postcode, like AA11AA'],
    ['addresspostcode', 'BANANAS', 'Enter a real postcode, like AA11AA'],
    ['addresscountry', '', 'Select the country'],
  ])('rejects %s of "%s"', async (field, value, text) => {
    const form = { ...validForm, [field]: value }

    expect(await validate(form, req, addAddress)).toEqual(createPage)
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: `#${field}`, text }])
    expect(addAddress).not.toHaveBeenCalled()
  })

  it.each(['S1 2B J', 's1 2B j', 'S1-(2BJ)'])('accepts the postcode %s', async addresspostcode => {
    expect(await validate({ ...validForm, addresspostcode }, req, addAddress)).toEqual(
      '/court-register/details?id=SHFCC&action=UPDATED',
    )
  })

  it('reports every invalid field when the form is empty', async () => {
    await validate({} as AddAddressForm, req, addAddress)

    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#addresstown', text: 'Enter the town or city' },
      { href: '#addresspostcode', text: 'Enter the postcode, like AA11AA' },
      { href: '#addresscountry', text: 'Select the country' },
    ])
  })

  it('propagates an error when adding the address fails', async () => {
    addAddress.mockRejectedValue(new Error('Server error'))

    await expect(validate(validForm, req, addAddress)).rejects.toThrow('Server error')
    expect(req.flash).not.toHaveBeenCalled()
  })
})
