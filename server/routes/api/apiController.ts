import { Request, Response } from 'express'
import PrisonRegisterService, { Context } from '../../services/prisonRegisterService'
import { CodeDescription } from '../../@types/prisonRegister'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class ApiController {
  private towns: CodeDescription[] = []

  private counties: CodeDescription[] = []

  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async searchTown(req: Request, res: Response): Promise<void> {
    const { searchString } = req.query

    if (this.towns.length === 0) {
      this.towns = await this.prisonRegisterService.getTownSuggestions(context(res))
    }
    const result = this.towns.filter(town =>
      town.description.toLowerCase().includes((searchString as string).toLowerCase()),
    )
    res.status(200).send(result)
  }

  async searchCounty(req: Request, res: Response): Promise<void> {
    const { searchString } = req.query

    if (this.counties.length === 0) {
      this.counties = await this.prisonRegisterService.getCountySuggestions(context(res))
    }
    const result = this.counties.filter(county =>
      county.description.toLowerCase().includes((searchString as string).toLowerCase()),
    )
    res.status(200).send(result)
  }
}
