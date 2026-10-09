import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllCourtsView from './allCourtsView'
import ControllerHelper from '../utils/controllerHelper'
import { CourtsFilter } from './courtMapper'
import CourtDetailsView, { Action } from './courtDetailsView'
import AddAgencyEmailView from '../agencyRegisters/addEmailView'
import trimForm from '../../utils/trim'
import addEmailAddressValidator from './addEmailAddressValidator'
import updateEmailAddressValidator from './updateEmailAddressValidator'
import { AgencyEmailAddress, EmailAddress, UpdateEmailAddress } from '../../@types/prisonRegister'
import UpdateAgencyEmailView from '../agencyRegisters/updateEmailView'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/court-register'
    const courts = await this.prisonRegisterService.getCourts(context(res), filter)
    const view = new AllCourtsView(courts, filter)
    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  async viewCourt(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const court = await this.prisonRegisterService.getCourt(context(res), id)
    const view = new CourtDetailsView(court, (action || 'NONE') as Action)
    res.render('pages/court-register/courtDetails', view.renderArgs)
  }

  async addEmail(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.prisonRegisterService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.addEmailAddressForm
    }
    const view = new AddAgencyEmailView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.addEmailAddressForm?.emailAddress,
    )
    res.render('pages/components/edit/addAgencyEmail', view.renderArgs)
  }

  async submitAddEmail(req: Request, res: Response): Promise<void> {
    req.session.addEmailAddressForm = trimForm(req.body)

    res.redirect(
      await addEmailAddressValidator(
        req.session.addEmailAddressForm,
        req,
        async (addEmailAddress: EmailAddress): Promise<AgencyEmailAddress> => {
          const emailAddress = await this.prisonRegisterService.addCourtEmailAddress(
            context(res),
            req.query.id as string,
            addEmailAddress,
          )
          delete req.session.addEmailAddressForm
          return emailAddress
        },
      ),
    )
  }

  async updateEmail(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const emailId = Number(req.query.emailId)
    const court = await this.prisonRegisterService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateEmailAddressForm
    }
    const view = new UpdateAgencyEmailView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session?.updateEmailAddressForm?.emailAddress ??
        court.emailAddresses.find(email => email.id === emailId)?.address,
      emailId,
    )
    res.render('pages/components/edit/updateAgencyEmail', view.renderArgs)
  }

  async submitUpdateEmail(req: Request, res: Response): Promise<void> {
    req.session.updateEmailAddressForm = trimForm(req.body)

    res.redirect(
      await updateEmailAddressValidator(
        req.session.updateEmailAddressForm,
        req,
        async (updateEmailAddress: UpdateEmailAddress): Promise<AgencyEmailAddress> => {
          const emailAddress = await this.prisonRegisterService.updateCourtEmailAddress(
            context(res),
            req.query.id as string,
            Number(req.session.updateEmailAddressForm.emailId),
            updateEmailAddress,
          )
          delete req.session.updateEmailAddressForm
          return emailAddress
        },
      ),
    )
  }

  parseFilter(req: Request): CourtsFilter {
    const filter: CourtsFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      courtTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.courtTypeCodes as string[]),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
