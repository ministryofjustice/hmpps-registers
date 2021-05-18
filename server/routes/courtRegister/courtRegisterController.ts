import { Request, Response } from 'express'
import CourtRegisterService, { AddCourt, Context } from '../../services/courtRegisterService'
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
import AmendCourtDetailsView from './amendCourtDetailsView'
import amendCourtDetailsValidator from './amendCourtDetailsValidator'
import AmendCourtBuildingView from './amendCourtBuildingView'
import amendCourtBuildingValidator from './amendCourtBuildingValidator'
import { InsertCourtBuilding, UpdateCourtBuilding } from '../../@types/courtRegister'
import AddCourtBuildingView from './addCourtBuildingView'
import addCourtBuildingValidator from './addCourtBuildingValidator'
import AllCourtsView from './allCourtsView'
import { AllCourtsFilter, pageLinkMapper } from './courtMapper'
import AmendCourtBuildingContactsView from './amendCourtBuildingContactsView'
import amendCourtBuildingContactsValidator, {
  amendCourtBuildingContactsFormCloneCleaner,
} from './amendCourtBuildingContactsValidator'
import trimForm from '../../utils/trim'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class CourtRegisterController {
  constructor(private readonly courtRegisterService: CourtRegisterService) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1
    const filter = this.parseFilter(req)
    req.session.courtListPageLink = pageLinkMapper(filter, page)
    const courtsPage = await this.courtRegisterService.getPageOfCourts(context(res), page - 1, 40, filter)
    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AllCourtsView(courtsPage, filter, courtTypes)

    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  parseFilter(req: Request): AllCourtsFilter {
    const filter = {
      active: CourtRegisterController.parseBooleanFromQuery(req.query.active as string),
      courtTypeIds: CourtRegisterController.parseStringArrayFromQuery(req.query.courtTypeIds as string[]),
      textSearch: req.query.textSearch as string | undefined,
    }
    return CourtRegisterController.removeEmptyValues(filter)
  }

  private static removeEmptyValues(obj: Record<string, unknown>) {
    return Object.keys(obj)
      .filter(k => obj[k] != null && obj[k] !== '')
      .reduce((a, k) => ({ ...a, [k]: obj[k] }), {})
  }

  private static parseBooleanFromQuery(boolAsString: string | undefined): boolean | undefined {
    if (boolAsString === 'true') return true
    if (boolAsString === 'false') return false
    return undefined
  }

  private static parseStringArrayFromQuery(stringArray: string | string[] | undefined): string[] | undefined {
    if (!stringArray) return undefined
    if (typeof stringArray === 'string') return [stringArray]
    return stringArray
  }

  async viewCourt(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }

    const court = await this.courtRegisterService.getCourt(context(res), id)

    const view = new CourtDetailsView(court, (action || 'NONE') as Action, req.session.courtListPageLink as string)

    res.render('pages/court-register/courtDetails', view.renderArgs)
  }

  async toggleCourtActive(req: Request, res: Response): Promise<void> {
    const { id, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE-COURT' : 'DEACTIVATE-COURT'
    await this.courtRegisterService.updateActiveCourtMarker(context(res), id, activate)
    res.redirect(`/court-register/details?id=${id}&action=${action}`)
  }

  async toggleBuildingActive(req: Request, res: Response): Promise<void> {
    const { courtId, buildingId, active } = req.body
    const activate = active === 'true'
    const action: Action = activate ? 'ACTIVATE-BUILDING' : 'DEACTIVATE-BUILDING'
    await this.courtRegisterService.updateActiveBuildingMarker(context(res), courtId, buildingId, activate)
    res.redirect(`/court-register/details?id=${courtId}&action=${action}`)
  }

  addNewCourtStart(req: Request, res: Response): void {
    req.session.addNewCourtForm = {}
    res.redirect(`/court-register/add-new-court-details`)
  }

  async addNewCourtDetails(req: Request, res: Response): Promise<void> {
    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtDetailsView(
      req.session.addNewCourtForm,
      courtTypes,
      req.session.courtListPageLink as string,
      req.flash('errors')
    )

    res.render('pages/court-register/addNewCourtDetails', view.renderArgs)
  }

  async submitNewCourtDetails(req: Request, res: Response): Promise<void> {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...trimForm(req.body) }

    res.redirect(
      await addNewCourtDetailsValidator(req.session.addNewCourtForm, req, (id: string) =>
        this.courtRegisterService.findCourt(context(res), id)
      )
    )
  }

  addNewCourtBuilding(req: Request, res: Response): void {
    const view = new AddNewCourtBuildingView(
      req.session.addNewCourtForm,
      req.session.courtListPageLink as string,
      req.flash('errors')
    )

    res.render('pages/court-register/addNewCourtBuilding', view.renderArgs)
  }

  submitNewCourtNewBuilding(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...trimForm(req.body) }

    res.redirect(addNewCourtBuildingValidator(req.session.addNewCourtForm, req))
  }

  addNewCourtContactDetails(req: Request, res: Response): void {
    const view = new AddNewCourtContactDetailsView(
      req.session.addNewCourtForm,
      req.session.courtListPageLink as string,
      req.flash('errors')
    )

    res.render('pages/court-register/addNewCourtContactDetails', view.renderArgs)
  }

  submitNewCourtContactDetails(req: Request, res: Response): void {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, ...trimForm(req.body) }

    res.redirect(addNewCourtContactDetailsValidator(req.session.addNewCourtForm, req))
  }

  async addNewCourtSummary(req: Request, res: Response): Promise<void> {
    req.session.addNewCourtForm = { ...req.session.addNewCourtForm, completed: true }

    const courtTypes = await this.courtRegisterService.getCourtTypes(context(res))

    const view = new AddNewCourtSummaryView(
      req.session.addNewCourtForm,
      courtTypes,
      req.session.courtListPageLink as string
    )

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
    res.render('pages/court-register/addNewCourtFinished', { id, name, backLink: req.session.courtListPageLink })
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
    req.session.amendCourtDetailsForm = { ...trimForm(req.body) }
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

    const view = new AmendCourtBuildingView(
      req.session.amendCourtBuildingForm,
      req.session.courtListPageLink as string,
      req.flash('errors')
    )

    res.render('pages/court-register/amendCourtBuilding', view.renderArgs)
  }

  async amendCourtBuilding(req: Request, res: Response): Promise<void> {
    const view = new AmendCourtBuildingView(
      req.session.amendCourtBuildingForm,
      req.session.courtListPageLink as string,
      req.flash('errors')
    )

    res.render('pages/court-register/amendCourtBuilding', view.renderArgs)
  }

  async submitAmendCourtBuilding(req: Request, res: Response): Promise<void> {
    req.session.amendCourtBuildingForm = { ...trimForm(req.body) }
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
            active: form.active,
          }
          return this.courtRegisterService.updateCourtBuilding(
            context(res),
            form.courtId as string,
            form.id,
            updatedBuilding
          )
        },
        subCode => this.courtRegisterService.findCourt(context(res), subCode),
        subCode => this.courtRegisterService.findCourtBuilding(context(res), subCode),
        () => this.courtRegisterService.findMainCourtBuilding(context(res), req.session.amendCourtBuildingForm.courtId)
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
    req.session.addCourtBuildingForm = { ...trimForm(req.body) }
    res.redirect(
      await addCourtBuildingValidator(
        req.session.addCourtBuildingForm,
        req,
        form => {
          const newBuilding: InsertCourtBuilding = {
            buildingName: form.buildingname,
            street: form.addressline1,
            locality: form.addressline2,
            town: form.addresstown,
            county: form.addresscounty,
            postcode: form.addresspostcode,
            country: form.addresscountry,
            subCode: form.subCode,
            active: form.active as boolean,
          }
          return this.courtRegisterService.addCourtBuilding(context(res), form.courtId as string, newBuilding)
        },
        subCode => this.courtRegisterService.findCourt(context(res), subCode),
        subCode => this.courtRegisterService.findCourtBuilding(context(res), subCode),
        () => this.courtRegisterService.findMainCourtBuilding(context(res), req.session.addCourtBuildingForm.courtId)
      )
    )
  }

  async amendCourtBuildingContactsStart(req: Request, res: Response): Promise<void> {
    const { courtId, buildingId } = req.query as { courtId: string; buildingId: string }

    const courtBuilding = await this.courtRegisterService.getCourtBuilding(context(res), courtId, buildingId)

    req.session.amendCourtBuildingContactsForm = {
      buildingname: courtBuilding.buildingName,
      buildingId: courtBuilding.id,
      courtId: courtBuilding.courtId,
      contacts: courtBuilding.contacts?.map(contact => ({
        id: contact.id,
        type: contact.type,
        number: contact.detail,
      })),
    }

    const view = new AmendCourtBuildingContactsView(req.session.amendCourtBuildingContactsForm, req.flash('errors'))

    res.render('pages/court-register/amendCourtBuildingContacts', view.renderArgs)
  }

  async amendCourtBuildingContacts(req: Request, res: Response): Promise<void> {
    const view = new AmendCourtBuildingContactsView(req.session.amendCourtBuildingContactsForm, req.flash('errors'))

    res.render('pages/court-register/amendCourtBuildingContacts', view.renderArgs)
  }

  async submitAmendCourtBuildingContacts(req: Request, res: Response): Promise<void> {
    req.session.amendCourtBuildingContactsForm = amendCourtBuildingContactsFormCloneCleaner(trimForm(req.body))
    res.redirect(
      await amendCourtBuildingContactsValidator(req.session.amendCourtBuildingContactsForm, req, form => {
        return this.courtRegisterService.updateCourtBuildingContacts(
          context(res),
          form.courtId,
          form.buildingId,
          form.contacts.map(contact => {
            const type = contact.type as 'FAX' | 'TEL'
            const detail: string = contact.number as string

            return {
              type,
              detail,
              id: contact.id || undefined,
            }
          })
        )
      })
    )
  }
}
