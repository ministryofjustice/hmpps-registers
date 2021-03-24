import { Request, Response } from 'express'
import CourtRegisterService, { Context } from '../../services/courtRegisterService'
import AllCourtsView from './allCourtsView'
import CourtDetailsView from './courtDetailsView'
import type { Action } from './courtDetailsView'
import AddNewCourtDetailsView from './addNewCourtDetailsView'
import AddNewCourtSummaryView from './addNewCourtSummaryView'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}
export default class CourtRegisterController {
  constructor(private readonly courtRegisterService: CourtRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const courts = await this.courtRegisterService.getAllCourts(context(res))

    const view = new AllCourtsView(courts)

    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  async viewCourt(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }

    const court = await this.courtRegisterService.getCourt(context(res), id)

    const view = new CourtDetailsView(court, (action || 'NONE') as Action)

    res.render('pages/court-register/courtDetails', view.renderArgs)
  }

  async toggleCourtActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE' : 'DEACTIVATE'
    await this.courtRegisterService.updateActiveMarker(context(res), id, activate)
    res.redirect(`/court-register/details?id=${id}&action=${action}`)
  }

  async addNewCourtDetails(req: Request, res: Response): Promise<void> {
    const { mode } = req.query as { mode?: 'review' }
    if (mode !== 'review') {
      req.session.addNewCourtForm = {}
    }

    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtDetailsView(req.session.addNewCourtForm, courtTypes)

    res.render('pages/court-register/addNewCourtDetails', view.renderArgs)
  }

  submitNewCourtDetails(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }
    res.redirect('/court-register/add-new-court-building')
  }

  addNewCourtBuilding(req: Request, res: Response): void {
    res.render('pages/court-register/addNewCourtBuilding', req.session.addNewCourtForm)
  }

  submitNewCourtNewBuilding(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }
    res.redirect('/court-register/add-new-court-contact-details')
  }

  addNewCourtContactDetails(req: Request, res: Response): void {
    res.render('pages/court-register/addNewCourtContactDetails', req.session.addNewCourtForm)
  }

  submitNewCourtContactDetails(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }
    res.redirect('/court-register/add-new-court-summary')
  }

  async addNewCourtSummary(req: Request, res: Response): Promise<void> {
    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtSummaryView(req.session.addNewCourtForm, courtTypes)

    res.render('pages/court-register/addNewCourtSummary', view.renderArgs)
  }

  submitNewCourtFinished(req: Request, res: Response): void {
    res.redirect('/court-register/add-new-court-finished')
  }

  addNewCourtFinished(req: Request, res: Response): void {
    const { id, name } = req.session.addNewCourtForm
    res.render('pages/court-register/addNewCourtFinished', { id, name })
  }
}
