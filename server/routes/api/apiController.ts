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

  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async searchArea(req: Request, res: Response): Promise<void> {
    if (this.areas.length === 0) {
      this.areas = await this.prisonRegisterService.getAreas(context(res))
    }
    const searchString = typeof req.query.searchString === 'string' ? req.query.searchString : ''
    const areaParts = searchString.split(' - ')
    let areaCode = ''
    let areaDescription = ''

    if (areaParts.length === 0) {
      areaDescription = searchString
    }
    if (areaParts.length === 1) {
      ;[areaDescription] = areaParts
    } else if (areaParts.length === 2) {
      ;[areaCode, areaDescription] = areaParts
    }

    let result: CodeDescription[] = []
    if (areaCode) {
      result = this.areas.filter(
        area =>
          area.description.toLowerCase().includes(areaDescription.toLowerCase()) ||
          area.code.toLowerCase().includes(areaCode.toLowerCase()),
      )
    } else if (areaDescription) {
      result = this.areas.filter(area => area.description.toLowerCase().includes(areaDescription.toLowerCase()))
    } else {
      result = this.areas
    }

    res.status(200).send(result)
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
