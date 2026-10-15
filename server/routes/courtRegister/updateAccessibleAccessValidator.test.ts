import type { UpdateAccessibleAccessForm } from 'agencyForms'
import { Request } from 'express'
import type { UpdateCourt } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'
import validate from './updateAccessibleAccessValidator'

describe('updateAccessibleAccessValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request
  const updateAccessibleAccess = jest.fn<Promise<CourtMutationResponse>, [UpdateCourt['accessibleAccess']]>()

  beforeEach(() => {
    jest.resetAllMocks()
    updateAccessibleAccess.mockResolvedValue({ success: true })
  })

  it.each(['NONE', 'ACCESSIBLE', 'BY_ARRANGEMENT_ONLY', 'WHEELCHAIR_ACCESS'])(
    'accepts accessible access option %s and updates the court',
    async accessibleAccess => {
      expect(await validate({ accessibleAccess }, req, updateAccessibleAccess)).toBe(
        '/court-register/details?id=SHFCC&action=UPDATED',
      )
      expect(updateAccessibleAccess).toHaveBeenCalledWith(accessibleAccess)
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('accepts UNKNOWN and passes undefined to clear accessible access', async () => {
    expect(await validate({ accessibleAccess: 'UNKNOWN' }, req, updateAccessibleAccess)).toBe(
      '/court-register/details?id=SHFCC&action=UPDATED',
    )
    expect(updateAccessibleAccess).toHaveBeenCalledWith(undefined)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([undefined, ''])('requires an accessible access selection: %p', async accessibleAccess => {
    expect(await validate({ accessibleAccess } as UpdateAccessibleAccessForm, req, updateAccessibleAccess)).toBe(
      '/court-register/accessible-access/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#accessibleAccess', text: 'Select an accessible access option' },
    ])
    expect(updateAccessibleAccess).not.toHaveBeenCalled()
  })

  it.each(['XX', 'accessible', 'Yes, access is accessible', 'NONE '])(
    'rejects an unknown accessible access option: %s',
    async accessibleAccess => {
      expect(await validate({ accessibleAccess }, req, updateAccessibleAccess)).toBe(
        '/court-register/accessible-access/update?id=SHFCC',
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#accessibleAccess', text: 'Select a valid accessible access option' },
      ])
      expect(updateAccessibleAccess).not.toHaveBeenCalled()
    },
  )

  it('flashes the API user message and returns to the form when updating fails', async () => {
    updateAccessibleAccess.mockResolvedValue({ success: false, userMessage: 'Access details not allowed' })

    expect(await validate({ accessibleAccess: 'ACCESSIBLE' }, req, updateAccessibleAccess)).toBe(
      '/court-register/accessible-access/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#accessibleAccess', text: 'Access details not allowed' },
    ])
  })

  it('propagates unexpected API errors', async () => {
    updateAccessibleAccess.mockRejectedValue(new Error('Server error'))

    await expect(validate({ accessibleAccess: 'ACCESSIBLE' }, req, updateAccessibleAccess)).rejects.toThrow(
      'Server error',
    )
    expect(req.flash).not.toHaveBeenCalled()
  })
})
