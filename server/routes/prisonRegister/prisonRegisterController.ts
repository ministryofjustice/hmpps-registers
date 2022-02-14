import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { prisonPageMapper } from './prisonMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllPrisons(req: Request, res: Response): Promise<void> {
    const prisons = await this.prisonRegisterService.getPrisons(context(res))
    const view = prisonPageMapper(prisons)
    res.render('pages/prison-register/allPrisons', view)
  }
}
