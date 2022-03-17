import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { AllPrisonsFilter } from './prisonMapper'
import PrisonDetailsView, { Action } from './prisonDetailsView'
import AllPrisonsView from './allPrisonsView'
import ControllerHelper from '../utils/controllerHelper'
import AmendPrisonDetailsView from './amendPrisonDetailsView'
import trimForm from '../../utils/trim'
import amendPrisonDetailsValidator from './amendPrisonDetailsValidator'
import amendPrisonAddressValidator from './amendPrisonAddressValidator'
import AmendPrisonAddressView from './amendPrisonAddressView'
import { UpdatePrisonAddress } from '../../@types/prisonRegister'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllPrisons(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)
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
    }
    return ControllerHelper.removeEmptyValues(filter)
  }

  private static doNotFilterIfBothGendersInQuery(stringArray: string[] | undefined): boolean {
    return stringArray?.length === 2
  }

  async amendPrisonDetailsStart(req: Request, res: Response): Promise<void> {
    const { prisonId } = req.query as { prisonId: string }

    const [prison] = await Promise.all([this.prisonRegisterService.getPrison(context(res), prisonId)])

    const gender = []
    if (prison.male) gender.push('male')
    if (prison.female) gender.push('female')
    req.session.amendPrisonDetailsForm = {
      id: prison.prisonId,
      name: prison.prisonName,
      gender,
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
        (prisonId: string, name: string, gender: string[]) => {
          const genderArray = ControllerHelper.parseStringArrayFromQuery(gender) || []
          return this.prisonRegisterService.updatePrisonDetails(
            context(res),
            prisonId,
            name,
            genderArray.includes('male'),
            genderArray.includes('female')
          )
        }
      )
    )
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

  async submitAmendPrisonAddress(req: Request, res: Response): Promise<void> {
    req.session.amendPrisonAddressForm = { ...trimForm(req.body) }
    res.redirect(
      await amendPrisonAddressValidator(req.session.amendPrisonAddressForm, req, form => {
        const updatedAddress: UpdatePrisonAddress = {
          addressLine1: form.addressline1,
          addressLine2: form.addressline2,
          town: form.addresstown,
          county: form.addresscounty,
          postcode: form.addresspostcode,
          country: form.addresscountry,
        }
        return this.prisonRegisterService.updatePrisonAddress(context(res), form.prisonId, form.id, updatedAddress)
      })
    )
  }

  async togglePrisonActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE-PRISON' : 'DEACTIVATE-PRISON'
    await this.prisonRegisterService.updateActivePrisonMarker(context(res), id, activate)
    res.redirect(`/prison-register/details?id=${id}&action=${action}`)
  }
}
