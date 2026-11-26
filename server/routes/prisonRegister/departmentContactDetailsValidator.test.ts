import { Request } from 'express'
import type { DepartmentContactDetailsForm } from 'agencyForms'
import validate from './departmentContactDetailsValidator'
import type { ContactDetails } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

describe('departmentContactDetailsValidator', () => {
  const flash = jest.fn()
  const reqFor = (query: Record<string, string>) => ({ query, flash }) as unknown as Request
  const save = jest.fn<Promise<AgencyMutationResponse>, [ContactDetails]>()

  const form: DepartmentContactDetailsForm = {
    departmentType: 'SOCIAL_VISIT',
    emailAddress: 'visits@example.com',
    phoneNumber: '01302 111111',
    webAddress: 'https://www.example.com',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    save.mockResolvedValue({ success: true })
  })

  it('saves and returns to details on create', async () => {
    const next = await validate(form, reqFor({ id: 'MDI' }), 'create', save)
    expect(next).toEqual('/prison-register/details?id=MDI&action=UPDATED')
    expect(save).toHaveBeenCalledWith({
      type: 'SOCIAL_VISIT',
      emailAddress: 'visits@example.com',
      phoneNumber: '01302 111111',
      webAddress: 'https://www.example.com',
    })
    expect(flash).not.toHaveBeenCalled()
  })

  it('uses the type from the query on update, ignoring the form', async () => {
    await validate(
      { ...form, departmentType: undefined },
      reqFor({ id: 'MDI', departmentType: 'PRISON' }),
      'update',
      save,
    )
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ type: 'PRISON' }))
  })

  it('allows all fields to be empty, sending null', async () => {
    await validate(
      { departmentType: 'PRISON', emailAddress: '', phoneNumber: '', webAddress: '' },
      reqFor({ id: 'MDI' }),
      'create',
      save,
    )
    expect(save).toHaveBeenCalledWith({ type: 'PRISON', emailAddress: null, phoneNumber: null, webAddress: null })
    expect(flash).not.toHaveBeenCalled()
  })

  it('requires a type on create', async () => {
    const next = await validate({ ...form, departmentType: undefined }, reqFor({ id: 'MDI' }), 'create', save)
    expect(next).toEqual('/prison-register/department/create?id=MDI')
    expect(flash).toHaveBeenCalledWith('errors', [{ text: 'Select a department type', href: '#departmentType' }])
    expect(save).not.toHaveBeenCalled()
  })

  it('validates email, phone and web address', async () => {
    const next = await validate(
      { ...form, emailAddress: 'bad', phoneNumber: 'abc', webAddress: 'nope' },
      reqFor({ id: 'MDI', departmentType: 'SOCIAL_VISIT' }),
      'update',
      save,
    )
    expect(next).toEqual('/prison-register/department/update?id=MDI&departmentType=SOCIAL_VISIT')
    const errors = flash.mock.calls[0][1]
    expect(errors.map((e: { href: string }) => e.href).sort()).toEqual(['#emailAddress', '#phoneNumber', '#webAddress'])
    expect(save).not.toHaveBeenCalled()
  })

  it('rejects non http(s) web addresses', async () => {
    await validate({ ...form, webAddress: 'ftp://example.com' }, reqFor({ id: 'MDI' }), 'create', save)
    expect(flash).toHaveBeenCalled()
  })

  it('flashes API user message on failure', async () => {
    save.mockResolvedValue({ success: false, userMessage: 'Already exists' })
    const next = await validate(form, reqFor({ id: 'MDI' }), 'create', save)
    expect(next).toEqual('/prison-register/department/create?id=MDI')
    expect(flash).toHaveBeenCalledWith('errors', [{ text: 'Already exists' }])
  })
})
