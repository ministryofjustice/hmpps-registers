import data from '../testutils/mockHospitalData'
import AllHospitalsView from './allHospitalsView'

describe('AllHospitalsView', () => {
  let view: AllHospitalsView

  describe('with no hospitals', () => {
    beforeEach(() => {
      view = new AllHospitalsView([], {})
    })

    it('can handle when there are no hospitals', () => {
      expect(view.hospitalPageView.hospitals).toHaveLength(0)
    })
  })

  describe('with many hospitals', () => {
    beforeEach(() => {
      view = new AllHospitalsView([data.hospital({}), data.hospital({})], {})
    })

    it('will map each hospital', () => {
      expect(view.hospitalPageView.hospitals).toHaveLength(2)
    })
  })

  describe('render args', () => {
    beforeEach(() => {
      view = new AllHospitalsView([data.hospital({ hospitalId: 'SHEFH', highSecurity: true })], { active: true })
    })

    it('will pass the hospitals and filter to the page', () => {
      expect(view.renderArgs).toEqual({
        hospitals: [expect.objectContaining({ id: 'SHEFH', highSecurity: true })],
        filter: { active: true },
      })
    })
  })
})
