import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import {
  AddHospitalJourney,
  canVisitHospitalPage,
  fieldsForStep,
  firstIncompleteStep,
  hospitalNavigation,
  HospitalPage,
  hospitalPageUrl,
  hospitalSteps,
  isHospitalPage,
} from './addHospitalFlowControl'
import validateHospitalStep from './addHospitalValidation'
import AddHospitalView from './addHospitalView'
import addHospitalMapper from './addHospitalMapper'

export default class AddHospitalController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addHospitalJourneys ??= {}
    req.session.addHospitalJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(hospitalPageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addHospitalJourneys) delete req.session.addHospitalJourneys[String(req.params.journeyId)]
    res.redirect('/hospital-register')
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddHospitalView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(`pages/hospital-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`, view.renderArgs)
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of hospitalSteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validateHospitalStep(step, journey, this.hmppsAgencyRegisterApiService, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${hospitalPageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const hospital = addHospitalMapper(journey)
      const result = await this.hmppsAgencyRegisterApiService.createHospital(context, hospital)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-hospital', text: result.userMessage }])
        res.redirect(hospitalPageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addHospitalJourneys[journeyId]
      res.redirect(`/hospital-register/details?id=${encodeURIComponent(hospital.hospitalId)}&action=CREATED`)
      return
    }
    const changeQuery = req.query.change === 'true' ? '?change=true' : ''
    const fields = fieldsForStep(page)
    const invalidFields = fields.filter(field => req.body[field] !== undefined && typeof req.body[field] !== 'string')
    if (invalidFields.length > 0) {
      req.flash(
        'errors',
        invalidFields.map(field => ({ href: `#${field.replace(/Code$/, '')}`, text: 'Enter a valid value' })),
      )
      res.redirect(`${hospitalPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validateHospitalStep(page, journey, this.hmppsAgencyRegisterApiService, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${hospitalPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(hospitalNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddHospitalJourney; page: HospitalPage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isHospitalPage(page)) throw createError(404, 'Hospital creation page not found')
    const journeys = req.session.addHospitalJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect('/hospital-register')
      return undefined
    }
    if (!canVisitHospitalPage(journey, page)) {
      res.redirect(hospitalPageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
