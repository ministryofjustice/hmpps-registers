import hospitalMapper, { HospitalDetail, hospitalsPageMapper } from './hospitalMapper'
import data from '../testutils/mockHospitalData'

describe('hospitalMapper', () => {
  let hospital: HospitalDetail

  beforeEach(() => {
    hospital = hospitalMapper(
      data.hospital({
        hospitalId: 'SHEFH',
        hospitalName: 'Sheffield Hospital',
        active: true,
        highSecurity: true,
      }),
    )
  })

  it('will map hospitalId', () => {
    expect(hospital.id).toEqual('SHEFH')
  })
  it('will map hospitalName', () => {
    expect(hospital.name).toBe('Sheffield Hospital')
  })
  it('will map active flag', () => {
    expect(hospital.active).toEqual(true)
  })
  it('will map high security flag', () => {
    expect(hospital.highSecurity).toEqual(true)
  })
})

describe('hospitalsPageMapper', () => {
  let hospitals: HospitalDetail[]

  beforeEach(() => {
    hospitals = hospitalsPageMapper([data.hospital({}), data.hospital({})], {}).hospitals
  })

  it('will contain two hospitals', () => {
    expect(hospitals.length).toEqual(2)
  })

  it('will pass through the filter', () => {
    expect(hospitalsPageMapper([], { highSecurity: true }).filter).toEqual({ highSecurity: true })
  })
})
