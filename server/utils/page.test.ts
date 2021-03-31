import { toPageMetaData } from './page'

describe('page meta data', () => {
  it('converts spring page data to PageMetaData', () => {
    expect(toPageMetaData(true, true, true, 1, 2, 3, 4, 5, 'hreftemplate')).toEqual({
      first: true,
      last: true,
      empty: true,
      totalPages: 1,
      totalElements: 2,
      pageNumber: 3,
      pageSize: 4,
      elementsOnPage: 5,
      hrefTemplate: 'hreftemplate',
    })
  })
})
