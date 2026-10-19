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

  private areas: CodeDescription[] = []

  private regions: CodeDescription[] = []

  private localAuthorities: CodeDescription[] = []

  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async searchArea(req: Request, res: Response): Promise<void> {
    if (this.areas.length === 0) {
      this.areas = await this.prisonRegisterService.getAreas(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res.status(200).send(this.areas.filter(area => area.description.toLowerCase().includes(searchString.toLowerCase())))
  }

  async searchRegion(req: Request, res: Response): Promise<void> {
    if (this.regions.length === 0) {
      this.regions = await this.prisonRegisterService.getRegions(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res
      .status(200)
      .send(this.regions.filter(region => region.description.toLowerCase().includes(searchString.toLowerCase())))
  }

  async searchLocalAuthority(req: Request, res: Response): Promise<void> {
    if (this.localAuthorities.length === 0) {
      this.localAuthorities = await this.prisonRegisterService.getLocalAuthorities(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res
      .status(200)
      .send(
        this.localAuthorities.filter(localAuthority =>
          localAuthority.description.toLowerCase().includes(searchString.toLowerCase()),
        ),
      )
  }

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
