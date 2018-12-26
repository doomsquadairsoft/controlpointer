module.exports = [{
    'action': 'start',
    'createdAt': 5000
  },
  {
    'action': 'pause',
    'createdAt': 7000
  },
  {
    'action': 'start',
    'createdAt': 12000
  },
  {
    'action': 'pause',
    'createdAt': 20000
  }
]

// If timePointer is set to 20000 and gameLength = 300000...
// pausedDuration is  5000
// runningDuration is 10000
// elapsedDuration is 15000
// endTime is (startTime + gameLength - elapsedDuration)
// 5000 + 300000 - 15000
