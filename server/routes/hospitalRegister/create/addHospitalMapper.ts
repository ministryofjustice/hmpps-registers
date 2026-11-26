import { CreateHospital } from '../../../@types/prisonRegister'
import { AddHospitalJourney } from './addHospitalFlowControl'

export default function addHospitalMapper({ form }: AddHospitalJourney): CreateHospital {
  if (!form.hospitalId || !form.hospitalName || (form.highSecurity !== 'true' && form.highSecurity !== 'false')) {
    throw new Error('Cannot create a hospital from an incomplete journey')
  }
  return {
    hospitalId: form.hospitalId,
    hospitalName: form.hospitalName,
    description: form.description || undefined,
    active: true,
    highSecurity: form.highSecurity === 'true',
    cjitCode: form.cjitCode || undefined,
    areaCode: form.areaCode || undefined,
    regionCode: form.regionCode || undefined,
    geographicalAreaCode: form.geographicalAreaCode || undefined,
    localAuthorityCode: form.localAuthorityCode || undefined,
    payrollRegionCode: form.payrollRegionCode || undefined,
    addresses: [],
    phoneNumbers: [],
  }
}
