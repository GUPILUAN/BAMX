class AuthResponse:
    def __init__(self, access: str, refresh: str | None = None):
        self.access = access
        self.refresh = refresh
