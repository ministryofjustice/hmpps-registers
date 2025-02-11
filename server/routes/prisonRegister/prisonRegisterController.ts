import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { AllPrisonsFilter } from './prisonMapper'
import PrisonDetailsView, { Action } from './prisonDetailsView'
import AllPrisonsView from './allPrisonsView'
import ControllerHelper from '../utils/controllerHelper'
import AmendPrisonDetailsView from './amendPrisonDetailsView'
import trimForm from '../../utils/trim'
import amendPrisonDetailsValidator from './amendPrisonDetailsValidator'
import prisonAddressValidator from './prisonAddressValidator'
import welshPrisonAddressValidator from './welshPrisonAddressValidator'
import AmendPrisonAddressView from './amendPrisonAddressView'
import AmendWelshPrisonAddressView from './amendWelshPrisonAddressView'
import DeleteWelshPrisonAddressView from './deleteWelshPrisonAddressView'
import {
  InsertPrison,
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

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllPrisons(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)
    req.session.prisonListPageLink = '/prison-register'
    const prisons = await this.prisonRegisterService.getPrisonsWithFilter(context(res), filter)
    const view = new AllPrisonsView(prisons, filter)
    res.render('pages/prison-register/allPrisons', view.renderArgs)
  }

  async viewPrison(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const prison = await this.prisonRegisterService.getPrison(context(res), id)
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
        this.prisonRegisterService.findPrison(context(res), id),
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
        this.prisonRegisterService.addPrison(context(res), prison),
      ),
    )
  }

  addNewPrisonFinished(req: Request, res: Response): void {
    const { id, name } = req.session.addNewPrisonForm
    res.render('pages/prison-register/addNewPrisonFinished', { id, name, backLink: req.session.prisonListPageLink })
  }

  async amendPrisonDetailsStart(req: Request, res: Response): Promise<void> {
    const { prisonId } = req.query as { prisonId: string }

    const [prison] = await Promise.all([this.prisonRegisterService.getPrison(context(res), prisonId)])

    const gender = []
    if (prison.male) gender.push('male')
    if (prison.female) gender.push('female')

    const contracted = prison.contracted ? 'yes' : 'no'
    const lthse = prison.lthse ? 'yes' : 'no'

    req.session.amendPrisonDetailsForm = {
      id: prison.prisonId,
      name: prison.prisonName,
      prisonNameInWelsh: prison.prisonNameInWelsh,
      gender,
      prisonType: prison.types.map(type => type.code),
      contracted,
      lthse,
    }

    const view = new AmendPrisonDetailsView(req.session.amendPrisonDetailsForm, req.flash('errors'))

    res.render('pages/prison-register/amendPrisonDetails', view.renderArgs)
  }

  async amendPrisonDetails(req: Request, res: Response): Promise<void> {
    const view = new AmendPrisonDetailsView(req.session.amendPrisonDetailsForm, req.flash('errors'))

    res.render('pages/prison-register/amendPrisonDetails', view.renderArgs)
  }

  async submitAmendPrisonDetails(req: Request, res: Response): Promise<void> {
    req.session.amendPrisonDetailsForm = { ...trimForm(req.body) }
    res.redirect(
      await amendPrisonDetailsValidator(
        req.session.amendPrisonDetailsForm,
        req,
        (
          prisonId: string,
          name: string,
          prisonNameInWelsh: string,
          contracted: string,
          lthse: string,
          gender: string[],
          prisonTypes: string[],
        ) => {
          const genderArray = ControllerHelper.parseStringArrayFromQuery(gender) || []
          const prisonTypesArray = (ControllerHelper.parseStringArrayFromQuery(prisonTypes) || []) as (
            | 'HMP'
            | 'YOI'
            | 'STC'
            | 'IRC'
          )[]

          return this.prisonRegisterService.updatePrisonDetails(
            context(res),
            prisonId,
            name,
            prisonNameInWelsh || null,
            contracted,
            lthse,
            genderArray.includes('male'),
            genderArray.includes('female'),
            prisonTypesArray,
          )
        },
      ),
    )
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

    const prisonAddress = await this.prisonRegisterService.getPrisonAddress(context(res), prisonId, addressId)

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
          return this.prisonRegisterService.addPrisonAddress(context(res), form.prisonId, newAddress)
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
          return this.prisonRegisterService.updatePrisonAddress(
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

    const prisonAddress = await this.prisonRegisterService.getPrisonAddress(context(res), prisonId, addressId)

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
      towninwelsh: prisonAddress.townInWelsh,
      countyinwelsh: prisonAddress.countyInWelsh,
      countryinwelsh: prisonAddress.countryInWelsh,
    }
    const view = new AmendPrisonAddressView(req.session.amendPrisonAddressForm)
    res.render('pages/prison-register/deletePrisonAddress', view.renderArgs)
  }

  async submitDeletePrisonAddress(req: Request, res: Response): Promise<void> {
    await this.prisonRegisterService.deletePrisonAddress(context(res), req.body.prisonId, req.body.id)
    res.redirect(`/prison-register/details?id=${req.body.prisonId}&action=UPDATED`)
  }

  async togglePrisonActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE-PRISON' : 'DEACTIVATE-PRISON'
    await this.prisonRegisterService.updateActivePrisonMarker(context(res), id, activate)
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
            townInWelsh: form.towninwelsh,
            countyInWelsh: form.countyinwelsh,
            countryInWelsh: 'Cymru',
          }
          return this.prisonRegisterService.updateAddressWithWelshPrisonAddress(
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

    const welshPrisonAddress = await this.prisonRegisterService.getPrisonAddress(context(res), prisonId, addressId)

    req.session.amendWelshPrisonAddressForm = {
      addressId,
      prisonId,
      addressline1inwelsh: welshPrisonAddress.addressLine1InWelsh,
      addressline2inwelsh: welshPrisonAddress.addressLine2InWelsh,
      towninwelsh: welshPrisonAddress.townInWelsh,
      countyinwelsh: welshPrisonAddress.countyInWelsh,
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
            townInWelsh: form.towninwelsh,
            countyInWelsh: form.countyinwelsh,
            countryInWelsh: 'Cymru',
          }
          return this.prisonRegisterService.updateAddressWithWelshPrisonAddress(
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

    const welshPrisonAddress = await this.prisonRegisterService.getPrisonAddress(context(res), prisonId, addressId)

    req.session.deleteWelshPrisonAddressForm = {
      addressId,
      prisonId,
      addressline1inwelsh: welshPrisonAddress.addressLine1InWelsh,
      addressline2inwelsh: welshPrisonAddress.addressLine2InWelsh,
      towninwelsh: welshPrisonAddress.townInWelsh,
      countyinwelsh: welshPrisonAddress.countyInWelsh,
      countryinwelsh: welshPrisonAddress.countryInWelsh,
      addresspostcode: welshPrisonAddress.postcode,
    }
    const view = new DeleteWelshPrisonAddressView(req.session.deleteWelshPrisonAddressForm, req.flash('errors'))

    res.render('pages/prison-register/deleteWelshPrisonAddress', view.renderArgs)
  }

  async submitDeleteWelshPrisonAddress(req: Request, res: Response): Promise<void> {
    const form: UpdateWelshPrisonAddress = trimForm(req.body)

    this.prisonRegisterService.updateAddressWithWelshPrisonAddress(context(res), form.prisonId, form.addressId, {
      addressLine1InWelsh: null,
      addressLine2InWelsh: null,
      townInWelsh: null,
      countyInWelsh: null,
      countryInWelsh: null,
    })
    return res.redirect(`/prison-register/details?id=${form.prisonId}&action=UPDATED`)
  }
}
