import { Request, Response } from 'express'
import CourtRegisterService, { AddCourt, Context } from '../../services/courtRegisterService'
import AllCourtsView from './allCourtsView'
import type { Action } from './courtDetailsView'
import CourtDetailsView from './courtDetailsView'
import AddNewCourtDetailsView from './addNewCourtDetailsView'
import AddNewCourtSummaryView from './addNewCourtSummaryView'
import AddNewCourtBuildingView from './addNewCourtBuildingView'
import AddNewCourtContactDetailsView from './addNewCourtContactDetailsView'
import addNewCourtDetailsValidator from './addNewCourtDetailsValidator'
import addNewCourtBuildingValidator from './addNewCourtBuildingValidator'
import addNewCourtContactDetailsValidator from './addNewCourtContactDetailsValidator'
import addNewCourtSummaryValidator from './addNewCourtSummaryValidator'
import AllCourtsPagedView from './allCourtsPagedView'
import AmendCourtDetailsView from './amendCourtDetailsView'
import amendCourtDetailsValidator from './amendCourtDetailsValidator'
import AmendCourtBuildingView from './amendCourtBuildingView'
import amendCourtBuildingValidator from './amendCourtBuildingValidator'
import { UpdateCourtBuilding } from '../../@types/courtRegister'
import { AllCourtsFilter } from './courtMapper'
import AddCourtBuildingView from './addCourtBuildingView'

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

  async showAllCourtsPaged(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1
    const filter = this.parseFilter(req)
    const courtsPage = await this.courtRegisterService.getPageOfCourts(context(res), page - 1, 40, filter)

    const view = new AllCourtsPagedView(courtsPage, filter)

    res.render('pages/court-register/allCourtsPaged', view.renderArgs)
  }

  parseFilter(req: Request): AllCourtsFilter {
    return {
      active: CourtRegisterController.parseBooleanFromQuery(req.query.active as string),
      courtTypeIds: CourtRegisterController.parseStringArrayFromQuery(req.query.courtTypeIds as string[]),
    }
  }

  private static parseBooleanFromQuery(boolAsString: string | undefined): boolean | null {
    if (boolAsString === 'true') return true
    if (boolAsString === 'false') return false
    return null
  }

  private static parseStringArrayFromQuery(stringArray: string | string[] | undefined): string[] | null {
    if (!stringArray) return null
    if (typeof stringArray === 'string') return [stringArray]
    return stringArray
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

  addNewCourtStart(req: Request, res: Response): void {
    req.session.addNewCourtForm = {}
    res.redirect(`/court-register/add-new-court-details`)
  }

  async addNewCourtDetails(req: Request, res: Response): Promise<void> {
    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtDetailsView(req.session.addNewCourtForm, courtTypes, req.flash('errors'))

    res.render('pages/court-register/addNewCourtDetails', view.renderArgs)
  }

  async submitNewCourtDetails(req: Request, res: Response): Promise<void> {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }

    res.redirect(
      await addNewCourtDetailsValidator(req.session.addNewCourtForm, req, (id: string) =>
        this.courtRegisterService.findCourt(context(res), id)
      )
    )
  }

  addNewCourtBuilding(req: Request, res: Response): void {
    const view = new AddNewCourtBuildingView(req.session.addNewCourtForm, req.flash('errors'))

    res.render('pages/court-register/addNewCourtBuilding', view.renderArgs)
  }

  submitNewCourtNewBuilding(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }

    res.redirect(addNewCourtBuildingValidator(req.session.addNewCourtForm, req))
  }

  addNewCourtContactDetails(req: Request, res: Response): void {
    const view = new AddNewCourtContactDetailsView(req.session.addNewCourtForm, req.flash('errors'))

    res.render('pages/court-register/addNewCourtContactDetails', view.renderArgs)
  }

  submitNewCourtContactDetails(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...req.body }

    res.redirect(addNewCourtContactDetailsValidator(req.session.addNewCourtForm, req))
  }

  async addNewCourtSummary(req: Request, res: Response): Promise<void> {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, completed: true }

    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtSummaryView(req.session.addNewCourtForm, courtTypes)

    res.render('pages/court-register/addNewCourtSummary', view.renderArgs)
  }

  async submitNewCourtSummary(req: Request, res: Response): Promise<void> {
    res.redirect(
      await addNewCourtSummaryValidator(req.session.addNewCourtForm, req, (court: AddCourt) =>
        this.courtRegisterService.addCourt(context(res), court)
      )
    )
  }

  addNewCourtFinished(req: Request, res: Response): void {
    const { id, name } = req.session.addNewCourtForm
    res.render('pages/court-register/addNewCourtFinished', { id, name })
  }

  async amendCourtDetailsStart(req: Request, res: Response): Promise<void> {
    const { courtId } = req.query as { courtId: string }

    const [court, courtTypes] = await Promise.all([
      this.courtRegisterService.getCourt(context(res), courtId),
      this.courtRegisterService.getCourtTypes(context(res)),
    ])

    req.session.amendCourtDetailsForm = {
      id: court.courtId,
      name: court.courtName,
      description: court.courtDescription,
      type: court.type.courtType,
    }

    const view = new AmendCourtDetailsView(req.session.amendCourtDetailsForm, courtTypes, req.flash('errors'))

    res.render('pages/court-register/amendCourtDetails', view.renderArgs)
  }

  async amendCourtDetails(req: Request, res: Response): Promise<void> {
    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AmendCourtDetailsView(req.session.amendCourtDetailsForm, courtTypes, req.flash('errors'))

    res.render('pages/court-register/amendCourtDetails', view.renderArgs)
  }

  async submitAmendCourtDetails(req: Request, res: Response): Promise<void> {
    req.session.amendCourtDetailsForm = { ...req.body }
    res.redirect(
      await amendCourtDetailsValidator(
        req.session.amendCourtDetailsForm,
        req,
        (courtId: string, name: string, type: string, description: string) =>
          this.courtRegisterService.updateCourtDetails(context(res), courtId, name, type, description)
      )
    )
  }

  async amendCourtBuildingStart(req: Request, res: Response): Promise<void> {
    const { courtId, buildingId } = req.query as { courtId: string; buildingId: string }

    const courtBuilding = await this.courtRegisterService.getCourtBuilding(context(res), courtId, buildingId)

    req.session.amendCourtBuildingForm = {
      id: courtBuilding.id,
      courtId: courtBuilding.courtId,
      originalbuildingname: courtBuilding.buildingName,
      buildingname: courtBuilding.buildingName,
      subCode: courtBuilding.subCode,
      addressline1: courtBuilding.street,
      addressline2: courtBuilding.locality,
      addresstown: courtBuilding.town,
      addresscounty: courtBuilding.county,
      addresspostcode: courtBuilding.postcode,
      addresscountry: courtBuilding.country,
    }

    const view = new AmendCourtBuildingView(req.session.amendCourtBuildingForm, req.flash('errors'))

    res.render('pages/court-register/amendCourtBuilding', view.renderArgs)
  }

  async amendCourtBuilding(req: Request, res: Response): Promise<void> {
    const view = new AmendCourtBuildingView(req.session.amendCourtBuildingForm, req.flash('errors'))

    res.render('pages/court-register/amendCourtBuilding', view.renderArgs)
  }

  async submitAmendCourtBuilding(req: Request, res: Response): Promise<void> {
    req.session.amendCourtBuildingForm = { ...req.body }
    res.redirect(
      await amendCourtBuildingValidator(
        req.session.amendCourtBuildingForm,
        req,
        form => {
          const updatedBuilding: UpdateCourtBuilding = {
            buildingName: form.buildingname,
            street: form.addressline1,
            locality: form.addressline2,
            town: form.addresstown,
            county: form.addresscounty,
            postcode: form.addresspostcode,
            country: form.addresscountry,
            subCode: form.subCode,
          }
          return this.courtRegisterService.updateCourtBuilding(context(res), form.courtId, form.id, updatedBuilding)
        },
        subCode => this.courtRegisterService.findCourt(context(res), subCode),
        subCode => this.courtRegisterService.findCourtBuilding(context(res), subCode)
      )
    )
  }

  async addCourtBuildingStart(req: Request, res: Response): Promise<void> {
    const { courtId } = req.query as { courtId: string }

    req.session.addCourtBuildingForm = {
      courtId,
    }

    const view = new AddCourtBuildingView(req.session.addCourtBuildingForm, req.flash('errors'))

    res.render('pages/court-register/addCourtBuilding', view.renderArgs)
  }

  async addCourtBuilding(req: Request, res: Response): Promise<void> {
    const view = new AddCourtBuildingView(req.session.addCourtBuildingForm, req.flash('errors'))

    res.render('pages/court-register/addCourtBuilding', view.renderArgs)
  }

  async submitAddCourtBuilding(req: Request, res: Response): Promise<void> {
    res.redirect(`/court-register/details?id=${req.session.addCourtBuildingForm.courtId}&action=UPDATED`)
  }
}
