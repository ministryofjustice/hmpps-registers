import type { UpdateAddressForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updateAddressValidator'
import { UpdatePrisonAddress } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

describe('updateAddressValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request
  const updateAddress = jest.fn<Promise<CourtMutationResponse>, [UpdatePrisonAddress]>()
  const validForm: UpdateAddressForm = {
    addressId: 2,
    addressline1: '1 High Street',
    addressline2: 'City Centre',
    addresstown: 'Sheffield',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'S1 2BJ',
    addresscountry: 'England',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    updateAddress.mockResolvedValue({ success: true })
  })

  it('updates the address and returns to court details with a success confirmation', async () => {
    expect(await validate(validForm, req, updateAddress)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(updateAddress).toHaveBeenCalledWith({
      addressLine1: '1 High Street',
      addressLine2: 'City Centre',
      town: 'Sheffield',
      county: 'South Yorkshire',
      postcode: 'S1 2BJ',
      country: 'England',
    })
    expect(req.flash).not.toHaveBeenCalled()
  })

  it('flashes the API user message and returns to the selected address form when updating fails', async () => {
    updateAddress.mockResolvedValue({ success: false, userMessage: 'This address already exists' })

    expect(await validate(validForm, req, updateAddress)).toEqual('/court-register/address/update?id=SHFCC&addressId=2')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#addressline1', text: 'This address already exists' }])
  })

  it('allows optional address fields to be cleared', async () => {
    await validate({ ...validForm, addressline1: '', addressline2: '', addresscounty: '' }, req, updateAddress)

    expect(updateAddress).toHaveBeenCalledWith(
      expect.objectContaining({ addressLine1: '', addressLine2: '', county: '' }),
    )
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([
    ['addresstown', '', 'Enter the town or city'],
    ['addresstown', '   ', 'Enter the town or city'],
    ['addresstown', 'A'.repeat(81), 'Enter the town or city not greater than 80 characters'],
    ['addressline1', 'A'.repeat(81), 'Enter the first line of the address not greater than 80 characters'],
    ['addressline2', 'A'.repeat(81), 'Enter the second line of the address not greater than 80 characters'],
    ['addresscounty', 'A'.repeat(81), 'Enter the county not greater than 80 characters'],
    ['addresspostcode', '', 'Enter the postcode, like AA11AA'],
    ['addresspostcode', 'S1----2BJ', 'Enter the postcode, like AA11AA'],
    ['addresspostcode', 'BANANAS', 'Enter a real postcode, like AA11AA'],
    ['addresscountry', '', 'Select the country'],
  ])('rejects invalid %s: "%s"', async (field, value, text) => {
    expect(await validate({ ...validForm, [field]: value }, req, updateAddress)).toEqual(
      '/court-register/address/update?id=SHFCC&addressId=2',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: `#${field}`, text }])
    expect(updateAddress).not.toHaveBeenCalled()
  })

  it.each(['S1 2B J', 's1 2B j', 'S1-(2BJ)'])('accepts the postcode %s', async addresspostcode => {
    expect(await validate({ ...validForm, addresspostcode }, req, updateAddress)).toEqual(
      '/court-register/details?id=SHFCC&action=UPDATED',
    )
  })

  it('reports missing required fields', async () => {
    await validate({ addressId: 2 } as UpdateAddressForm, req, updateAddress)

    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#addresstown', text: 'Enter the town or city' },
      { href: '#addresspostcode', text: 'Enter the postcode, like AA11AA' },
      { href: '#addresscountry', text: 'Select the country' },
    ])
    expect(updateAddress).not.toHaveBeenCalled()
  })

  it('propagates API errors', async () => {
    updateAddress.mockRejectedValue(new Error('Server error'))

    await expect(validate(validForm, req, updateAddress)).rejects.toThrow('Server error')
    expect(req.flash).not.toHaveBeenCalled()
  })
})
