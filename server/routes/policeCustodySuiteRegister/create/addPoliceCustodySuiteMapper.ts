import { CreatePoliceCustodySuite } from '../../../@types/prisonRegister'
import { AddPoliceCustodySuiteJourney } from './addPoliceCustodySuiteFlowControl'

export default function addPoliceCustodySuiteMapper({ form }: AddPoliceCustodySuiteJourney): CreatePoliceCustodySuite {
  if (!form.policeCustodySuiteId || !form.policeCustodySuiteName) {
    throw new Error('Cannot create a police custody suite from an incomplete journey')
  }
  return {
    policeCustodySuiteId: form.policeCustodySuiteId,
    policeCustodySuiteName: form.policeCustodySuiteName,
    description: form.description || undefined,
    active: true,
    cjitCode: form.cjitCode || undefined,
    areaCode: form.areaCode || undefined,
    regionCode: form.regionCode || undefined,
    geographicalAreaCode: form.geographicalAreaCode || undefined,
    localAuthorityCode: form.localAuthorityCode || undefined,
    payrollRegionCode: form.payrollRegionCode || undefined,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  }
}
