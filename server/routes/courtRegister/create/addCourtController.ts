import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import PrisonRegisterService from '../../../services/prisonRegisterService'
import {
  AddCourtJourney,
  canVisitCourtPage,
  courtNavigation,
  CourtPage,
  courtPageUrl,
  courtSteps,
  fieldsForStep,
  firstIncompleteStep,
  isCourtPage,
} from './addCourtFlowControl'
import validateCourtStep from './addCourtValidation'
import AddCourtView from './addCourtView'
import addCourtMapper from './addCourtMapper'

export default class AddCourtController {
  constructor(private readonly service: PrisonRegisterService) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addCourtJourneys ??= {}
    req.session.addCourtJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(courtPageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addCourtJourneys) delete req.session.addCourtJourneys[String(req.params.journeyId)]
    res.redirect('/court-register')
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddCourtView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(`pages/court-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`, view.renderArgs)
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of courtSteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validateCourtStep(step, journey, this.service, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${courtPageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const court = addCourtMapper(journey)
      const result = await this.service.createCourt(context, court)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-court', text: result.userMessage }])
        res.redirect(courtPageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addCourtJourneys[journeyId]
      res.redirect(`/court-register/details?id=${encodeURIComponent(court.courtId)}&action=CREATED`)
      return
    }
    const fields = fieldsForStep(page)
    const invalidFields = fields.filter(field => req.body[field] !== undefined && typeof req.body[field] !== 'string')
    if (invalidFields.length > 0) {
      req.flash(
        'errors',
        invalidFields.map(field => ({ href: `#${field.replace(/Code$/, '')}`, text: 'Enter a valid value' })),
      )
      res.redirect(`${courtPageUrl(journeyId, page)}${req.query.change === 'true' ? '?change=true' : ''}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validateCourtStep(page, journey, this.service, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${courtPageUrl(journeyId, page)}${req.query.change === 'true' ? '?change=true' : ''}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(courtNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddCourtJourney; page: CourtPage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isCourtPage(page)) throw createError(404, 'Court creation page not found')
    const journeys = req.session.addCourtJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect('/court-register')
      return undefined
    }
    if (!canVisitCourtPage(journey, page)) {
      res.redirect(courtPageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
