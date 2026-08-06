def generate_recommendation(status):

    if status in {"Trusted", "Genuine"}:

        return [
            "No action required.",
            "Continue monitoring periodically."
        ]

    elif status == "Suspicious":

        return [
            "Verify the user's identity manually.",
            "Request additional verification.",
            "Monitor future activities."
        ]

    return [
        "Immediately report the cloned profile.",
        "Block the suspicious account.",
        "Enable two-factor authentication.",
        "Inform affected users.",
        "Review profile ownership manually."
    ]