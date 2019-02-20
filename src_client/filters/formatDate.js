import moment from 'moment'
import Vue from 'vue'


Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value), 'x').format('MM/DD/YYYY hh:mm')
  }
})

Vue.filter('formatDateSeconds', function(value) {
  if (value) {
    return moment(String(value), 'x').format('MM/DD/YYYY hh:mm:ss')
  }
})
