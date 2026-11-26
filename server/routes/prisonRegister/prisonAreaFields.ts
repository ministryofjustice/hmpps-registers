import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription, PrisonDetails, UpdatePrisonArea } from '../../@types/prisonRegister'
import UpdateAgencyAreaView from '../agencyRegisters/updateAreaView'
import UpdateAgencyRegionView from '../agencyRegisters/updateRegionView'
import UpdateAgencyGeographicalAreaView from '../agencyRegisters/updateGeographicalAreaView'
import UpdateAgencyLocalAuthorityView from '../agencyRegisters/updateLocalAuthorityView'
import UpdateAgencyPayrollRegionView from '../agencyRegisters/updatePayrollRegionView'
import type { PrisonReferenceFieldConfig } from './updatePrisonAreaValidator'

type NavAndForm = [
  name: string,
  navigation: { cancelButton: string },
  errors: Array<Record<string, string>>,
  form: Record<string, string>,
]

export type PrisonReferenceField = PrisonReferenceFieldConfig & {
  template: string
  dtoKey: keyof UpdatePrisonArea
  current: (prison: PrisonDetails) => CodeDescription | null | undefined
  getItems: (api: HMPPSAgencyRegisterApi, context: Context) => Promise<CodeDescription[]>
  renderArgs: (...args: NavAndForm) => object
}

const prisonReferenceFields: PrisonReferenceField[] = [
  {
    field: 'area',
    label: 'area',
    path: 'area',
    sessionKey: 'updateAreaForm',
    template: 'updateAgencyArea',
    dtoKey: 'areaCode',
    current: prison => prison.area,
    getItems: (api, context) => api.getAreas(context),
    renderArgs: (...args) => new UpdateAgencyAreaView(...args).renderArgs,
  },
  {
    field: 'region',
    label: 'region',
    path: 'region',
    sessionKey: 'updateRegionForm',
    template: 'updateAgencyRegion',
    dtoKey: 'regionCode',
    current: prison => prison.region,
    getItems: (api, context) => api.getRegions(context),
    renderArgs: (...args) => new UpdateAgencyRegionView(...args).renderArgs,
  },
  {
    field: 'geographicalArea',
    label: 'geographical area',
    path: 'geographical-area',
    sessionKey: 'updateGeographicalAreaForm',
    template: 'updateAgencyGeographicalArea',
    dtoKey: 'geographicalAreaCode',
    current: prison => prison.geographicalArea,
    getItems: (api, context) => api.getAreas(context),
    renderArgs: (...args) => new UpdateAgencyGeographicalAreaView(...args).renderArgs,
  },
  {
    field: 'localAuthority',
    label: 'local authority',
    path: 'local-authority',
    sessionKey: 'updateLocalAuthorityForm',
    template: 'updateAgencyLocalAuthority',
    dtoKey: 'localAuthorityCode',
    current: prison => prison.localAuthority,
    getItems: (api, context) => api.getLocalAuthorities(context),
    renderArgs: (...args) => new UpdateAgencyLocalAuthorityView(...args).renderArgs,
  },
  {
    field: 'payrollRegion',
    label: 'payroll region',
    path: 'payroll-region',
    sessionKey: 'updatePayrollRegionForm',
    template: 'updateAgencyPayrollRegion',
    dtoKey: 'payrollRegionCode',
    current: prison => prison.payrollRegion,
    getItems: (api, context) => api.getPayrollRegions(context),
    renderArgs: (...args) => new UpdateAgencyPayrollRegionView(...args).renderArgs,
  },
]

export default prisonReferenceFields
