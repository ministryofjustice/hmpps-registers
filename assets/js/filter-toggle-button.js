import { FilterToggleButton } from '@ministryofjustice/frontend'

module.exports = () => {
  const $filter = document.querySelector('.moj-filter')
  if ($filter) {
    new FilterToggleButton($filter, {
      bigModeMediaQuery: '(min-width: 48.063em)',
    })
  }

  // the "Apply filters" button sits outside the filter form, so submit the form when it is clicked
  const filterForm = document.getElementById('filter-form')
  document.querySelectorAll('.moj-filter__options button').forEach(button => {
    button.addEventListener('click', () => filterForm?.submit())
  })
}
