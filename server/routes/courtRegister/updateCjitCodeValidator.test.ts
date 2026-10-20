import type { UpdateCjitCodeForm } from 'agencyForms'
import type { Request } from 'express'
import validate from './updateCjitCodeValidator'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

describe('updateCjitCodeValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const updateCjitCode = jest.fn<Promise<AgencyMutationResponse>, [string]>()

  beforeEach(() => {
    jest.resetAllMocks()
    updateCjitCode.mockResolvedValue({ success: true })
  })

  it.each<UpdateCjitCodeForm>([{ cjitCode: 'C00SH00' }, { cjitCode: '1234567' }, { cjitCode: '' }, {}])(
    'accepts an optional CJIT code of up to 7 characters: %j',
    async form => {
      expect(await validate(form, req, updateCjitCode)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(updateCjitCode).toHaveBeenCalledTimes(1)
      expect(updateCjitCode).toHaveBeenCalledWith(form.cjitCode ?? '')
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('rejects a CJIT code of 8 characters without calling the update callback', async () => {
    expect(await validate({ cjitCode: '12345678' }, req, updateCjitCode)).toEqual(
      '/court-register/cjit-code/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#cjitCode', text: 'CJIT code must be 7 characters or fewer' },
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
