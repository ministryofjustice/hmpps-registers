import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllProbationOfficesView from './allProbationOfficesView'
import ControllerHelper from '../utils/controllerHelper'
import { ProbationOfficeFilter } from './probationOfficeMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class ProbationOfficeRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllProbationOffices(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/probation-office-register'
    const probationOffices = await this.prisonRegisterService.getProbationOffices(context(res), filter)
    const view = new AllProbationOfficesView(probationOffices, filter)
    res.render('pages/probation-office-register/allProbationOffices', view.renderArgs)
  }

  parseFilter(req: Request): ProbationOfficeFilter {
    const filter: ProbationOfficeFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
