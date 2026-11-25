"""Survey questionnaire mapping service.

Translates questionnaire answer options from the frontend into the exact numeric
features required by the scikit-learn model, based on verified dataset distributions.
"""

from typing import Any, Dict, List, Union


# 1. Study hours outside class
# Options: 'Less than 1 hour', '1–2 hours', '2–4 hours', '4–6 hours', 'More than 6 hours'
# Note: en-dash '–' and standard hyphen '-' supported
STUDY_HOURS_MAP: Dict[str, float] = {
    "less than 1 hour": 0.5,
    "< 1 hour": 0.5,
    "1–2 hours": 1.5,
    "1-2 hours": 1.5,
    "2–4 hours": 3.0,
    "2-4 hours": 3.0,
    "4–6 hours": 5.0,
    "4-6 hours": 5.0,
    "more than 6 hours": 6.5,
    "> 6 hours": 6.5,
}

# 2. Academic tasks weekly
# Options: '0–2', '3–5', '6–8', '9–12', 'More than 12'
ACADEMIC_TASKS_MAP: Dict[str, float] = {
    "0–2": 1.0,
    "0-2": 1.0,
    "3–5": 4.0,
    "3-5": 4.0,
    "6–8": 7.0,
    "6-8": 7.0,
    "9–12": 10.5,
    "9-12": 10.5,
    "more than 12": 14.0,
    "> 12": 14.0,
}

# 3. Nightly sleep hours
# Options: 'Less than 5 hours', '5–6 hours', '6–7 hours', '7–8 hours', 'More than 8 hours'
SLEEP_HOURS_MAP: Dict[str, float] = {
    "less than 5 hours": 4.5,
    "< 5 hours": 4.5,
    "5–6 hours": 5.5,
    "5-6 hours": 5.5,
    "6–7 hours": 6.5,
    "6-7 hours": 6.5,
    "7–8 hours": 7.5,
    "7-8 hours": 7.5,
    "more than 8 hours": 8.5,
    "> 8 hours": 8.5,
}

# 4. Weekly physical activity days
# Options: '0 days', '1–2 days', '3–4 days', '5–6 days', 'Every day'
PHYSICAL_ACTIVITY_MAP: Dict[str, float] = {
    "0 days": 0.0,
    "1–2 days": 1.5,
    "1-2 days": 1.5,
    "3–4 days": 3.5,
    "3-4 days": 3.5,
    "5–6 days": 5.5,
    "5-6 days": 5.5,
    "every day": 7.0,
    "7 days": 7.0,
}

# 5. Standard 5-point Likert scale (1 to 5)
# Options: 'Never', 'Rarely', 'Sometimes', 'Often', 'Very often'
LIKERT_5_MAP: Dict[str, int] = {
    "never": 1,
    "rarely": 2,
    "sometimes": 3,
    "often": 4,
    "very often": 5,
}


def _clean_str(val: Any) -> str:
    """Normalize string input: strip whitespace and lowercase."""
    if val is None:
        return ""
    return str(val).strip().lower()


def extract_selected_option(answer: Any) -> str:
    """
    Extract the single chosen option string from various frontend response formats:
    - Pydantic QuestionnaireAnswerState (selected=['...'])
    - dict {'selected': ['Often'], 'otherText': '', 'textValue': ''}
    - string 'Often'
    - list ['Often']
    """
    if answer is None:
        return ""
    if hasattr(answer, "selected"):
        selected = getattr(answer, "selected", [])
        if isinstance(selected, list) and len(selected) > 0:
            return str(selected[0])
        text_val = getattr(answer, "textValue", "")
        if text_val:
            return str(text_val)
        return ""
    if isinstance(answer, dict):
        selected = answer.get("selected", [])
        if isinstance(selected, list) and len(selected) > 0:
            return str(selected[0])
        if "textValue" in answer and answer["textValue"]:
            return str(answer["textValue"])
        return ""
    if isinstance(answer, list):
        if len(answer) > 0:
            return str(answer[0])
        return ""
    return str(answer)


def map_questionnaire_to_features(responses: Dict[str, Any]) -> Dict[str, float]:
    """
    Map questionnaire response items to the 9 model features.

    Parameters
    ----------
    responses : dict
        Keyed by questionnaire question ID (e.g. 'study_hours_outside_classes')

    Returns
    -------
    dict
        Dictionary of the 9 numerical features ready for ModelService.predict().
    """
    features: Dict[str, float] = {}

    # 1. Study hours outside classes
    raw_study = extract_selected_option(
        responses.get("study_hours_outside_classes")
        or responses.get("study_hours_outside_classes_per_day")
    )
    norm_study = _clean_str(raw_study)
    if norm_study in STUDY_HOURS_MAP:
        features["study_hours_outside_classes_per_day"] = STUDY_HOURS_MAP[norm_study]
    else:
        try:
            features["study_hours_outside_classes_per_day"] = float(raw_study)
        except ValueError:
            raise ValueError(
                f"Invalid answer for study hours: '{raw_study}'. "
                f"Expected one of: {list(STUDY_HOURS_MAP.keys())} or a numeric float."
            )

    # 2. Academic tasks weekly
    raw_tasks = extract_selected_option(
        responses.get("academic_tasks_weekly")
        or responses.get("academic_tasks_per_week")
    )
    norm_tasks = _clean_str(raw_tasks)
    if norm_tasks in ACADEMIC_TASKS_MAP:
        features["academic_tasks_per_week"] = ACADEMIC_TASKS_MAP[norm_tasks]
    else:
        try:
            features["academic_tasks_per_week"] = float(raw_tasks)
        except ValueError:
            raise ValueError(
                f"Invalid answer for academic tasks: '{raw_tasks}'. "
                f"Expected one of: {list(ACADEMIC_TASKS_MAP.keys())} or an integer/float."
            )

    # 3. Perceived academic workload (Rating 1-5)
    raw_workload = extract_selected_option(
        responses.get("perceived_academic_workload")
        or responses.get("academic_workload")
    )
    norm_workload = _clean_str(raw_workload)
    if norm_workload in LIKERT_5_MAP:
        workload_val = LIKERT_5_MAP[norm_workload]
    else:
        try:
            workload_val = int(float(raw_workload))
        except ValueError:
            raise ValueError(
                f"Invalid answer for academic workload: '{raw_workload}'. "
                f"Expected one of: {list(LIKERT_5_MAP.keys())} or an integer (1-5)."
            )
    features["academic_workload"] = workload_val

    # 4. Time pressure (Rating 1-5)
    raw_tp = extract_selected_option(responses.get("time_pressure"))
    norm_tp = _clean_str(raw_tp)
    if norm_tp:
        if norm_tp in LIKERT_5_MAP:
            features["time_pressure"] = LIKERT_5_MAP[norm_tp]
        else:
            try:
                features["time_pressure"] = int(float(raw_tp))
            except ValueError:
                features["time_pressure"] = workload_val
    else:
        features["time_pressure"] = workload_val

    # 5. Nightly sleep hours
    raw_sleep = extract_selected_option(
        responses.get("nightly_sleep_hours")
        or responses.get("avg_sleep_hours")
    )
    norm_sleep = _clean_str(raw_sleep)
    if norm_sleep in SLEEP_HOURS_MAP:
        features["avg_sleep_hours"] = SLEEP_HOURS_MAP[norm_sleep]
    else:
        try:
            features["avg_sleep_hours"] = float(raw_sleep)
        except ValueError:
            raise ValueError(
                f"Invalid answer for sleep hours: '{raw_sleep}'. "
                f"Expected one of: {list(SLEEP_HOURS_MAP.keys())} or a numeric float."
            )

    # 6. Wakes up tired
    raw_tired = extract_selected_option(
        responses.get("frequency_waking_tired")
        or responses.get("wakes_up_tired")
    )
    norm_tired = _clean_str(raw_tired)
    if norm_tired in LIKERT_5_MAP:
        features["wakes_up_tired"] = LIKERT_5_MAP[norm_tired]
    else:
        try:
            features["wakes_up_tired"] = int(float(raw_tired))
        except ValueError:
            raise ValueError(
                f"Invalid answer for waking tired: '{raw_tired}'. "
                f"Expected one of: {list(LIKERT_5_MAP.keys())} or an integer (1-5)."
            )

    # 7. Weekly physical activity
    raw_activity = extract_selected_option(
        responses.get("weekly_physical_activity")
        or responses.get("physical_activity_days_per_week")
    )
    norm_activity = _clean_str(raw_activity)
    if norm_activity in PHYSICAL_ACTIVITY_MAP:
        features["physical_activity_days_per_week"] = PHYSICAL_ACTIVITY_MAP[norm_activity]
    else:
        try:
            features["physical_activity_days_per_week"] = float(raw_activity)
        except ValueError:
            raise ValueError(
                f"Invalid answer for physical activity: '{raw_activity}'. "
                f"Expected one of: {list(PHYSICAL_ACTIVITY_MAP.keys())} or a number (0-7)."
            )

    # 8. Difficulty concentrating
    raw_conc = extract_selected_option(responses.get("difficulty_concentrating"))
    norm_conc = _clean_str(raw_conc)
    if norm_conc in LIKERT_5_MAP:
        features["difficulty_concentrating"] = LIKERT_5_MAP[norm_conc]
    else:
        try:
            features["difficulty_concentrating"] = int(float(raw_conc))
        except ValueError:
            raise ValueError(
                f"Invalid answer for difficulty concentrating: '{raw_conc}'. "
                f"Expected one of: {list(LIKERT_5_MAP.keys())} or an integer (1-5)."
            )

    # 9. Academic emotional exhaustion
    raw_exhaustion = extract_selected_option(
        responses.get("mental_emotional_exhaustion")
        or responses.get("academic_emotional_exhaustion")
    )
    norm_exhaustion = _clean_str(raw_exhaustion)
    if norm_exhaustion in LIKERT_5_MAP:
        features["academic_emotional_exhaustion"] = LIKERT_5_MAP[norm_exhaustion]
    else:
        try:
            features["academic_emotional_exhaustion"] = int(float(raw_exhaustion))
        except ValueError:
            raise ValueError(
                f"Invalid answer for emotional exhaustion: '{raw_exhaustion}'. "
                f"Expected one of: {list(LIKERT_5_MAP.keys())} or an integer (1-5)."
            )

    return features
