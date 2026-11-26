import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import {
  AddProbationOfficeJourney,
  canVisitProbationOfficePage,
  fieldsForStep,
  firstIncompleteStep,
  isProbationOfficePage,
  ProbationOfficePage,
  probationOfficeNavigation,
  probationOfficePageUrl,
  probationOfficeSteps,
} from './addProbationOfficeFlowControl'
import validateProbationOfficeStep from './addProbationOfficeValidation'
import AddProbationOfficeView from './addProbationOfficeView'
import addProbationOfficeMapper from './addProbationOfficeMapper'

const registerUrl = '/probation-office-register'

export default class AddProbationOfficeController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addProbationOfficeJourneys ??= {}
    req.session.addProbationOfficeJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(probationOfficePageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addProbationOfficeJourneys) {
      delete req.session.addProbationOfficeJourneys[String(req.params.journeyId)]
    }
    res.redirect(registerUrl)
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddProbationOfficeView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(
      `pages/probation-office-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`,
      view.renderArgs,
    )
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of probationOfficeSteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validateProbationOfficeStep(step, journey, this.hmppsAgencyRegisterApiService, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${probationOfficePageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const probationOffice = addProbationOfficeMapper(journey)
      const result = await this.hmppsAgencyRegisterApiService.createProbationOffice(context, probationOffice)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-probation-office', text: result.userMessage }])
        res.redirect(probationOfficePageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addProbationOfficeJourneys[journeyId]
      res.redirect(`${registerUrl}/details?id=${encodeURIComponent(probationOffice.probationOfficeId)}&action=CREATED`)
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
      res.redirect(`${probationOfficePageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validateProbationOfficeStep(page, journey, this.hmppsAgencyRegisterApiService, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${probationOfficePageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(probationOfficeNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddProbationOfficeJourney; page: ProbationOfficePage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isProbationOfficePage(page)) throw createError(404, 'Probation office creation page not found')
    const journeys = req.session.addProbationOfficeJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect(registerUrl)
      return undefined
    }
    if (!canVisitProbationOfficePage(journey, page)) {
      res.redirect(probationOfficePageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
