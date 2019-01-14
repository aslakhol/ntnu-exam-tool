// fetch all subjects
// fetch course info for all subjects
// filter to remove irrelevant subjects
//
// extract relevant info
// filter to subjects with exams before date
// populate list

let b = document.querySelector('#fetch-button')
const urlBase = 'https://www.ime.ntnu.no/api/course/en/'

const date = moment("2019-05-15")

const cutoffDate = moment("2019-05-15")
const cutonDate = moment("2019-05-10")

const execute = async () => {
  const allCourses = await fetchAllCourses()

  const fullCourses = allCourses.map(async course => fetchCourseInfo(course.code))
  const irrelevantAndRelevantCourses = await Promise.all(fullCourses)
  const relevantCourses = irrelevantAndRelevantCourses.filter(course => isRelevant(course))
  const coursesBeforeCutoff = relevantCourses.filter(course => isBeforeCutoff(course.assessment))
  console.log(coursesBeforeCutoff)
}

const fetchAllCourses = () => {
  return (
    fetch(urlBase + '-')
      .then(res => res.json())
      .then(data => data.course)
      .catch(err => console.error('Caught error in fetchAllCourses: ', err))
  )
}

const fetchCourseInfo = (code) => {
  return (
    fetch(urlBase + code)
      .then(res => res.json())
      .then(data => data.course)
      .catch(err => console.error('Caught error in fetchCourseInfo: ', err))
  )
}

const isRelevant = (course) => {
  if (course == null) {
    return false
  }
  if (!course.taughtInSpring) {
    return false
  }
  if (!relevantAssesment(course.assessment)) {
    return false
  }
  return course.location === "Trondheim"
}

const relevantAssesment = (assessments) => {
  if (assessments == null) {
    return false
  }
  try {
    for (assessment of assessments) {
      if (assessment.code === "M" || assessment.code === "S" || assessment.code === "H") {
        return true
      }
    }
    return false
  } catch (error) {
    console.error(error)
    console.log(assessments)
  }
}

const isBeforeCutoff = (assessments) => {
  for (assessment of assessments) {
    if (assessment.date == null) {
      return false
    }
    if (assessment.firstExecutionTerm === "Spring") {
      if (assessment.code === "M" || assessment.code === "S" || assessment.code === "H") {
        return moment(assessment.date).isBefore(cutoffDate, 'day') && moment(assessment.date).isAfter(cutonDate, 'day')
      }
    }
  }
  return false
}

b.addEventListener("click", execute)
