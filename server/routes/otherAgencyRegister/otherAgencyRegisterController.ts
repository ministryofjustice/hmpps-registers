import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllOtherAgenciesView from './allOtherAgenciesView'
import ControllerHelper from '../utils/controllerHelper'
import { OtherAgencyFilter } from './otherAgencyMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class OtherAgencyRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllOtherAgencies(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/other-agency-register'
    const otherAgencies = await this.prisonRegisterService.getOtherAgencies(context(res), filter)
    const view = new AllOtherAgenciesView(otherAgencies, filter)
    res.render('pages/other-agency-register/allOtherAgencies', view.renderArgs)
  }

  parseFilter(req: Request): OtherAgencyFilter {
    const filter: OtherAgencyFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      otherAgencyTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.otherAgencyTypeCodes as string[]),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
