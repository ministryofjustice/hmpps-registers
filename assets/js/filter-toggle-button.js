import { FilterToggleButton } from '@ministryofjustice/frontend'

module.exports = () => {
  const $filter = document.querySelector('.moj-filter')
  if ($filter) {
    new FilterToggleButton($filter, {
      bigModeMediaQuery: '(min-width: 48.063em)',
    })
  }

  $('.moj-filter__options')
    .find(':button')
    .on('click', () => {
      $('#filter-form').submit()
    })
}
