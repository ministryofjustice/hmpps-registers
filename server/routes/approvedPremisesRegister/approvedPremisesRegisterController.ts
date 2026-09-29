import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllApprovedPremisesView from './allApprovedPremisesView'
import ControllerHelper from '../utils/controllerHelper'
import { ApprovedPremisesFilter } from './approvedPremisesMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class ApprovedPremisesRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllApprovedPremises(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/approved-premises-register'
    const approvedPremisesList = await this.prisonRegisterService.getAllApprovedPremises(context(res), filter)
    const view = new AllApprovedPremisesView(approvedPremisesList, filter)
    res.render('pages/approved-premises-register/allApprovedPremises', view.renderArgs)
  }

  parseFilter(req: Request): ApprovedPremisesFilter {
    const filter: ApprovedPremisesFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
