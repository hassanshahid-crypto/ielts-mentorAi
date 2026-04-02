"""
Auto difficulty progression system.

Rules:
- Must complete at least 1 writing, 1 speaking, and 1 reading test
- Average band score >= 6.5 → promote to next level
- beginner → intermediate → pro (pro is max)
"""

LEVEL_ORDER = ['beginner', 'intermediate', 'pro']
REQUIRED_PER_TYPE = 1
PROMOTION_THRESHOLD = 6.5


def get_progress(user):
    """Get detailed progress info for a student."""
    if user.role != 'student':
        return None

    from writing.models import WritingTest
    from speaking.models import SpeakingTest
    from reading.models import ReadingTest

    current_level = user.difficulty_level
    is_max = current_level == 'pro'
    current_index = LEVEL_ORDER.index(current_level)
    next_level = LEVEL_ORDER[current_index + 1] if not is_max else None

    writing_tests = WritingTest.objects.filter(user=user, status='evaluated')
    speaking_tests = SpeakingTest.objects.filter(user=user, status='evaluated')
    reading_tests = ReadingTest.objects.filter(user=user, status='completed')

    writing_count = writing_tests.count()
    speaking_count = speaking_tests.count()
    reading_count = reading_tests.count()
    total_tests = writing_count + speaking_count + reading_count

    # Calculate scores per type
    writing_scores = [wt.feedback.overall_band for wt in writing_tests if hasattr(wt, 'feedback') and wt.feedback]
    speaking_scores = [st.feedback.overall_band for st in speaking_tests if hasattr(st, 'feedback') and st.feedback]
    reading_scores = [rt.score for rt in reading_tests if rt.score > 0]

    writing_avg = round(sum(writing_scores) / len(writing_scores), 1) if writing_scores else 0
    speaking_avg = round(sum(speaking_scores) / len(speaking_scores), 1) if speaking_scores else 0
    reading_avg = round(sum(reading_scores) / len(reading_scores), 1) if reading_scores else 0

    all_scores = writing_scores + speaking_scores + reading_scores
    overall_avg = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0

    # Check requirements
    writing_done = writing_count >= REQUIRED_PER_TYPE
    speaking_done = speaking_count >= REQUIRED_PER_TYPE
    reading_done = reading_count >= REQUIRED_PER_TYPE
    all_types_done = writing_done and speaking_done and reading_done
    score_met = overall_avg >= PROMOTION_THRESHOLD

    return {
        'current_level': current_level,
        'next_level': next_level,
        'is_max_level': is_max,
        'overall_avg': overall_avg,
        'threshold': PROMOTION_THRESHOLD,
        'required_per_type': REQUIRED_PER_TYPE,
        'writing': {'count': writing_count, 'required': REQUIRED_PER_TYPE, 'done': writing_done, 'avg': writing_avg},
        'speaking': {'count': speaking_count, 'required': REQUIRED_PER_TYPE, 'done': speaking_done, 'avg': speaking_avg},
        'reading': {'count': reading_count, 'required': REQUIRED_PER_TYPE, 'done': reading_done, 'avg': reading_avg},
        'all_types_done': all_types_done,
        'score_met': score_met,
        'ready_to_promote': all_types_done and score_met and not is_max,
        'total_tests': total_tests,
    }


def check_and_promote(user):
    """Check if user should be promoted and do it if ready."""
    progress = get_progress(user)
    if not progress:
        return None

    if progress['ready_to_promote']:
        previous_level = progress['current_level']
        new_level = progress['next_level']
        user.difficulty_level = new_level
        user.save()
        return {
            'promoted': True,
            'previous_level': previous_level,
            'new_level': new_level,
            'avg_score': progress['overall_avg'],
            'total_tests': progress['total_tests'],
            **progress,
        }

    return {
        'promoted': False,
        **progress,
    }
