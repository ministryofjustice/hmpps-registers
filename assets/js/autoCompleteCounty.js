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

  function countyValue(county) {
    return county.description
  }

  const request = new XMLHttpRequest()

  window.addEventListener('load', function () {
    const select = document.querySelector('#addresscounty')
    const autocompleteScript = document.getElementById('autocomplete-county-script')
    const defaultcounty = autocompleteScript ? autocompleteScript.dataset.addresscountyName : ''

    if (select) {
      accessibleAutocomplete({
        element: select.parentElement,
        id: 'addresscounty',
        name: 'addresscounty',
        defaultValue: defaultcounty,
        confirmOnBlur: false,
        minLength: 2,
        displayMenu: 'overlay',
        inputClasses: 'govuk-input',
        menuClasses: 'govuk-body',

        source: debounce(function (query, populateResults) {
          request.open('GET', '/api/search-county?searchString=' + encodeURIComponent(query), true)
          request.timeout = 2000
          request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                try {
                  const json = JSON.parse(request.responseText)
                  populateResults(json)
                } catch (e) {
                  populateResults([])
                }
              } else {
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
            return countyValue(result)
          },
          suggestion: function (result) {
            if (result && result.unableToLoad) {
              return 'No results found'
            }
            if (typeof result === 'string') {
              return 'Clear the selection'
            }
            return result && countyValue(result)
          },
        },
      })
    }
  })
})()
