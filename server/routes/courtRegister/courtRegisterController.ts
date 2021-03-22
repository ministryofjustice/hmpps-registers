import { Request, Response } from 'express'
import CourtRegisterService, { Context } from '../../services/courtRegisterService'
import AllCourtsView from './allCourtsView'
import CourtDetailsView from './courtDetailsView'
import type { Action } from './courtDetailsView'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}
export default class CourtRegisterController {
  constructor(private readonly courtRegisterService: CourtRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const courts = await this.courtRegisterService.getAllCourts(context(res))

    const view = new AllCourtsView(courts)

    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  async viewCourt(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }

    const court = await this.courtRegisterService.getCourt(context(res), id)

    const view = new CourtDetailsView(court, (action || 'NONE') as Action)

    res.render('pages/court-register/courtDetails', view.renderArgs)
  }

  async toggleCourtActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE' : 'DEACTIVATE'
    await this.courtRegisterService.updateActiveMarker(context(res), id, activate)
    res.redirect(`/court-register/details?id=${id}&action=${action}`)
  }

  addCourtStart(req: Request, res: Response): void {
    res.render('pages/court-register/addCourtStart')
  }
}
