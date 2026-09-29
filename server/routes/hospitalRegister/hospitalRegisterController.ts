import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import AllHospitalsView from './allHospitalsView'
import HospitalDetailsView from './hospitalDetailsView'
import ControllerHelper from '../utils/controllerHelper'
import { HospitalFilter } from './hospitalMapper'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class HospitalRegisterController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async showAllHospitals(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/hospital-register'
    const hospitals = await this.prisonRegisterService.getHospitals(context(res), filter)
    const view = new AllHospitalsView(hospitals, filter)
    res.render('pages/hospital-register/allHospitals', view.renderArgs)
  }

  async viewHospital(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const hospital = await this.prisonRegisterService.getHospital(context(res), id)
    const view = new HospitalDetailsView(hospital)
    res.render('pages/hospital-register/hospitalDetails', view.renderArgs)
  }

  parseFilter(req: Request): HospitalFilter {
    const filter: HospitalFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      highSecurity: ControllerHelper.parseBooleanFromQuery(req.query.highSecurity as string),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
