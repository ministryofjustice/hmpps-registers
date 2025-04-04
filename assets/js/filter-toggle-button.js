import { FilterToggleButton } from '@ministryofjustice/frontend'

module.exports = () => {
  new FilterToggleButton({
  bigModeMediaQuery: '(min-width: 48.063em)',
  startHidden: true,
  toggleButton: {
    container: $('.moj-action-bar__filter'),
    showText: 'Show filter',
    hideText: 'Hide filter',
    classes: 'govuk-button--secondary',
  },
  closeButton: {
    container: $('.moj-filter'),
    text: 'Close',
  },
  filter: {
    container: $('.moj-filter-layout__filter'),
  },
})

$('.moj-filter__options')
  .find(':button')
  .on('click', () => {
    $('#filter-form').submit()
  })
}