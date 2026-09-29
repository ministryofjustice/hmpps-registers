import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllPoliceCustodySuitesView from './allPoliceCustodySuitesView'
import ControllerHelper from '../utils/controllerHelper'
import { PoliceCustodySuiteFilter } from './policeCustodySuiteMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PoliceCustodySuiteRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllPoliceCustodySuites(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/police-custody-suite-register'
    const policeCustodySuites = await this.prisonRegisterService.getPoliceCustodySuites(context(res), filter)
    const view = new AllPoliceCustodySuitesView(policeCustodySuites, filter)
    res.render('pages/police-custody-suite-register/allPoliceCustodySuites', view.renderArgs)
  }

  parseFilter(req: Request): PoliceCustodySuiteFilter {
    const filter: PoliceCustodySuiteFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
