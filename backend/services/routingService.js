/**
 * Predictive Complaint Routing Service
 * Uses keyword-based rules and can be extended with ML classification
 */

// Keyword-based routing rules
const routingRules = [
  {
    keywords: ['wifi', 'internet', 'network', 'connection', 'router', 'lan', 'ethernet'],
    department: 'IT',
    confidence: 0.95,
  },
  {
    keywords: ['attendance', 'absent', 'present', 'leave', 'holiday'],
    department: 'ExamCell',
    confidence: 0.9,
  },
  {
    keywords: ['hostel', 'room', 'mess', 'dormitory', 'accommodation'],
    department: 'Hostel',
    confidence: 0.95,
  },
  {
    keywords: ['fee', 'payment', 'tuition', 'scholarship', 'refund', 'money'],
    department: 'Accounts',
    confidence: 0.9,
  },
  {
    keywords: ['book', 'library', 'borrow', 'return', 'journal'],
    department: 'Library',
    confidence: 0.9,
  },
  {
    keywords: ['exam', 'test', 'result', 'grade', 'marks', 'paper'],
    department: 'ExamCell',
    confidence: 0.85,
  },
  {
    keywords: ['certificate', 'bonafide', 'transcript', 'degree'],
    department: 'Admin',
    confidence: 0.85,
  },
  {
    keywords: ['lab', 'computer', 'software', 'printer', 'projector'],
    department: 'IT',
    confidence: 0.8,
  },
]

/**
 * Route complaint using keyword rules
 */
function routeComplaint(text) {
  if (!text || typeof text !== 'string') {
    return {
      department: 'NeedsTriage',
      confidence: 0,
      method: 'rule',
    }
  }

  const lowerText = text.toLowerCase()
  let bestMatch = null
  let maxScore = 0

  // Check each rule
  for (const rule of routingRules) {
    let matchCount = 0
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on keyword matches
      const matchRatio = matchCount / rule.keywords.length
      const score = rule.confidence * matchRatio

      if (score > maxScore) {
        maxScore = score
        bestMatch = {
          department: rule.department,
          confidence: Math.min(score, 0.99),
          method: 'rule',
          matchedKeywords: rule.keywords.filter((k) =>
            lowerText.includes(k.toLowerCase())
          ),
        }
      }
    }
  }

  // If confidence is too low, mark for manual triage
  if (!bestMatch || bestMatch.confidence < 0.5) {
    return {
      department: 'NeedsTriage',
      confidence: bestMatch ? bestMatch.confidence : 0,
      method: 'rule',
    }
  }

  return bestMatch
}

/**
 * Get department assignment mapping
 */
function getDepartmentAssignment(department) {
  // In production, this would query a database of department assignments
  const assignments = {
    IT: 'it@college.edu',
    ExamCell: 'examcell@college.edu',
    Hostel: 'hostel@college.edu',
    Accounts: 'accounts@college.edu',
    Library: 'library@college.edu',
    Admin: 'admin@college.edu',
  }

  return assignments[department] || null
}

module.exports = {
  routeComplaint,
  getDepartmentAssignment,
}

