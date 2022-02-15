import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { prisonPageMapper } from './prisonMapper'
import PrisonDetailsView from './prisonDetailsView'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllPrisons(req: Request, res: Response): Promise<void> {
    const prisons = await this.prisonRegisterService.getAllPrisons(context(res))
    const view = prisonPageMapper(prisons)
    res.render('pages/prison-register/allPrisons', view)
  }

  async viewPrison(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const prison = await this.prisonRegisterService.getPrison(context(res), id)
    const view = new PrisonDetailsView(prison)
    res.render('pages/prison-register/prisonDetails', view.renderArgs)
  }
}
