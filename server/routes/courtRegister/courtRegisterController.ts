import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllCourtsView from './allCourtsView'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    req.session.allListPageLink = '/court-register'
    const courts = await this.prisonRegisterService.getCourts(context(res))
    const view = new AllCourtsView(courts)
    res.render('pages/court-register/allCourts', view.renderArgs)
  }
}
