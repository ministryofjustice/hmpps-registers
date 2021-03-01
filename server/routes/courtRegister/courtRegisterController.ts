import { Request, Response } from 'express'
import CourtRegisterService, { Context } from '../../services/courtRegisterService'
import AllCourtsViewMapper from './allCourtsViewMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}
export default class CourtRegisterController {
  constructor(private readonly courtRegisterService: CourtRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const courts = await this.courtRegisterService.getAllCourts(context(res))

    const mapper = new AllCourtsViewMapper(courts)

    res.render('pages/court-register', mapper.renderArgs)
  }
}
