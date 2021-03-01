import AllCourtsViewMapper from './allCourtsViewMapper'

describe('AllCourtsViewMapper', () => {
  let mapper

  describe('with no courts', () => {
    beforeEach(() => {
      mapper = new AllCourtsViewMapper({ courts: [] })
    })
    it('can handle when there are no courts', () => {
      expect(mapper.courts).toHaveLength(0)
    })
  })
  describe('with many courts', () => {
    beforeEach(() => {
      mapper = new AllCourtsViewMapper({
        courts: [
          {
            courtId: 'SHFCC',
            courtName: 'Sheffield Crown Court',
            courtDescription: 'Sheffield Crown Court - Yorkshire',
            courtType: 'CROWN',
            active: true,
          },
          {
            courtId: 'SHFMC',
            courtName: 'Sheffield Magistrates Court',
            courtDescription: 'Sheffield Magistrates Court - Yorkshire',
            courtType: 'MAGISTRATES',
            active: false,
          },
        ],
      })
    })
    it('will map each court', () => {
      expect(mapper.courts).toHaveLength(2)
    })
    it('will map courtId', () => {
      expect(mapper.courts[0].id).toEqual('SHFCC')
    })
    it('will convert crown court type', () => {
      expect(mapper.courts[0].type).toBe('Crown')
    })
    it('will convert magistrates court type', () => {
      expect(mapper.courts[1].type).toBe('Magistrates')
    })
    it('will map active flag', () => {
      expect(mapper.courts[0].active).toEqual(true)
      expect(mapper.courts[1].active).toEqual(false)
    })
  })
})
