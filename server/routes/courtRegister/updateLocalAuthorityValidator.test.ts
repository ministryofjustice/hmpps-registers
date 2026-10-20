import { Request } from 'express'
import validate from './updateLocalAuthorityValidator'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updateLocalAuthorityValidator', () => {
  const req = { query: { id: 'SHFCC' }, flash: jest.fn() } as unknown as Request
  const getLocalAuthorities = jest.fn<Promise<CodeDescription[]>, []>()
  const updateLocalAuthority = jest.fn<Promise<CourtMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    getLocalAuthorities.mockResolvedValue([
      { code: 'SHEF', description: 'Sheffield' },
      { code: 'LEED', description: 'Leeds' },
    ])
    updateLocalAuthority.mockResolvedValue({ success: true })
  })

  it.each(['SHEF', 'LEED'])('accepts the known local authority code %s', async localAuthorityCode => {
    expect(
      await validate(
        { localAuthorityCode, localAuthorityDescription: 'Not the description' },
        req,
        getLocalAuthorities,
        updateLocalAuthority,
      ),
    ).toBe('/court-register/details?id=SHFCC&action=UPDATED')
    expect(updateLocalAuthority).toHaveBeenCalledWith(localAuthorityCode)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { localAuthorityCode: '' }, { localAuthorityDescription: 'Sheffield' }])(
    'clears the local authority without loading reference data for %j',
    async form => {
      expect(await validate(form, req, getLocalAuthorities, updateLocalAuthority)).toBe(
        '/court-register/details?id=SHFCC&action=UPDATED',
      )
      expect(getLocalAuthorities).not.toHaveBeenCalled()
      expect(updateLocalAuthority).toHaveBeenCalledWith(undefined)
    },
  )

  it('rejects an unknown local authority code', async () => {
    expect(
      await validate(
        { localAuthorityCode: 'Sheffield', localAuthorityDescription: 'Sheffield' },
        req,
        getLocalAuthorities,
        updateLocalAuthority,
      ),
    ).toBe('/court-register/local-authority/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#localAuthority', text: 'Select a valid local authority from the suggestions' },
    ])
    expect(updateLocalAuthority).not.toHaveBeenCalled()
  })

  it('shows API user messages when the update is rejected', async () => {
    updateLocalAuthority.mockResolvedValue({ success: false, userMessage: 'Local authority cannot be changed' })

    expect(await validate({ localAuthorityCode: 'SHEF' }, req, getLocalAuthorities, updateLocalAuthority)).toBe(
      '/court-register/local-authority/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#localAuthority', text: 'Local authority cannot be changed' },
    ])
  })

  it('propagates reference data failures without updating', async () => {
    const error = new Error('Reference data unavailable')
    getLocalAuthorities.mockRejectedValue(error)

    await expect(validate({ localAuthorityCode: 'SHEF' }, req, getLocalAuthorities, updateLocalAuthority)).rejects.toBe(
      error,
    )
    expect(updateLocalAuthority).not.toHaveBeenCalled()
  })
})
