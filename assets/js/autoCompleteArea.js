;(function () {
  function debounce(fn, delay) {
    let timer = null
    return function () {
      const context = this
      const args = arguments
      clearTimeout(timer)
      timer = setTimeout(function () {
        fn.apply(context, args)
      }, delay)
    }
  }

  function areaValue(area) {
    return area.code + ' - ' + area.description
  }

  const request = new XMLHttpRequest()

  window.addEventListener('load', function () {
    const select = document.querySelector('#area-name')
    const autocompleteScript = document.getElementById('autocomplete-area-script')
    const defaultArea = autocompleteScript ? autocompleteScript.dataset.area : ''
    const status = document.getElementById('area-search-status')

    if (select) {
      accessibleAutocomplete({
        element: select.parentElement,
        id: 'area-name',
        name: 'areaName',
        defaultValue: defaultArea,
        confirmOnBlur: false,
        minLength: 2,
        displayMenu: 'overlay',
        inputClasses: 'govuk-input',
        menuClasses: 'govuk-body',

        source: debounce(function (query, populateResults) {
          request.open('GET', '/api/search-area?searchString=' + encodeURIComponent(query), true)
          request.timeout = 2000
          request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                try {
                  const json = JSON.parse(request.responseText)
                  populateResults(json)
                } catch (e) {
                  status.textContent = 'Unable to load areas. Try searching again.'
                  populateResults([])
                }
              } else {
                status.textContent = 'Unable to load areas. Try searching again.'
                populateResults([{ unableToLoad: true }])
              }
            }
          }
          request.send()
        }, 100),

        templates: {
          inputValue: function (result) {
            if (!result || typeof result === 'string') {
              return ''
            }
            return areaValue(result)
          },
          suggestion: function (result) {
            if (result && result.unableToLoad) {
              return 'No results found'
            }
            if (typeof result === 'string') {
              return 'Clear the selection'
            }
            return result && areaValue(result)
          },
        },
      })
    }
  })
})()
