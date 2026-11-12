import { Request, Response } from 'express'
import type { DepartmentContactDetailsForm } from 'agencyForms'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import { AllPrisonsFilter, updatePrisonAreaMapper, updatePrisonMapper } from './prisonMapper'
import PrisonDetailsView, { Action } from './prisonDetailsView'
import AllPrisonsView from './allPrisonsView'
import ControllerHelper from '../utils/controllerHelper'
import UpdatePrisonDetailView from './updatePrisonDetailView'
import prisonDetailFields from './prisonDetailFields'
import updatePrisonDetailValidator from './updatePrisonDetailValidator'
import trimForm from '../../utils/trim'
import prisonAddressValidator from './prisonAddressValidator'
import welshPrisonAddressValidator from './welshPrisonAddressValidator'
import AmendPrisonAddressView from './amendPrisonAddressView'
import AmendWelshPrisonAddressView from './amendWelshPrisonAddressView'
import DeleteWelshPrisonAddressView from './deleteWelshPrisonAddressView'
import {
  InsertPrison,
  PrisonDetails,
  UpdatePrisonAddress,
  UpdateWelshPrisonAddress,
  WelshPrisonAddress,
} from '../../@types/prisonRegister'
import AddPrisonAddressView from './addPrisonAddressView'
import AddWelshPrisonAddressView from './addWelshPrisonAddressView'
import AddNewPrisonDetailsView from './addNewPrisonDetailsView'
import addNewPrisonDetailsValidator from './addNewPrisonDetailsValidator'
import AddNewPrisonSummaryView from './addNewPrisonSummaryView'
import addNewPrisonSummaryValidator from './addNewPrisonSummaryValidator'
import addNewPrisonAddressValidator from './addNewPrisonAddressValidator'
import AddNewPrisonAddressView from './addNewPrisonAddressView'
import UpdateAgencyCjitCodeView from '../agencyRegisters/updateCjitCodeView'
import prisonReferenceFields from './prisonAreaFields'
import DepartmentContactDetailsView from './departmentContactDetailsView'
import validateDepartmentContactDetails from './departmentContactDetailsValidator'
import { departmentTypes, isDepartmentType } from './departmentTypes'
import { validatePrisonCjitCode, validatePrisonReference } from './updatePrisonAreaValidator'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async showAllPrisons(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)
    req.session.prisonListPageLink = '/prison-register'
    const prisons = await this.hmppsAgencyRegisterApiService.getPrisonsWithFilter(context(res), filter)
    const view = new AllPrisonsView(prisons, filter)
    res.render('pages/prison-register/allPrisons', view.renderArgs)
  }

  async viewPrison(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const view = new PrisonDetailsView(prison, (action || 'NONE') as Action)
    res.render('pages/prison-register/prisonDetails', view.renderArgs)
  }

  parseFilter(req: Request): AllPrisonsFilter {
    let gendersFromQuery = ControllerHelper.parseStringArrayFromQuery(req.query.genders as string[])
    if (PrisonRegisterController.doNotFilterIfBothGendersInQuery(gendersFromQuery)) {
      gendersFromQuery = undefined
    }
    const filter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      genders: gendersFromQuery,
      prisonTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.prisonTypeCodes as string[]),
      lthse: ControllerHelper.parseBooleanFromQuery(req.query.lthse as string),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }

  private static doNotFilterIfBothGendersInQuery(stringArray: string[] | undefined): boolean {
    return stringArray?.length === 2
  }

  addNewPrisonStart(req: Request, res: Response): void {
    req.session.addNewPrisonForm = {}
    res.redirect(`/prison-register/add-new-prison-details`)
  }

  async addNewPrisonDetails(req: Request, res: Response): Promise<void> {
    const view = new AddNewPrisonDetailsView(
      req.session.addNewPrisonForm,
      req.session.prisonListPageLink as string,
      req.flash('errors'),
    )

    res.render('pages/prison-register/addNewPrisonDetails', view.renderArgs)
  }

  async submitNewPrisonDetails(req: Request, res: Response): Promise<void> {
    req.session.addNewPrisonForm = { ...req.session.addNewPrisonForm, ...trimForm(req.body) }

    res.redirect(
      await addNewPrisonDetailsValidator(req.session.addNewPrisonForm, req, (id: string) =>
        this.hmppsAgencyRegisterApiService.findPrison(context(res), id),
      ),
    )
  }

  addNewPrisonAddress(req: Request, res: Response): void {
    const view = new AddNewPrisonAddressView(
      req.session.addNewPrisonForm,
      req.session.prisonListPageLink as string,
      req.flash('errors'),
    )

    res.render('pages/prison-register/addNewPrisonAddress', view.renderArgs)
  }

  submitNewPrisonNewAddress(req: Request, res: Response): void {
    req.session.addNewPrisonForm = { ...req.session.addNewPrisonForm, ...trimForm(req.body) }

    res.redirect(addNewPrisonAddressValidator(req.session.addNewPrisonForm, req))
  }

  async addNewPrisonSummary(req: Request, res: Response): Promise<void> {
    req.session.addNewPrisonForm = { ...req.session.addNewPrisonForm, completed: true }

    const view = new AddNewPrisonSummaryView(req.session.addNewPrisonForm, req.session.prisonListPageLink as string)

    res.render('pages/prison-register/addNewPrisonSummary', view.renderArgs)
  }

  async submitNewPrisonSummary(req: Request, res: Response): Promise<void> {
    res.redirect(
      await addNewPrisonSummaryValidator(req.session.addNewPrisonForm, req, (prison: InsertPrison) =>
        this.hmppsAgencyRegisterApiService.addPrison(context(res), prison),
      ),
    )
  }

  addNewPrisonFinished(req: Request, res: Response): void {
    const { id, name } = req.session.addNewPrisonForm
    res.render('pages/prison-register/addNewPrisonFinished', { id, name, backLink: req.session.prisonListPageLink })
  }

  async addPrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId } = req.query as { prisonId: string }

    req.session.addPrisonAddressForm = {
      prisonId,
    }

    const view = new AddPrisonAddressView(req.session.addPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/addPrisonAddress', view.renderArgs)
  }

  async addPrisonAddress(req: Request, res: Response): Promise<void> {
    const view = new AmendPrisonAddressView(req.session.addPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/addPrisonAddress', view.renderArgs)
  }

  async amendPrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId, addressId } = req.query as { prisonId: string; addressId: string }

    const prisonAddress = await this.hmppsAgencyRegisterApiService.getPrisonAddress(context(res), prisonId, addressId)

    req.session.amendPrisonAddressForm = {
      id: addressId,
      prisonId,
      addressline1: prisonAddress.addressLine1,
      addressline2: prisonAddress.addressLine2,
      addresstown: prisonAddress.town,
      addresscounty: prisonAddress.county,
      addresspostcode: prisonAddress.postcode,
      addresscountry: prisonAddress.country,
    }
    const view = new AmendPrisonAddressView(req.session.amendPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/amendPrisonAddress', view.renderArgs)
  }

  async amendPrisonAddress(req: Request, res: Response): Promise<void> {
    const view = new AmendPrisonAddressView(req.session.amendPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/amendPrisonAddress', view.renderArgs)
  }

  async submitAddPrisonAddress(req: Request, res: Response): Promise<void> {
    req.session.addPrisonAddressForm = { ...trimForm(req.body) }
    res.redirect(
      await prisonAddressValidator(
        req.session.addPrisonAddressForm,
        req,
        '/prison-register/add-prison-address',
        form => {
          const newAddress: UpdatePrisonAddress = {
            addressLine1: form.addressline1,
            addressLine2: form.addressline2,
            town: form.addresstown,
            county: form.addresscounty,
            postcode: form.addresspostcode,
            country: form.addresscountry,
          }
          return this.hmppsAgencyRegisterApiService.addPrisonAddress(context(res), form.prisonId, newAddress)
        },
      ),
    )
  }

  async submitAmendPrisonAddress(req: Request, res: Response): Promise<void> {
    req.session.amendPrisonAddressForm = { ...trimForm(req.body) }
    res.redirect(
      await prisonAddressValidator(
        req.session.amendPrisonAddressForm,
        req,
        '/prison-register/amend-prison-address',
        form => {
          const updatedAddress: UpdatePrisonAddress = {
            addressLine1: form.addressline1,
            addressLine2: form.addressline2,
            town: form.addresstown,
            county: form.addresscounty,
            postcode: form.addresspostcode,
            country: form.addresscountry,
          }
          return this.hmppsAgencyRegisterApiService.updatePrisonAddress(
            context(res),
            form.prisonId,
            form.id as string,
            updatedAddress,
          )
        },
      ),
    )
  }

  async deletePrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId, addressId } = req.query as { prisonId: string; addressId: string }

    const prisonAddress = await this.hmppsAgencyRegisterApiService.getPrisonAddress(context(res), prisonId, addressId)

    req.session.amendPrisonAddressForm = {
      id: addressId,
      prisonId,
      addressline1: prisonAddress.addressLine1,
      addressline2: prisonAddress.addressLine2,
      addresstown: prisonAddress.town,
      addresscounty: prisonAddress.county,
      addresspostcode: prisonAddress.postcode,
      addresscountry: prisonAddress.country,
      addressline1inwelsh: prisonAddress.addressLine1InWelsh,
      addressline2inwelsh: prisonAddress.addressLine2InWelsh,
      addresstowninwelsh: prisonAddress.townInWelsh,
      addresscountyinwelsh: prisonAddress.countyInWelsh,
      addresscountryinwelsh: prisonAddress.countryInWelsh,
    }
    const view = new AmendPrisonAddressView(req.session.amendPrisonAddressForm)
    res.render('pages/prison-register/deletePrisonAddress', view.renderArgs)
  }

  async submitDeletePrisonAddress(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deletePrisonAddress(context(res), req.body.prisonId, req.body.id)
    res.redirect(`/prison-register/details?id=${req.body.prisonId}&action=UPDATED`)
  }

  async togglePrisonActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE-PRISON' : 'DEACTIVATE-PRISON'
    await this.hmppsAgencyRegisterApiService.updateActivePrisonMarker(context(res), id, activate)
    res.redirect(`/prison-register/details?id=${id}&action=${action}`)
  }

  async addWelshPrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId, addressId } = req.query as {
      prisonId: string
      addressId: string
    }

    req.session.addWelshPrisonAddressForm = {
      prisonId,
      addressId,
    }

    const view = new AddWelshPrisonAddressView(req.session.addWelshPrisonAddressForm, req.flash('errors'))
    res.render('pages/prison-register/addWelshPrisonAddress', view.renderArgs)
  }

  async addWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    const view = new AddWelshPrisonAddressView(req.session.addWelshPrisonAddressForm, req.flash('errors'))
    res.render('pages/prison-register/addWelshPrisonAddress', view.renderArgs)
  }

  async submitAddWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    const { addressId, prisonId } = req.body
    req.session.addWelshPrisonAddressForm = { ...trimForm(req.body) }
    res.redirect(
      await welshPrisonAddressValidator(
        req.session.addWelshPrisonAddressForm,
        req,
        '/prison-register/add-welsh-prison-address',
        form => {
          const newWelshAddress: WelshPrisonAddress = {
            addressLine1InWelsh: form.addressline1inwelsh,
            addressLine2InWelsh: form.addressline2inwelsh,
            townInWelsh: form.addresstowninwelsh,
            countyInWelsh: form.addresscountyinwelsh,
            countryInWelsh: 'Cymru',
          }
          return this.hmppsAgencyRegisterApiService.updateAddressWithWelshPrisonAddress(
            context(res),
            prisonId,
            addressId as string,
            newWelshAddress,
          )
        },
      ),
    )
  }

  async amendWelshPrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId, addressId } = req.query as { prisonId: string; addressId: string }

    const welshPrisonAddress = await this.hmppsAgencyRegisterApiService.getPrisonAddress(
      context(res),
      prisonId,
      addressId,
    )

    req.session.amendWelshPrisonAddressForm = {
      addressId,
      prisonId,
      addressline1inwelsh: welshPrisonAddress.addressLine1InWelsh,
      addressline2inwelsh: welshPrisonAddress.addressLine2InWelsh,
      addresstowninwelsh: welshPrisonAddress.townInWelsh,
      addresscountyinwelsh: welshPrisonAddress.countyInWelsh,
    }
    const view = new AmendWelshPrisonAddressView(req.session.amendWelshPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/amendWelshPrisonAddress', view.renderArgs)
  }

  async amendWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    const view = new AmendWelshPrisonAddressView(req.session.amendWelshPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/amendWelshPrisonAddress', view.renderArgs)
  }

  async submitAmendWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    req.session.amendWelshPrisonAddressForm = { ...trimForm(req.body) }
    res.redirect(
      await welshPrisonAddressValidator(
        req.session.amendWelshPrisonAddressForm,
        req,
        '/prison-register/amend-welsh-prison-address',
        form => {
          const updatedAddress: WelshPrisonAddress = {
            addressLine1InWelsh: form.addressline1inwelsh,
            addressLine2InWelsh: form.addressline2inwelsh,
            townInWelsh: form.addresstowninwelsh,
            countyInWelsh: form.addresscountyinwelsh,
            countryInWelsh: 'Cymru',
          }
          return this.hmppsAgencyRegisterApiService.updateAddressWithWelshPrisonAddress(
            context(res),
            form.prisonId,
            form.addressId as string,
            updatedAddress,
          )
        },
      ),
    )
  }

  async deleteWelshPrisonAddressStart(req: Request, res: Response): Promise<void> {
    const { prisonId, addressId } = req.query as { prisonId: string; addressId: string }

    const welshPrisonAddress = await this.hmppsAgencyRegisterApiService.getPrisonAddress(
      context(res),
      prisonId,
      addressId,
    )

    req.session.deleteWelshPrisonAddressForm = {
      addressId,
      prisonId,
      addressline1inwelsh: welshPrisonAddress.addressLine1InWelsh,
      addressline2inwelsh: welshPrisonAddress.addressLine2InWelsh,
      addresstowninwelsh: welshPrisonAddress.townInWelsh,
      addresscountyinwelsh: welshPrisonAddress.countyInWelsh,
      addresscountryinwelsh: welshPrisonAddress.countryInWelsh,
      addresspostcode: welshPrisonAddress.postcode,
    }
    const view = new DeleteWelshPrisonAddressView(req.session.deleteWelshPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/deleteWelshPrisonAddress', view.renderArgs)
  }

  async submitDeleteWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    const form: UpdateWelshPrisonAddress & {
      prisonId: string
      addressId: string
    } = trimForm(req.body)

    this.hmppsAgencyRegisterApiService.updateAddressWithWelshPrisonAddress(
      context(res),
      form.prisonId,
      form.addressId,
      {
        addressLine1InWelsh: null,
        addressLine2InWelsh: null,
        townInWelsh: null,
        countyInWelsh: null,
        countryInWelsh: null,
      },
    )
    return res.redirect(`/prison-register/details?id=${form.prisonId}&action=UPDATED`)
  }

  private static detailsUrl(prisonId: string): string {
    return `/prison-register/details?id=${prisonId}`
  }

  private static departmentForm(department: PrisonDetails['departments'][number]): DepartmentContactDetailsForm {
    return {
      departmentType: department.type,
      emailAddress: department.emailAddress ?? '',
      phoneNumber: department.phoneNumber ?? '',
      webAddress: department.webAddress ?? '',
    }
  }

  async addDepartment(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.departmentContactDetailsForm
    const existing = (prison.departments ?? []).map(department => department.type)
    const availableTypes = departmentTypes.filter(type => !existing.includes(type))
    if (!availableTypes.length) return res.redirect(PrisonRegisterController.detailsUrl(id))
    const view = new DepartmentContactDetailsView(
      'create',
      prison.prisonName,
      { cancelButton: PrisonRegisterController.detailsUrl(id) },
      req.session.departmentContactDetailsForm ?? {},
      errors,
      availableTypes,
    )
    return res.render('pages/prison-register/departmentContactDetails', view.renderArgs)
  }

  async submitAddDepartment(req: Request, res: Response): Promise<void> {
    req.session.departmentContactDetailsForm = trimForm(req.body)
    const prisonId = req.query.id as string
    res.redirect(
      await validateDepartmentContactDetails(req.session.departmentContactDetailsForm, req, 'create', async details => {
        const result = await this.hmppsAgencyRegisterApiService.createPrisonContactDetails(
          context(res),
          prisonId,
          details,
        )
        if (result.success) delete req.session.departmentContactDetailsForm
        return result
      }),
    )
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    const { id, departmentType } = req.query as { id: string; departmentType: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const department = (prison.departments ?? []).find(d => d.type === departmentType)
    if (!isDepartmentType(departmentType) || !department) return res.redirect(PrisonRegisterController.detailsUrl(id))
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.departmentContactDetailsForm
    const view = new DepartmentContactDetailsView(
      'update',
      prison.prisonName,
      { cancelButton: PrisonRegisterController.detailsUrl(id) },
      {
        ...PrisonRegisterController.departmentForm(department),
        ...req.session.departmentContactDetailsForm,
        departmentType,
      },
      errors,
    )
    return res.render('pages/prison-register/departmentContactDetails', view.renderArgs)
  }

  async submitUpdateDepartment(req: Request, res: Response): Promise<void> {
    req.session.departmentContactDetailsForm = trimForm(req.body)
    const prisonId = req.query.id as string
    res.redirect(
      await validateDepartmentContactDetails(req.session.departmentContactDetailsForm, req, 'update', async details => {
        const result = await this.hmppsAgencyRegisterApiService.updatePrisonContactDetails(
          context(res),
          prisonId,
          details,
        )
        if (result.success) delete req.session.departmentContactDetailsForm
        return result
      }),
    )
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    const { id, departmentType } = req.query as { id: string; departmentType: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const department = (prison.departments ?? []).find(d => d.type === departmentType)
    if (!department) return res.redirect(PrisonRegisterController.detailsUrl(id))
    const view = new DepartmentContactDetailsView(
      'delete',
      prison.prisonName,
      { cancelButton: PrisonRegisterController.detailsUrl(id) },
      PrisonRegisterController.departmentForm(department),
    )
    return res.render('pages/prison-register/deleteDepartmentContactDetails', view.renderArgs)
  }

  async submitDeleteDepartment(req: Request, res: Response): Promise<void> {
    const { id, departmentType } = req.query as { id: string; departmentType: string }
    if (isDepartmentType(departmentType)) {
      await this.hmppsAgencyRegisterApiService.deletePrisonContactDetails(context(res), id, departmentType)
    }
    res.redirect(`${PrisonRegisterController.detailsUrl(id)}&action=UPDATED`)
  }

  async updateCjitCode(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateCjitCodeForm
    const view = new UpdateAgencyCjitCodeView(
      prison.prisonName,
      { cancelButton: `/prison-register/details?id=${prison.prisonId}` },
      errors,
      req.session.updateCjitCodeForm ? req.session.updateCjitCodeForm.cjitCode : (prison.cjitCode ?? ''),
    )
    res.render('pages/components/edit/updateAgencyCjitCode', view.renderArgs)
  }

  async submitUpdateCjitCode(req: Request, res: Response): Promise<void> {
    req.session.updateCjitCodeForm = trimForm(req.body)
    const prisonId = req.query.id as string
    res.redirect(
      await validatePrisonCjitCode(req.session.updateCjitCodeForm, req, async cjitCode => {
        const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), prisonId)
        const result = await this.hmppsAgencyRegisterApiService.updatePrisonArea(context(res), prisonId, {
          ...updatePrisonAreaMapper(prison),
          cjitCode,
        })
        if (result.success) delete req.session.updateCjitCodeForm
        return result
      }),
    )
  }

  async updatePrisonDetail(req: Request, res: Response, fieldName: string): Promise<void> {
    const config = prisonDetailFields.find(f => f.field === fieldName)
    const { id } = req.query as { id: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrison(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePrisonDetailForm
    const view = new UpdatePrisonDetailView(
      prison.prisonName,
      config.field,
      config.label,
      { cancelButton: `/prison-register/details?id=${id}` },
      errors,
      req.session.updatePrisonDetailForm ?? config.initialForm(prison),
    )
    res.render('pages/prison-register/updatePrisonDetail', view.renderArgs)
  }

  async submitUpdatePrisonDetail(req: Request, res: Response, fieldName: string): Promise<void> {
    const config = prisonDetailFields.find(f => f.field === fieldName)
    req.session.updatePrisonDetailForm = trimForm(req.body)
    const prisonId = req.query.id as string
    res.redirect(
      await updatePrisonDetailValidator(config, req.session.updatePrisonDetailForm, req, async form => {
        const prison = await this.hmppsAgencyRegisterApiService.getPrison(context(res), prisonId)
        const result = await this.hmppsAgencyRegisterApiService.updatePrisonDetails(
          context(res),
          prisonId,
          config.apply(updatePrisonMapper(prison), form),
        )
        if (result.success) delete req.session.updatePrisonDetailForm
        return result
      }),
    )
  }

  async updateReference(req: Request, res: Response, fieldName: string): Promise<void> {
    const config = prisonReferenceFields.find(f => f.field === fieldName)
    const { id } = req.query as { id: string }
    const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), id)
    const session = req.session as unknown as Record<string, Record<string, string> | undefined>
    const errors = req.flash('errors')
    if (!errors?.length) delete session[config.sessionKey]
    const current = config.current(prison)
    const form = session[config.sessionKey] ?? {
      [`${config.field}Code`]: current?.code ?? '',
      [`${config.field}Description`]: current?.description ?? '',
    }
    res.render(
      `pages/components/edit/${config.template}`,
      config.renderArgs(prison.prisonName, { cancelButton: `/prison-register/details?id=${id}` }, errors, form),
    )
  }

  async submitUpdateReference(req: Request, res: Response, fieldName: string): Promise<void> {
    const config = prisonReferenceFields.find(f => f.field === fieldName)
    const session = req.session as unknown as Record<string, Record<string, string> | undefined>
    session[config.sessionKey] = trimForm(req.body)
    const prisonId = req.query.id as string
    res.redirect(
      await validatePrisonReference(
        config,
        session[config.sessionKey],
        req,
        () => config.getItems(this.hmppsAgencyRegisterApiService, context(res)),
        async code => {
          const prison = await this.hmppsAgencyRegisterApiService.getPrisonDetails(context(res), prisonId)
          const update = { ...updatePrisonAreaMapper(prison), [config.dtoKey]: code }
          const result = await this.hmppsAgencyRegisterApiService.updatePrisonArea(context(res), prisonId, update)
          if (result.success) delete session[config.sessionKey]
          return result
        },
      ),
    )
  }
}
