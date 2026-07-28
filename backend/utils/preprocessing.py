def clean_text(text: str):

    if text is None:
        return ""

    return text.strip().lower()