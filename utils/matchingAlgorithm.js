/**
 * Smart Matching Algorithm
 * 
 * Scores volunteer-to-need matches based on multiple weighted factors:
 * - Category preference match (35 points)
 * - Relevant skills (up to 45 points)
 * - Geographic proximity (20 points)
 * - Urgency bonus (10 points)
 * - Experience bonus (10 points)
 * - Availability bonus (8 points)
 * - Rating bonus (up to 10 points)
 */

// Skill-to-category mapping for relevance scoring
const CATEGORY_SKILL_MAP = {
  healthcare: ['medical', 'nursing', 'first aid', 'cpr', 'nutrition', 'diet', 'health', 'diagnostics', 'paramedic', 'pharmacy'],
  education: ['teaching', 'tutoring', 'mentoring', 'mathematics', 'science', 'computer literacy', 'literacy', 'curriculum', 'training'],
  food: ['cooking', 'food safety', 'management', 'logistics', 'nutrition', 'distribution', 'warehouse', 'supply chain'],
  shelter: ['construction', 'plumbing', 'electrical', 'carpentry', 'building', 'architecture', 'engineering', 'painting'],
  environment: ['gardening', 'environmental', 'ecology', 'recycling', 'waste management', 'conservation', 'botany'],
  elderly: ['nursing', 'counseling', 'art therapy', 'companionship', 'caregiving', 'patience', 'communication'],
  youth: ['teaching', 'mentoring', 'art therapy', 'counseling', 'coaching', 'leadership', 'recreation'],
  disaster: ['fire safety', 'rescue', 'first aid', 'construction', 'emergency', 'evacuation', 'logistics', 'coordination']
};

/**
 * Calculate match score between a volunteer and a need
 */
function calculateMatchScore(volunteer, need) {
  const result = {
    score: 0,
    maxScore: 100,
    reasons: [],
    breakdown: {}
  };

  // 1. CATEGORY PREFERENCE MATCH (35 points)
  if (volunteer.preferredCategories && volunteer.preferredCategories.includes(need.category)) {
    result.score += 35;
    result.breakdown.categoryMatch = 35;
    result.reasons.push(`Prefers ${need.category} work (+35)`);
  } else {
    result.breakdown.categoryMatch = 0;
  }

  // 2. SKILL RELEVANCE (up to 45 points, 15 per relevant skill, max 3)
  const relevantSkills = CATEGORY_SKILL_MAP[need.category] || [];
  const matchedSkills = volunteer.skills.filter(skill =>
    relevantSkills.some(rs => skill.toLowerCase().includes(rs) || rs.includes(skill.toLowerCase()))
  );

  if (matchedSkills.length > 0) {
    const skillPoints = Math.min(matchedSkills.length * 15, 45);
    result.score += skillPoints;
    result.breakdown.skillMatch = skillPoints;
    result.reasons.push(`${matchedSkills.length} relevant skill(s): ${matchedSkills.join(', ')} (+${skillPoints})`);
  } else {
    result.breakdown.skillMatch = 0;
  }

  // 3. GEOGRAPHIC PROXIMITY (20 points)
  if (volunteer.region === need.region || need.region === 'All Zones') {
    result.score += 20;
    result.breakdown.locationMatch = 20;
    result.reasons.push(`Same region: ${need.region} (+20)`);
  } else {
    result.breakdown.locationMatch = 0;
  }

  // 4. URGENCY BONUS (10 points for critical/high)
  if (need.urgency === 'critical') {
    result.score += 10;
    result.breakdown.urgencyBonus = 10;
    result.reasons.push('Critical priority need (+10)');
  } else if (need.urgency === 'high') {
    result.score += 5;
    result.breakdown.urgencyBonus = 5;
    result.reasons.push('High priority need (+5)');
  } else {
    result.breakdown.urgencyBonus = 0;
  }

  // 5. EXPERIENCE BONUS (up to 10 points)
  if (volunteer.tasksCompleted > 30) {
    result.score += 10;
    result.breakdown.experience = 10;
    result.reasons.push('Highly experienced (30+ tasks) (+10)');
  } else if (volunteer.tasksCompleted > 15) {
    result.score += 7;
    result.breakdown.experience = 7;
    result.reasons.push('Experienced volunteer (15+ tasks) (+7)');
  } else if (volunteer.tasksCompleted > 5) {
    result.score += 4;
    result.breakdown.experience = 4;
    result.reasons.push('Has prior experience (+4)');
  } else {
    result.breakdown.experience = 0;
  }

  // 6. AVAILABILITY BONUS (up to 8 points)
  const availabilityScores = {
    'full-time': 8,
    'flexible': 6,
    'part-time': 4,
    'weekends': 2
  };
  const availScore = availabilityScores[volunteer.availability] || 0;
  result.score += availScore;
  result.breakdown.availability = availScore;
  if (availScore > 0) {
    result.reasons.push(`${volunteer.availability} availability (+${availScore})`);
  }

  // 7. RATING BONUS (up to 10 points)
  if (volunteer.rating > 0) {
    const ratingScore = Math.round(volunteer.rating * 2);
    result.score += ratingScore;
    result.breakdown.rating = ratingScore;
    result.reasons.push(`Rating: ${volunteer.rating}/5 (+${ratingScore})`);
  } else {
    result.breakdown.rating = 0;
  }

  // Cap the score at maxScore
  result.score = Math.min(result.score, result.maxScore);

  return result;
}

/**
 * Find best matches for a specific need
 */
function findMatchesForNeed(need, volunteers, options = {}) {
  const {
    minScore = 30,
    maxResults = 10,
    onlyAvailable = true
  } = options;

  // Filter eligible volunteers
  let eligibleVolunteers = volunteers;
  
  if (onlyAvailable) {
    eligibleVolunteers = eligibleVolunteers.filter(v => v.status === 'active');
  }

  // Calculate scores
  const matches = eligibleVolunteers
    .map(volunteer => {
      const matchResult = calculateMatchScore(volunteer, need);
      return {
        volunteer,
        need,
        score: matchResult.score,
        reasons: matchResult.reasons,
        breakdown: matchResult.breakdown
      };
    })
    .filter(match => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return matches;
}

/**
 * Find best matches for all open needs
 */
function findAllMatches(needs, volunteers, options = {}) {
  const {
    minScore = 30,
    maxPerNeed = 5,
    onlyAvailable = true,
    onlyUnderstaffed = true
  } = options;

  // Filter needs
  let eligibleNeeds = needs;
  
  if (onlyUnderstaffed) {
    eligibleNeeds = eligibleNeeds.filter(n => 
      n.volunteersAssigned < n.volunteersNeeded && n.status !== 'resolved'
    );
  }

  const allMatches = [];

  for (const need of eligibleNeeds) {
    const matches = findMatchesForNeed(need, volunteers, {
      minScore,
      maxResults: maxPerNeed,
      onlyAvailable
    });
    allMatches.push(...matches);
  }

  // Sort by score descending
  allMatches.sort((a, b) => b.score - a.score);

  return allMatches;
}

/**
 * Get matching statistics
 */
function getMatchingStats(matches) {
  if (matches.length === 0) {
    return {
      totalMatches: 0,
      averageScore: 0,
      highConfidence: 0, // score >= 70
      mediumConfidence: 0, // score >= 50
      lowConfidence: 0, // score < 50
      categoryBreakdown: {}
    };
  }

  const scores = matches.map(m => m.score);
  const stats = {
    totalMatches: matches.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / matches.length),
    highConfidence: matches.filter(m => m.score >= 70).length,
    mediumConfidence: matches.filter(m => m.score >= 50 && m.score < 70).length,
    lowConfidence: matches.filter(m => m.score < 50).length,
    categoryBreakdown: {}
  };

  // Breakdown by category
  matches.forEach(match => {
    const cat = match.need.category;
    stats.categoryBreakdown[cat] = (stats.categoryBreakdown[cat] || 0) + 1;
  });

  return stats;
}

module.exports = {
  calculateMatchScore,
  findMatchesForNeed,
  findAllMatches,
  getMatchingStats,
  CATEGORY_SKILL_MAP
};
