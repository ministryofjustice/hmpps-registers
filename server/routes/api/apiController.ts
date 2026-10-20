import { Request, Response } from 'express'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
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

  private payrollRegions: CodeDescription[] = []

  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async searchArea(req: Request, res: Response): Promise<void> {
    if (this.areas.length === 0) {
      this.areas = await this.hmppsAgencyRegisterApiService.getAreas(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res.status(200).send(this.areas.filter(area => area.description.toLowerCase().includes(searchString.toLowerCase())))
  }

  async searchRegion(req: Request, res: Response): Promise<void> {
    if (this.regions.length === 0) {
      this.regions = await this.hmppsAgencyRegisterApiService.getRegions(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res
      .status(200)
      .send(this.regions.filter(region => region.description.toLowerCase().includes(searchString.toLowerCase())))
  }

  async searchLocalAuthority(req: Request, res: Response): Promise<void> {
    if (this.localAuthorities.length === 0) {
      this.localAuthorities = await this.hmppsAgencyRegisterApiService.getLocalAuthorities(context(res))
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

  async searchPayrollRegion(req: Request, res: Response): Promise<void> {
    if (this.payrollRegions.length === 0) {
      this.payrollRegions = await this.hmppsAgencyRegisterApiService.getPayrollRegions(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    res
      .status(200)
      .send(
        this.payrollRegions.filter(payrollRegion =>
          payrollRegion.description.toLowerCase().includes(searchString.toLowerCase()),
        ),
      )
  }

  async searchTown(req: Request, res: Response): Promise<void> {
    const { searchString } = req.query

    if (this.towns.length === 0) {
      this.towns = await this.hmppsAgencyRegisterApiService.getTownSuggestions(context(res))
    }
    const result = this.towns.filter(town =>
      town.description.toLowerCase().includes((searchString as string).toLowerCase()),
    )
    res.status(200).send(result)
  }

  async searchCounty(req: Request, res: Response): Promise<void> {
    const { searchString } = req.query

    if (this.counties.length === 0) {
      this.counties = await this.hmppsAgencyRegisterApiService.getCountySuggestions(context(res))
    }
    const result = this.counties.filter(county =>
      county.description.toLowerCase().includes((searchString as string).toLowerCase()),
    )
    res.status(200).send(result)
  }
}
