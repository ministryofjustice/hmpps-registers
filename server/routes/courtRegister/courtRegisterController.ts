import { Request, Response } from 'express'
import CourtRegisterService, { Context } from '../../services/courtRegisterService'
import AllCourtsView from './allCourtsView'
import CourtDetailsView from './courtDetailsView'

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
    const court = await this.courtRegisterService.getCourt(context(res), extractCourtId(req))

    const view = new CourtDetailsView(court)

    res.render('pages/court-register/courtDetails', view.renderArgs)
  }
}

function extractCourtId(req: Request): string {
  if (req.query && req.query.id) {
    const { id } = (req.query as unknown) as { id: string }
    return id
  }
  return undefined
}
