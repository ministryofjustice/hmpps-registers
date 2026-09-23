import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllCourtsView from './allCourtsView'
import ControllerHelper from '../utils/controllerHelper'
import { CourtsFilter } from './courtMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PrisonRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/court-register'
    const courts = await this.prisonRegisterService.getCourts(context(res), filter)
    const view = new AllCourtsView(courts)
    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  parseFilter(req: Request): CourtsFilter {
    const filter: CourtsFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      courtTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.courtTypeCodes as string[]),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
