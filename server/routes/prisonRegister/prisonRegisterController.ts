import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { AllPrisonsFilter } from './prisonMapper'
import PrisonDetailsView, { Action } from './prisonDetailsView'
import AllPrisonsView from './allPrisonsView'
import CourtRegisterController from '../courtRegister/courtRegisterController'
import AmendPrisonDetailsView from './amendPrisonDetailsView'
import trimForm from '../../utils/trim'
import amendPrisonDetailsValidator from './amendPrisonDetailsValidator'

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
    let gendersFromQuery = CourtRegisterController.parseStringArrayFromQuery(req.query.genders as string[])
    if (PrisonRegisterController.doNotFilterIfBothGendersInQuery(gendersFromQuery)) {
      gendersFromQuery = undefined
    }
    const filter = {
      active: CourtRegisterController.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      genders: gendersFromQuery,
      prisonTypeCodes: CourtRegisterController.parseStringArrayFromQuery(req.query.prisonTypeCodes as string[]),
    }
    return CourtRegisterController.removeEmptyValues(filter)
  }

  private static doNotFilterIfBothGendersInQuery(stringArray: string[] | undefined): boolean {
    return stringArray?.length === 2
  }

  async amendPrisonDetailsStart(req: Request, res: Response): Promise<void> {
    const { prisonId } = req.query as { prisonId: string }

    const [prison] = await Promise.all([this.prisonRegisterService.getPrison(context(res), prisonId)])

    req.session.amendPrisonDetailsForm = {
      id: prison.prisonId,
      name: prison.prisonName,
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
      await amendPrisonDetailsValidator(req.session.amendPrisonDetailsForm, req, (prisonId: string, name: string) =>
        this.prisonRegisterService.updatePrisonDetails(context(res), prisonId, name)
      )
    )
  }
}
