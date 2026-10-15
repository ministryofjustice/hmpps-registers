import type { UpdateCjitCodeForm } from 'agencyForms'
import type { Request } from 'express'
import validate from './updateCjitCodeValidator'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

describe('updateCjitCodeValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const updateCjitCode = jest.fn<Promise<CourtMutationResponse>, [string]>()

  beforeEach(() => {
    jest.resetAllMocks()
    updateCjitCode.mockResolvedValue({ success: true })
  })

  it.each<UpdateCjitCodeForm>([{ cjitCode: 'C00SH00' }, { cjitCode: '123456789012' }, { cjitCode: '' }, {}])(
    'accepts an optional CJIT code of up to 12 characters: %j',
    async form => {
      expect(await validate(form, req, updateCjitCode)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(updateCjitCode).toHaveBeenCalledTimes(1)
      expect(updateCjitCode).toHaveBeenCalledWith(form.cjitCode ?? '')
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('rejects a CJIT code of 13 characters without calling the update callback', async () => {
    expect(await validate({ cjitCode: '1234567890123' }, req, updateCjitCode)).toEqual(
      '/court-register/cjit-code/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#cjitCode', text: 'CJIT code must be 12 characters or fewer' },
    ])
    expect(updateCjitCode).not.toHaveBeenCalled()
  })

  it('flashes the API user message and returns to the form when the update is rejected', async () => {
    updateCjitCode.mockResolvedValue({ success: false, userMessage: 'CJIT code already exists' })

    expect(await validate({ cjitCode: 'C00SH00' }, req, updateCjitCode)).toEqual(
      '/court-register/cjit-code/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#cjitCode', text: 'CJIT code already exists' }])
  })

  it('propagates unexpected API errors', async () => {
    const error = new Error('Server error')
    updateCjitCode.mockRejectedValue(error)

    await expect(validate({ cjitCode: 'C00SH00' }, req, updateCjitCode)).rejects.toBe(error)
    expect(req.flash).not.toHaveBeenCalled()
  })
})
